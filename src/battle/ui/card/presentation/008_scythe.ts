import {ScytheCutEffect} from "../../animation/card/item/008_scythe/ScytheCutEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../CardPresentation";

// 죽음의 낫 — 상대 유닛 하나를 벤다.
//
// 신화 등급이 아니면 즉사하고, 신화면 정해진 만큼만 깎인다. 그 판정은 전투가 하고, 여기서는
// 쓰러졌는지만 보고 갈라진 카드를 되돌릴지 정한다.
export const ScythePresentation: CardPresentation = {
    cardId: 8,
    dropTarget: 'opponentUnit',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'opponentUnit') return false;
        const target = hit.entry;

        // 카드를 쓴다. 피해와 카드 이동은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: target.cardIndex,
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        const damaged = events.find((ev) => ev.type === 'damaged');
        const killing = events.some(
            (ev) => ev.type === 'defeated' && ev.target.kind === 'unit',
        );
        if (damaged && damaged.type === 'damaged') {
            console.log(`[scythe] target cardId=${target.card.cardId} HP: ${damaged.hpBefore} → ${damaged.hpAfter}`);
        }

        const effect = ctx.createEffect((scene) => new ScytheCutEffect(scene));
        void (async () => {
            // 죽는 일격이면 대상을 감추고 갈라진 두 쪽을 날린다. 신화가 버티면 안 갈라지고
            // 어두운 번쩍임만 돈다.
            await ctx.whileRunning(effect, () =>
                effect.play(target.group, target.card.cardId, killing));
            if (killing) {
                ctx.opponentField.reflow();
                console.log(`[scythe] opponent idx=${target.cardIndex} defeated. Remaining: ${ctx.view.opponentAliveCount()}`);
            }
        })();
        return true;
    },
};
