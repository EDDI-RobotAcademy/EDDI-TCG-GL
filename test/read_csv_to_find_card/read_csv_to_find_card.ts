import {getCardById} from "../../src/card/utility";

const cardIdToFind = 2;
const card = getCardById(cardIdToFind);

if (card) {
    console.log('Card found:', card);
} else {
    console.log('Card not found');
}