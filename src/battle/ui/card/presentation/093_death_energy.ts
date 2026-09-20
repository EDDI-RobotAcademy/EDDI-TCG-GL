import * as THREE from "three";
import {OverflowMoraleEffect} from "../../animation/card/support/002_overflow_morale/OverflowMoraleEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../CardPresentation";

// 죽음의 에너지 — 손패에서 아군 유닛에게 바로 붙인다. 필드 에너지를 안 쓴다.
//
// 연출은 넘쳐 흐르는 사기의 [모여서 부딪힌다] 를 그대로 쓴다. 덱에서 날아오는 것과 손에서
// 바로 붙이는 것이 같은 박자로 보여야 한다.
//
// 카드는 바로 치운다. 손패가 먼저 줄을 다시 서고 연출은 그 뒤에 끝난다. 숫자가 오르는 것은
// 부딪히는 순간에 맞춘다.
export const DeathEnergyPresentation: CardPresentation = {
    cardId: 93,
    dropTarget: 'allyUnit',
    onDrop: attachEnergyToAlly('death-energy', false),
};

// 죽음의 에너지와 암흑 에너지가 같은 꼴이다. 다른 점은 마크를 붙이는지 하나뿐이다.
export function attachEnergyToAlly(logName: string, coldDark: boolean) {
    return (
        ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit,
    ): boolean => {
        if (hit.kind !== 'allyUnit') return false;
        const target = hit.entry;

        // 붙이는 것도 카드를 무덤으로 보내는 것도 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: target.cardIndex,
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        const targetWorld = new THREE.Vector3(
            target.group.position.x, target.group.position.y, 5,
        );
        const effect = ctx.createEffect((scene) => new OverflowMoraleEffect(scene));
        void ctx.whileRunning(effect, () => effect.playDirectAttach(targetWorld, () => {
            const attached = events.find((ev) => ev.type === 'energyAttached');
            const count = attached && attached.type === 'energyAttached'
                ? attached.totalAfter
                : ctx.view.yourUnitEnergyCount(target.cardIndex);
            ctx.cardEnergy.setCount(target, count);
            if (coldDark) ctx.cardEnergy.attachColdDarkMarks(target);
            console.log(`[${logName}] attached 1 → placed cardId=${target.card.cardId} total=${count}`);
        }));
        return true;
    };
}
