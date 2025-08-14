import * as THREE from 'three';
import {MyDeckOwnedCards} from "../entity/MyDeckOwnedCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckOwnedCardsRepository {
    createMyDeckOwnedCards(cardId: number, position: Vector2d): Promise<MyDeckOwnedCards>;
    findCardByCardUniqueId(cardUniqueId: number): MyDeckOwnedCards | null;
    findAllCards(): MyDeckOwnedCards[];
}