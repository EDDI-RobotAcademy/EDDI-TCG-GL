import * as THREE from "three";
import {OverflowMoraleEffect} from "../../../animation/card/support/002_overflow_morale/OverflowMoraleEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 넘쳐 흐르는 사기 — 덱에서 죽음의 에너지를 찾아 아군 유닛에게 붙인다.
//
// 필드에 선 아군 위에 떨어뜨려야 한다. 덱에 없으면 한 개도 못 붙일 수 있고, 그래도 카드는
// 쓰인다. 카드 설명이 [최대 0~2개] 다.
export const OverflowMoralePresentation: CardPresentation = {
    cardId: 2,
    dropTarget: 'allyUnit',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'allyUnit') return false;
        const target = hit.entry;

        // 덱에서 꺼내고 붙이고 무덤에 넣는 것은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: target.cardIndex,
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        // 화면은 몇 개가 붙었는지만 본다.
        const attachedEvents = events.filter((ev) => ev.type === 'energyAttached');
        console.log(`[overflow-morale] target cardId=${target.card.cardId} → pulled ${attachedEvents.length} death-energy from deck (deck remaining=${ctx.view.yourDeckRemainingCount()})`);

        const deck = ctx.deckWorldPosition();
        const deckPos = new THREE.Vector3(deck.x, deck.y, 5);
        const targetPos = new THREE.Vector3(
            target.group.position.x, target.group.position.y, 5,
        );

        const effect = ctx.createEffect((scene) => new OverflowMoraleEffect(scene));
        void ctx.whileRunning(effect, () => effect.play(
            deckPos, targetPos, attachedEvents.length,
            // 알갱이가 하나 닿을 때마다 앞에서부터 꺼내 쓴다. 붙는 개수를 눈에 보이는
            // 흡수와 맞춘다. 한 개도 못 붙였으면 모으는 기운만 돌고 알갱이는 없다.
            (() => {
                let arrival = 0;
                return () => {
                    const ev = attachedEvents[arrival++];
                    const count = ev && ev.type === 'energyAttached' ? ev.totalAfter : 0;
                    ctx.cardEnergy.setCount(target, count);
                };
            })(),
        ));
        return true;
    },
};
