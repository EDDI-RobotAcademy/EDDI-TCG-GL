import {Battle} from "../domain/Battle";
import {HandCard} from "../domain/HandCard";
import {FieldCard} from "../domain/FieldCard";
import {CardKind} from "../../card/kind";
import {BattleCommand} from "./BattleCommand";
import {BattleEvent} from "./BattleEvent";

// 카드가 어떤 종류이고 체력이 얼마인지를 알려 주는 곳.
//
// 카드에 적혀 있는 것은 판과 무관하다. 전투 상태가 그것까지 들면 판마다 카드 백 장을
// 통째로 적어 두게 된다. 그래서 밖에서 받는다.
export interface CardCatalog {
    getKind(cardId: number): CardKind | null;
    getHp(cardId: number): number;
}

// 사용자가 한 일 하나를 받아 끝까지 처리하고, 무슨 일이 일어났는지 차례대로 돌려준다.
//
// 되는지 안 되는지도 여기서 판단한다. 부르는 쪽은 하나만 보내고 돌려받은 것만 본다.
export class BattleCommandHandler {
    constructor(private readonly catalog: CardCatalog) {}

    handle(battle: Battle, command: BattleCommand): BattleEvent[] {
        switch (command.type) {
            case 'drawCard':
                return this.drawCard(battle);
            case 'playCardToField':
                return this.playCardToField(battle, command.battleCardId);
        }
    }

    // 덱에서 한 장 뽑아 손패에 넣는다.
    private drawCard(battle: Battle): BattleEvent[] {
        const cardId = battle.drawFromYourDeck();
        if (cardId === null) {
            return [{type: 'rejected', reason: '덱에 남은 카드가 없습니다.'}];
        }

        // 신원은 전투가 준다. R2-86 에서 전투가 매기게 되면 여기가 그 자리다.
        const battleCardId = this.nextBattleCardId(battle);
        battle.addToHand(new HandCard(battleCardId, cardId, [], 0));

        return [{
            type: 'cardMoved',
            battleCardId,
            cardId,
            from: 'yourDeck',
            to: 'hand',
        }];
    }

    // 손패의 카드를 내 필드에 낸다.
    private playCardToField(battle: Battle, battleCardId: number): BattleEvent[] {
        const handCard = battle.findInHand(battleCardId);
        if (!handCard) {
            return [{type: 'rejected', reason: '손패에 없는 카드입니다.'}];
        }

        const cardId = handCard.getCardId();
        const kind = this.catalog.getKind(cardId);
        if (kind !== CardKind.UNIT) {
            return [{type: 'rejected', reason: '유닛 카드만 필드에 낼 수 있습니다.'}];
        }

        battle.removeFromHand(battleCardId);
        battle.placeOnYourField(new FieldCard(
            battleCardId,
            cardId,
            handCard.getAttributeMarkIds(),
            handCard.getPositionId(),
            this.catalog.getHp(cardId),
            0,
        ));

        return [{
            type: 'cardMoved',
            battleCardId,
            cardId,
            from: 'hand',
            to: 'yourField',
        }];
    }

    // 아직 전투가 신원을 안 매긴다. 지금 있는 것 중 가장 큰 번호 다음을 쓴다.
    private nextBattleCardId(battle: Battle): number {
        let max = -1;
        for (const it of battle.getHandCards()) max = Math.max(max, it.getBattleCardId());
        for (const it of battle.getYourFieldCards()) max = Math.max(max, it.getBattleCardId());
        for (const it of battle.getOpponentFieldCards()) max = Math.max(max, it.getBattleCardId());
        return max + 1;
    }
}
