import {getCardById} from "../../src/card/utility";

const cardIdToFind = 2;
const card = getCardById(cardIdToFind);

if (card) {
    console.log('Card found:', card);
} else {
    console.log('Card not found');
}

const cardIdToFind2 = 19;
const card2 = getCardById(cardIdToFind2);

if (card2) {
    console.log('Card found:', card2);
} else {
    console.log('Card not found');
}

const cardIdToFind3 = 27;
const card3 = getCardById(cardIdToFind3);

if (card3) {
    console.log('Card found:', card3);
} else {
    console.log('Card not found');
}