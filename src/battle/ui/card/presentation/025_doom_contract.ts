import {DoomContractEffect} from "../../animation/card/item/025_doom_contract/DoomContractEffect";
import {findCardAbility} from "../../../domain/ability/CardAbility";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../CardPresentation";

// 파멸의 계약 — 상대 필드 전체와 본체를 때리고, 상대 덱 한 장을 로스트 존으로 보낸다.
//
// 상대 필드 영역 안에 떨어뜨려야 한다. 내 필드나 손패 위에 떨어뜨리면 안 쓰이고 돌아간다.
export const DoomContractPresentation: CardPresentation = {
    cardId: 25,
    dropTarget: 'opponentFieldArea',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'area') return false;

        // 카드를 쓴다. 피해와 카드 이동은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnField',
            battleCardId: dropped.battleCardId,
            side: 'opponent',
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        const effect = ctx.createEffect((scene, gear) => new DoomContractEffect(
            scene, gear.renderer, gear.camera, gear.animationLoop,
        ));
        void (async () => {
            // 연출은 [솟아오름 → 흔들림 → 빨아들임 → 터짐 → 사라짐] 순이고 터지는 것이
            // 1.38초쯤에 시작한다. 화면 고치기를 그 순간에 맞춰 두면 번쩍임과 함께 쓰러진다.
            const BOOM_MS = 1380;
            const playing = ctx.whileRunning(effect, () => effect.play());
            setTimeout(() => applyToScreen(ctx, events), BOOM_MS);
            await playing;
        })();
        return true;
    },
};

// 전투가 돌려준 일어난 일을 보고 화면을 고친다. 값은 이미 다 바뀌었다.
function applyToScreen(
    ctx: CardPresentationContext, events: readonly {type: string}[],
): void {
    const damage = findCardAbility(25)?.numbers.damage ?? 0;
    console.log(`[doom-contract] AoE ${damage} dmg to all opponent units + master; opponent deck → opponent lost zone`);

    let anyDefeated = false;
    for (const raw of events) {
        const ev = raw as never as import('../../../domain/flow/BattleEvent').BattleEvent;
        if (ev.type === 'damaged') {
            if (ev.target.kind === 'unit') {
                console.log(`  opponent idx=${ev.target.battleCardId} HP: ${ev.hpBefore} → ${ev.hpAfter}${ev.hpAfter <= 0 ? ' (defeated)' : ''}`);
            } else if (ev.target.kind === 'opponentMaster') {
                ctx.opponentMaster.setHp(ev.hpAfter);
                console.log(`[opponent-master-hp] doom contract → ${ev.hpBefore} → ${ev.hpAfter}`);
            }
        } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
            ctx.opponentField.hideUnit(ev.target.battleCardId);
            anyDefeated = true;
        } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
            ctx.opponentMaster.hide();
        } else if (ev.type === 'cardMoved' && ev.to === 'opponentLostZone') {
            console.log(`  opponent deck → opponent lost zone: cardId ${ev.cardId} (opp deck remaining: ${ctx.view.opponentDeckRemainingCount()})`);
        }
    }
    if (anyDefeated) ctx.opponentField.reflow();
}
