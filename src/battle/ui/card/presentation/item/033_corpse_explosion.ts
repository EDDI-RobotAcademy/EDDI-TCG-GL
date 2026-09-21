import * as THREE from "three";
import {CorpseExplosionEffect} from "../../../animation/card/item/033_corpse_explosion/CorpseExplosionEffect";
import {CardRace} from "../../../../../card/race";
import {BattleEvent} from "../../../../domain/flow/BattleEvent";
import {HandEntry} from "../../../hand/renderer/BattleFieldHandRendererV2";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard, PickTarget,
} from "../../CardPresentation";

// 시체 폭발 — 언데드 아군을 제물로 바치고 적 둘을 골라 때린다.
//
// 언데드 아군 위에 떨어뜨려야 한다. 아군이 아니거나 언데드가 아니면 제자리로 돌아간다.
//
// **떨어뜨린 뒤에 끝나지 않는다.** 사용자가 적 둘을 눌러 골라야 하고, 둘째를 누른 뒤에
// 제물이 날아가 터진다. 같은 적을 두 번 골라도 된다 — 그쪽이 두 번 맞는다.
//
// 제물은 고르는 내내 제자리에 서 있다. 고르다 턴이 넘어가면 아무 일도 안 일어난 것이 된다.
export const CorpseExplosionPresentation: CardPresentation = {
    cardId: 33,
    dropTarget: 'allyUnit',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'allyUnit') return false;
        const sacrificed = hit.entry;

        if (sacrificed.card.raceId !== CardRace.UNDEAD) {
            console.log(`[corpse-explosion] target cardId=${sacrificed.card.cardId} is not UNDEAD — snap back`);
            return false;
        }

        // 제물을 받고 적을 고르라고 기다리기 시작하는 것은 전투가 한다.
        const started = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: sacrificed.cardIndex,
        });
        if (!started.some((ev) => ev.type === 'choiceStarted')) return false;

        console.log(`[corpse-explosion] target locked: undead ally cardId=${sacrificed.card.cardId}. Pick 2 enemy targets — the sacrifice flies after both picks.`);

        // 제물은 아직 안 치운다. 고르는 내내 제자리에 서 있어야 한다.
        const picks: PickTarget[] = [];
        ctx.picking.begin({
            pickable: 'opponentUnitOrMaster',

            onPick: (target) => {
                picks.push(target);

                // 고른 것을 전투에 보낸다. 몇 개를 더 받아야 하는지는 전투가 안다.
                const events = ctx.send({
                    type: 'pickChoiceTarget',
                    pick: target.kind === 'opponentMaster'
                        ? {kind: 'opponentMaster'}
                        : {kind: 'opponentUnit', battleCardId: target.entry.cardIndex},
                });
                const picked = events.find((ev) => ev.type === 'choicePicked');
                const remaining = picked && picked.type === 'choicePicked' ? picked.remaining : 0;
                console.log(`[corpse-explosion] pick ${picks.length} → ${target.kind}, 남은 ${remaining}`);
                if (remaining > 0) return;

                // 다 골랐다. 테두리를 지금 걷는다 — 제물이 날아가기 시작하는 순간에 맞춘다.
                ctx.picking.clearPickable();
                void resolve(ctx, dropped, sacrificed, picks, events);
            },

            onCancel: () => {
                // 고르다 턴이 넘어갔다. 그만두는 것은 전투가 이미 했다.
                ctx.picking.clearPickable();
                ctx.picking.end();
            },
        });
        ctx.picking.markPickable();
        return true;
    },
};

async function resolve(
    ctx: CardPresentationContext,
    dropped: DroppedCard,
    sacrificed: HandEntry,
    picks: readonly PickTarget[],
    events: readonly BattleEvent[],
): Promise<void> {
    // 제물을 줄에서 뺀다. 그림은 제자리에 남겨 두어야 거기서 날아갈 수 있다.
    // 무덤으로 보내는 것은 전투가 이미 했다.
    ctx.yourField.dropFromLineup(sacrificed);
    ctx.hand.reflow();
    console.log(`[corpse-explosion] sacrificed undead cardId=${sacrificed.card.cardId} → tomb; corpse flies now.`);

    // 고른 순서대로 날아갈 자리. 같은 적을 두 번 골랐으면 같은 자리가 두 번 들어간다.
    const projectileTargets = picks.map((pick) => {
        const at = pick.kind === 'opponentMaster'
            ? ctx.opponentMaster.worldPosition()
            : ctx.opponentField.unitWorldPosition(pick.entry.cardIndex);
        return at ? new THREE.Vector3(at.x, at.y, 5) : new THREE.Vector3(0, 0, 5);
    });

    // 제물이 떨어질 자리는 상대 필드 한가운데다.
    const field = ctx.opponentField.bounds();
    const landingPos = new THREE.Vector3(field.centerX, field.centerY, 5);

    // 발이 하나 닿을 때마다 그 발의 결과를 그린다. 값은 전투가 이미 바꿨다.
    //
    // 일어난 일에 담긴 [맞았다] 를 순서대로 쓴다. 본체가 맞은 것과 유닛이 맞은 것이 고른
    // 순서대로 들어 있다.
    const damaged = events.filter(
        (ev) => ev.type === 'damaged',
    ) as Extract<BattleEvent, {type: 'damaged'}>[];

    const onProjectileLand = (index: number): void => {
        const ev = damaged[index];
        if (!ev) return;
        if (ev.target.kind === 'opponentMaster') {
            ctx.opponentMaster.setHp(ev.hpAfter);
            console.log(`[corpse-explosion] projectile → MASTER ${ev.hpBefore} → ${ev.hpAfter}`);
            return;
        }
        if (ev.target.kind !== 'unit') return;
        console.log(`[corpse-explosion] projectile → opponent idx=${ev.target.battleCardId} ${ev.hpBefore} → ${ev.hpAfter}`);
    };

    const effect = ctx.createEffect((scene) => new CorpseExplosionEffect(scene));
    await ctx.whileRunning(effect, () => effect.play(
        sacrificed.group, landingPos, projectileTargets,
        ctx.canvasElement, onProjectileLand,
    ));

    // 연출이 끝났다. 여기부터는 화면 정리만 한다. 무덤과 필드에서 빼는 것은 이미 끝났다.
    //
    // 같은 적을 두 번 골랐을 수 있으므로 겹치지 않게 모아서 본다.
    let masterPicked = false;
    const pickedUnits = new Set<number>();
    for (const pick of picks) {
        if (pick.kind === 'opponentMaster') masterPicked = true;
        else pickedUnits.add(pick.entry.cardIndex);
    }

    let anyDefeated = false;
    for (const battleCardId of pickedUnits) {
        if (ctx.view.isOpponentAlive(battleCardId)) continue;
        if (!ctx.opponentField.isUnitVisible(battleCardId)) continue;
        ctx.opponentField.hideUnit(battleCardId);
        anyDefeated = true;
    }
    if (masterPicked && !ctx.view.isOpponentMasterAlive() && ctx.opponentMaster.isVisible()) {
        ctx.opponentMaster.hide();
        console.log('[corpse-explosion] opponent MASTER defeated!');
    }
    if (anyDefeated) ctx.opponentField.reflow();

    // 제물의 그림을 이제 놓아준다.
    ctx.yourField.disposeUnit(sacrificed);

    // 쓴 카드를 손패에서 치운다. 무덤으로 보낸 것은 전투가 했다.
    ctx.hand.removeCard(dropped.entry, dropped.handIndex);
    ctx.hand.reflow();
    ctx.picking.end();
    console.log('[corpse-explosion] effect resolved — corpse-explosion card → tomb.');
}
