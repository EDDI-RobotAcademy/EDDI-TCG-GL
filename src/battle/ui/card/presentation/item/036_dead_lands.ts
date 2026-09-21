import * as THREE from "three";
import {DeadLandsEffect} from "../../../animation/card/item/036_dead_lands/DeadLandsEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 죽음의 대지 — 상대 필드 에너지를 빨아낸다.
//
// 상대 필드 영역 안에 떨어뜨려야 한다.
//
// 숫자가 줄어드는 것을 떨어뜨린 순간에 보이지 않는다. 연출이 상대 에너지 표기를 찢는
// 절정(1.3초쯤)에 맞춰 보인다. 찢기는 모습과 숫자가 어긋나면 둘이 따로 노는 것으로 보인다.
export const DeadLandsPresentation: CardPresentation = {
    cardId: 36,
    dropTarget: 'opponentFieldArea',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'area') return false;

        // 카드를 쓴다. 값을 바꾸고 카드를 무덤에 넣는 것은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnField',
            battleCardId: dropped.battleCardId,
            side: 'opponent',
        });
        ctx.hand.removeCard(dropped.entry);

        const drained = events.find(
            (ev) => ev.type === 'valueChanged' && ev.what === 'opponentFieldEnergy',
        );
        const change = drained && drained.type === 'valueChanged'
            ? {before: drained.before, after: drained.after}
            : null;

        // 상대 에너지 표기가 화면에서 어디에 있고 얼마나 큰지. 연출이 그리로 간다.
        const bounds = ctx.opponentFieldEnergy.bounds();
        const targetWorld = new THREE.Vector3(bounds.centerX, bounds.centerY, 5);

        const effect = ctx.createEffect((scene) => new DeadLandsEffect(scene));
        void ctx.whileRunning(effect, () => effect.play(
            targetWorld,
            {width: bounds.width, height: bounds.height},
            {
                setOffset: (dx, dy) => ctx.opponentFieldEnergy.setOffset(dx, dy),
                setDamageLevel: (level) => ctx.opponentFieldEnergy.setDamageLevel(level),
            },
            ctx.canvasElement,
            () => {
                // 값은 이미 전투가 바꿨다. 여기서는 그때 받은 것을 화면에 쓴다.
                if (!change) return;
                ctx.opponentFieldEnergy.setEnergy(change.after);
                console.log(`[dead-lands] opponent field energy ${change.before} → ${change.after}`);
            },
        ));
        return true;
    },
};
