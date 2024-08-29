import cardData from "../common/every_card_info"
import {Card} from "./types";

export function getCardById(cardId: number): Card | undefined {
    return cardData.find(card => card.카드번호 === cardId);
}
