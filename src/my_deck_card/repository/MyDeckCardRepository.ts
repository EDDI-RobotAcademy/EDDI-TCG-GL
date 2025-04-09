import * as THREE from 'three';
import {MyDeckCard} from "../entity/MyDeckCard";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardRepository {
    createMyDeckCard(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCard>;
    findCardByCardUniqueId(cardUniqueId: number): MyDeckCard | null;
    findCardListByDeckId(deckId: number): MyDeckCard[] | null;
    deleteDeckByDeckId(deckId: number): void;
}