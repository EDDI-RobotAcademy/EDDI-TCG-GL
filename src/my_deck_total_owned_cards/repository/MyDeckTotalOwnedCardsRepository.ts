import * as THREE from 'three';
import {MyDeckTotalOwnedCards} from "../entity/MyDeckTotalOwnedCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckTotalOwnedCardsRepository {
    createMyDeckTotalOwnedCards(cardId: number, cardCount: number, position: Vector2d): Promise<MyDeckTotalOwnedCards>;
    findTotalOwnedCardsById(totalOwnedCardsId: number): MyDeckTotalOwnedCards | null;
    findAllTotalOwnedCardsList(): MyDeckTotalOwnedCards[];
    deleteTotalOwnedCardsById(totalOwnedCardsId: number): void;
    deleteAll(): void;
}