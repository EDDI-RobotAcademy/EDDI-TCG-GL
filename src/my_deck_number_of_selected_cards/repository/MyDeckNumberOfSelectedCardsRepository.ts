import * as THREE from 'three';
import {MyDeckNumberOfSelectedCards} from "../entity/MyDeckNumberOfSelectedCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckNumberOfSelectedCardsRepository {
    createMyDeckNumberOfSelectedCards(deckId: number, cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckNumberOfSelectedCards>;
    findNumberById(numberId: number): MyDeckNumberOfSelectedCards | null;
    findNumberListByDeckId(deckId: number): MyDeckNumberOfSelectedCards[] | null;
    deleteNumberOfSelectedCards(deckId: number, numberId: number): void;
    deleteAll(): void;
}