import * as THREE from "three";
import {NetherBladeEntranceEffect} from "../../../animation/card/unit/019_nether_blade/entrance/NetherBladeEntranceEffect";
import {NetherBladeFirstPassiveEffect} from "../../../animation/card/unit/019_nether_blade/skill/NetherBladeFirstPassiveEffect";
import {NetherBladeSecondPassiveEffect} from "../../../animation/card/unit/019_nether_blade/skill/NetherBladeSecondPassiveEffect";
import {BattleEvent} from "../../../../domain/flow/BattleEvent";
import {
    CardPresentation, CardPresentationContext, DeployedUnit, PickTarget,
} from "../../CardPresentation";

// 마검의 지배자 네더 블레이드 — 유닛 카드다. 필드에 내면 패시브 둘이 이어진다.
//
//   첫 패시브 : 상대 유닛 전부를 친다. 본체는 안 친다
//   둘째 패시브: 남은 것 중 하나를 사용자가 골라 친다
//
// 같은 사슬이 **필드에 낼 때 한 번, 그 뒤로 내 턴이 시작될 때마다** 돈다. 그래서 낼 때와
// 턴 시작 때가 같은 것을 부른다.
//
// 첫 패시브가 끝난 결과를 보고 골라야 하므로, 연출을 기다린 뒤에 전투로 보낸다. 명령이
// 둘로 나뉘어 있는 이유가 이것이다 (R2-105).

// 단계 사이의 쉼. 사용자가 바뀐 필드를 읽을 틈을 준다.
const PHASE_SETTLE_MS = 450;

export const NetherBladePresentation: CardPresentation = {
    cardId: 19,

    async onDeploy(ctx: CardPresentationContext, unit: DeployedUnit): Promise<void> {
        // 나오는 연출. 낼 때만 돈다 — 턴 시작 때는 안 돈다.
        const entrance = ctx.createEffect((scene) => new NetherBladeEntranceEffect(scene));
        await ctx.whileResolving(() => ctx.whileRunning(
            entrance, () => entrance.play(ctx.canvasElement),
        ));
        if (ctx.isAborted()) return;
        await runPassiveChain(ctx, unit);
    },

    async onTurnStart(ctx: CardPresentationContext, unit: DeployedUnit): Promise<void> {
        await runPassiveChain(ctx, unit);
    },
};

// 패시브 사슬. 낼 때와 턴 시작 때가 같은 것을 쓴다.
async function runPassiveChain(
    ctx: CardPresentationContext, unit: DeployedUnit,
): Promise<void> {
    const events = await ctx.whileResolving(() => runFirstPassive(ctx, unit));
    // 모래시계가 끝나 턴이 넘어갔으면 고르기로 들어가지 않는다.
    if (ctx.isAborted()) return;
    await waitForSecondPassivePick(ctx, unit, events);
}

// 첫 패시브 — 상대 유닛 전부를 친다. 본체는 안 친다.
async function runFirstPassive(
    ctx: CardPresentationContext, unit: DeployedUnit,
): Promise<readonly BattleEvent[]> {
    // 한 박자 쉰다. 방금 떨어뜨린 카드의 줄 세우기가 끝난 뒤에 자리를 재야 한다.
    await Promise.resolve();

    // 칠 자리를 **움직이기 전에** 적어 둔다. 지금 서 있는 자리로 검풍이 날아간다.
    const targets: THREE.Vector3[] = [];
    for (const battleCardId of ctx.view.opponentAliveIds()) {
        if (!ctx.opponentField.isUnitVisible(battleCardId)) continue;
        const at = ctx.opponentField.unitWorldPosition(battleCardId);
        if (at) targets.push(new THREE.Vector3(at.x, at.y, 0));
    }

    await ctx.skillTrip.play(unit.group, async (panelPosition) => {
        if (targets.length === 0) {
            // 칠 것이 없으면 잠깐 서 있기만 한다.
            await new Promise<void>((r) => setTimeout(r, 300));
            return;
        }
        // 검풍과 조각나는 그림이 화면 전체를 가로지른다. 상대 줄만이 아니다.
        const effect = ctx.createEffect((scene) => new NetherBladeFirstPassiveEffect(scene));
        await ctx.whileRunning(effect, () => ctx.withEffectGear((gear) => effect.play(
            panelPosition, targets, ctx.canvasElement,
            () => { /* 한 번 베일 때마다의 소리 자리 */ },
            gear.renderer, gear.camera,
        )));
    });

    // 때리는 것과 둘째 패시브를 기다리기 시작하는 것은 전투가 한다.
    //
    // 연출을 기다린 뒤에 보내는 이유는, 첫 패시브가 끝난 결과를 보고 골라야 하기 때문이다.
    const events = ctx.send({type: 'triggerDeployPassive', battleCardId: unit.battleCardId});

    // 따라붙은 것은 전투가 이미 붙였다. 여기서는 그린다.
    ctx.showCarriedStatus(events);

    const dead: number[] = [];
    for (const ev of events) {
        if (ev.type === 'damaged' && ev.target.kind === 'unit') {
            console.log(`[nether-blade] AoE → opponent idx=${ev.target.battleCardId} ${ev.hpBefore} → ${ev.hpAfter}`);
        } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
            dead.push(ev.target.battleCardId);
        }
    }
    for (const battleCardId of dead) ctx.opponentField.hideUnit(battleCardId);
    if (dead.length > 0) ctx.opponentField.reflow();

    // 바뀐 필드를 읽을 틈. 이것이 없으면 첫 패시브의 피해가 둘째 패시브에 묻힌다.
    await new Promise<void>((r) => setTimeout(r, PHASE_SETTLE_MS));
    return events;
}

// 둘째 패시브 — 남은 것 중 하나를 사용자가 골라 친다.
function waitForSecondPassivePick(
    ctx: CardPresentationContext,
    unit: DeployedUnit,
    firstPassiveEvents: readonly BattleEvent[],
): Promise<void> {
    return new Promise<void>((done) => {
        // 칠 것이 있는지, 고르라고 기다리는지는 전투가 정한다. 첫 패시브가 돌려준 일어난
        // 일에 [묻기 시작했다] 가 없으면 물을 것이 없다는 뜻이다.
        const started = firstPassiveEvents.some((ev) => ev.type === 'choiceStarted');
        if (!started) {
            console.log('[nether-blade] passive 2 → no valid targets, skipped');
            done();
            return;
        }

        ctx.picking.begin({
            pickable: 'opponentUnitOrMaster',
            onPick: (target) => void ctx.whileResolving(
                () => resolveSecondPassive(ctx, unit, target, done),
            ),
            onCancel: () => {
                ctx.picking.clearPickable();
                ctx.picking.end();
                done();
            },
        });
        ctx.picking.markPickable();
        console.log('[nether-blade] passive 2 → choose opponent unit or master (red highlights)');
    });
}

async function resolveSecondPassive(
    ctx: CardPresentationContext,
    unit: DeployedUnit,
    target: PickTarget,
    done: () => void,
): Promise<void> {
    // 테두리와 고르기를 먼저 닫는다. 아래에서 기다리는 동안 또 눌리면 안 된다.
    ctx.picking.clearPickable();
    ctx.picking.end();

    // 고른 것이 지금 서 있는 자리를 **베기 전에** 적어 둔다.
    const at = target.kind === 'opponentMaster'
        ? (ctx.view.isOpponentMasterAlive() ? ctx.opponentMaster.worldPosition() : null)
        : (ctx.opponentField.isUnitVisible(target.entry.cardIndex)
            ? ctx.opponentField.unitWorldPosition(target.entry.cardIndex)
            : null);
    const targetWorld = at ? new THREE.Vector3(at.x, at.y, 0) : null;

    // 조각낼 대상. 본체는 보이지 않는 판이라 찢을 그림이 없으므로 안 넘긴다.
    const ripGroup = target.kind === 'opponentUnit' ? target.entry.group : null;

    // 죽는 일격인지 **연출 전에** 묻는다. 죽는 일격이면 갈라진 카드를 안 되돌려서 조각이
    // 흩어진 자리가 그대로 사망이 된다. 연출 뒤에 알면 되살아났다가 사라져 깜빡인다 (R2-105).
    const lethal = target.kind === 'opponentUnit'
        && ctx.view.wouldDefeat({
            kind: 'opponentUnit', battleCardId: target.entry.cardIndex,
        });

    await ctx.skillTrip.play(unit.group, async () => {
        if (!targetWorld) {
            await new Promise<void>((r) => setTimeout(r, 300));
            return;
        }
        // 모으고 멈추는 것은 첫 패시브와 같고, 그 뒤로 화면 전체를 가로지르는 검풍이 날아간
        // 다음 고른 카드로 모여들어 그 카드를 조각낸다.
        const effect = ctx.createEffect((scene) => new NetherBladeSecondPassiveEffect(scene));
        await ctx.whileRunning(effect, () => ctx.withEffectGear((gear) => effect.play(
            targetWorld, ripGroup, ctx.canvasElement,
            gear.renderer, gear.camera, undefined, lethal,
        )));
    });

    // 고른 것을 전투에 보낸다. 때리는 것도 쓰러뜨리는 것도 전투가 한다.
    const events = ctx.send({
        type: 'pickChoiceTarget',
        pick: target.kind === 'opponentMaster'
            ? {kind: 'opponentMaster'}
            : {kind: 'opponentUnit', battleCardId: target.entry.cardIndex},
    });

    ctx.showCarriedStatus(events);

    for (const ev of events) {
        if (ev.type === 'damaged' && ev.target.kind === 'opponentMaster') {
            ctx.opponentMaster.setHp(ev.hpAfter);
            console.log(`[nether-blade] passive 2 → MASTER ${ev.hpBefore} → ${ev.hpAfter}`);
        } else if (ev.type === 'damaged' && ev.target.kind === 'unit') {
            console.log(`[nether-blade] passive 2 → opponent idx=${ev.target.battleCardId} ${ev.hpBefore} → ${ev.hpAfter}`);
        } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
            ctx.opponentMaster.hide();
            console.log('[nether-blade] opponent MASTER defeated by passive 2!');
        } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
            ctx.opponentField.hideUnit(ev.target.battleCardId);
            ctx.opponentField.reflow();
        }
    }

    // 첫 패시브와 같은 쉼. 다음 네더 블레이드가 스킬 자리로 나가기 전에 이번 결과가 보여야 한다.
    await new Promise<void>((r) => setTimeout(r, PHASE_SETTLE_MS));
    done();
}
