import * as THREE from 'three';
import {MyDeckRemainingCards} from "../entity/MyDeckRemainingCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckRemainingCardsRepository {
    createMyDeckRemainingCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckRemainingCards>;
    findRemainingCardsById(remainingCardsId: number): MyDeckRemainingCards | null;
    findAllRemainingCardsList(): MyDeckRemainingCards[];
    deleteRemainingCardsById(remainingCardsId: number): void;
    deleteAll(): void;
}