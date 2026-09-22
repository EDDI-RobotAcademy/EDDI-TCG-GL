import * as THREE from "three";
import {MoraleConvertEffect} from "../../../animation/card/item/035_morale_convert/MoraleConvertEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 사기 전환 — 아군 유닛 하나를 무덤으로 보내고 그 체력만큼 필드 에너지를 얻는다.
//
// 필드에 선 아군 위에 떨어뜨려야 한다.
export const MoraleConvertPresentation: CardPresentation = {
    cardId: 35,
    dropTarget: 'allyUnit',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'allyUnit') return false;
        const target = hit.entry;

        // 카드를 쓴다. 유닛을 무덤으로 보내고 에너지를 얻는 것은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: target.cardIndex,
        });
        ctx.hand.removeCard(dropped.entry);

        // 얼마나 얻는지는 전투가 이미 셌다. 여기서는 그 값으로 그린다.
        const gained = events.find(
            (ev) => ev.type === 'valueChanged' && ev.what === 'fieldEnergy',
        );
        const energyBefore = gained && gained.type === 'valueChanged'
            ? gained.before : ctx.view.yourFieldEnergy();
        const energyGain = gained && gained.type === 'valueChanged'
            ? gained.after - gained.before : 0;

        // 메시를 치우기 전에 출발 자리를 적어 둔다.
        const sourceWorld = new THREE.Vector3(
            target.group.position.x, target.group.position.y, 5,
        );

        // 무덤으로 보내는 것도 전투가 이미 했다. 여기서는 화면에서 치운다.
        ctx.yourField.removeUnit(target);
        ctx.hand.reflow();

        const hp = ctx.catalog.getHp(target.card.cardId);
        console.log(`[morale-convert] target cardId=${target.card.cardId} HP=${hp} → +${energyGain} energy; target → tomb`);

        if (energyGain <= 0) return true;   // 체력이 적어 얻는 것이 없다

        const destination = ctx.fieldEnergy.worldPosition();
        const destWorld = new THREE.Vector3(destination.x, destination.y, 5);

        const effect = ctx.createEffect((scene) => new MoraleConvertEffect(scene));
        void (async () => {
            // 알갱이가 하나씩 닿을 때마다 숫자를 하나씩 올려 보인다. 실제 값은 이미 다 올랐다.
            let shown = energyBefore;
            await ctx.whileRunning(effect, () => effect.play(
                sourceWorld, destWorld, energyGain,
                () => {
                    shown += 1;
                    ctx.fieldEnergy.setEnergy(shown);
                },
            ));

            // 알갱이마다 올려 보이는 숫자는 시작할 때의 값에서 세는 것이다. 도는 동안 다른
            // 데서 필드 에너지가 바뀌면 어긋난다. 필드 에너지는 오르내려서 한쪽만 그리는
            // 방법을 못 쓰므로, 끝나고 지금 참인 값으로 맞춘다 (규칙 28).
            ctx.fieldEnergy.syncToTruth();
            console.log(`[morale-convert] effect complete; total field energy = ${ctx.view.yourFieldEnergy()}`);
        })();
        return true;
    },
};
