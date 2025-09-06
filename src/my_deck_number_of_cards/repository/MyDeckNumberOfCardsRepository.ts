import * as THREE from 'three';
import {MyDeckNumberOfCards} from "../entity/MyDeckNumberOfCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfCardsRepository {
    createMyDeckNumberOfCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfCards>;
    findNumberById(numberId: number): MyDeckNumberOfCards | null;
    findNumberListByDeckId(deckId: number): MyDeckNumberOfCards[] | null;
    deleteNumber(deckId: number, numberId: number): void;
    deleteAll(): void;
}