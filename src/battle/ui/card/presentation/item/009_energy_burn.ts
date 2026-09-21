import {EnergyBurnEffect} from "../../../animation/card/item/009_energy_burn/EnergyBurnEffect";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 에너지 번 — 상대 유닛에 붙은 에너지를 빨아내고, 모자란 만큼 때린다.
export const EnergyBurnPresentation: CardPresentation = {
    cardId: 9,
    dropTarget: 'opponentUnit',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'opponentUnit') return false;
        const target = hit.entry;

        // 카드를 쓴다. 에너지 빼기와 피해와 카드 이동은 전투가 한다.
        const events = ctx.send({
            type: 'useCardOnUnit',
            battleCardId: dropped.battleCardId,
            targetBattleCardId: target.cardIndex,
        });
        ctx.hand.removeCard(dropped.entry, dropped.handIndex);

        const drainedEvent = events.find((ev) => ev.type === 'energyDrained');
        const energyDrained = drainedEvent && drainedEvent.type === 'energyDrained'
            ? drainedEvent.amount : 0;
        const damagedEvent = events.find(
            (ev) => ev.type === 'damaged' && ev.target.kind === 'unit',
        );
        const damage = damagedEvent && damagedEvent.type === 'damaged' ? damagedEvent.amount : 0;
        const killing = events.some((ev) => ev.type === 'defeated' && ev.target.kind === 'unit');

        console.log(`[energy-burn] target cardId=${target.card.cardId} drained ${energyDrained}, damage=${damage}${killing ? ' (defeated — card burns away)' : ''}`);

        const effect = ctx.createEffect((scene) => new EnergyBurnEffect(scene));
        void (async () => {
            // 연출과 맞은 표시를 함께 돌린다. 카드에 붙은 에너지 아이콘은 알갱이가 눈에
            // 보이게 빨려 나간 뒤에 다시 그린다.
            //
            // 죽는 일격이면 카드가 통째로 사라지므로 아이콘을 다시 그리지 않는다. 그리면
            // 타는 중에 숫자가 다시 켜진다.
            await Promise.all([
                ctx.whileRunning(effect, () =>
                    effect.play(target.group, energyDrained, killing)),
                (async () => {
                    if (damage <= 0) return;
                    await new Promise((r) => setTimeout(r, 500));
                    ctx.opponentField.flashAndShake(target.group);
                })(),
                (async () => {
                    if (killing) return;
                    if (energyDrained <= 0) return;
                    await new Promise((r) => setTimeout(r, 600));
                    await effect.playEnergyIconBurnAway(target.group);
                    // 그리는 순간 참인 값으로 그린다. 같은 유닛에 빠르게 두 번 쓰면 연출
                    // 둘이 겹치고, 각자 들고 있던 값을 쓰면 숫자가 되돌아간다 (규칙 28).
                    ctx.opponentField.redrawEnergyCount(
                        target, ctx.view.opponentUnitEnergyCount(target.cardIndex),
                    );
                })(),
            ]);
            if (killing) ctx.opponentField.reflow();
        })();
        return true;
    },
};
