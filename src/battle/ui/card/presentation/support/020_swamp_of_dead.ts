import * as THREE from "three";
import {SwampEffect} from "../../../animation/card/support/020_swamp/SwampEffect";
import {findCardAbility} from "../../../../domain/ability/CardAbility";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 망자의 늪 — 내 필드에 늪이 깔리고 덱에서 카드를 뽑는다.
//
// 내 필드 영역 안에 떨어뜨려야 한다.
//
// 뽑는 것은 전투가 이미 했다. 화면은 돌려받은 카드 번호로 그린다. 망령 카드가 하나 닿을
// 때마다 그 카드를 손패에 붙인다 — 닿는 것과 손패가 늘어나는 것이 같은 박자여야 한다.
export const SwampOfDeadPresentation: CardPresentation = {
    cardId: 20,
    dropTarget: 'yourFieldArea',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'area') return false;

        // 뽑는 것과 카드 이동은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnField',
            battleCardId: dropped.battleCardId,
            side: 'your',
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        const drawn = events
            .filter((ev) => ev.type === 'cardMoved' && ev.from === 'yourDeck' && ev.to === 'hand')
            .map((ev) => ev as {cardId: number; battleCardId: number});
        if (drawn.length === 0) {
            console.log('[swamp] deck empty — effect skipped');
            return true;
        }

        const drawCount = findCardAbility(20)?.numbers.drawCount ?? drawn.length;
        console.log(`[swamp] drawing ${drawn.length}/${drawCount}: cardIds=${drawn.map((it) => it.cardId).join(',')}`);

        // 늪은 내 필드 네모 위에 깔린다.
        const field = ctx.yourField.bounds();
        const fieldCenter = new THREE.Vector3(field.centerX, field.centerY, 2);

        const deck = ctx.deckWorldPosition();
        const deckPos = new THREE.Vector3(deck.x, deck.y, 2);

        // 망령 카드가 손패 쪽으로 날아온다. 실제로 어디에 놓이는지는 줄 세우기가 정한다.
        const hand = ctx.hand.worldCenter();
        const handDest = new THREE.Vector3(hand.x, hand.y, 2);

        const effect = ctx.createEffect((scene) => new SwampEffect(scene));
        let arrival = 0;
        void ctx.whileRunning(effect, () => effect.play(
            fieldCenter, field.width, field.height,
            deckPos, handDest,
            drawn.map((it) => it.cardId),
            (cardId) => {
                // 전투가 매긴 번호를 그대로 쓴다. 화면이 새로 매기면 전투와 어긋난다.
                const issued = drawn[arrival++]?.battleCardId;
                if (issued === undefined) return;
                ctx.hand.appendCard(cardId, issued);
                console.log(`  swamp card landed — cardId=${cardId}`);
            },
        ));
        return true;
    },
};
