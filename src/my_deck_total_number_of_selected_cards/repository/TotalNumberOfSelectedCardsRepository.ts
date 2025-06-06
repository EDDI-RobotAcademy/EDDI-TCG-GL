import * as THREE from 'three';
import {TotalNumberOfSelectedCards} from "../entity/TotalNumberOfSelectedCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface TotalNumberOfSelectedCardsRepository {
    createTotalNumberOfSelectedCards(deckId: number, count: number): Promise<TotalNumberOfSelectedCards>;
    findNumberByDeckId(deckId: number): TotalNumberOfSelectedCards | null;
    deleteNumberByDeckId(deckId: number): void;
}