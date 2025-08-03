import * as THREE from 'three';
import {MyDeckCardName} from "../entity/MyDeckCardName";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardNameRepository {
    createMyDeckCardName(deckId: number, cardId: number, position: Vector2d): Promise<MyDeckCardName>;
    findCardNameById(cardNameId: number): MyDeckCardName | null;
    findCardNameListByDeckId(deckId: number): MyDeckCardName[] | null;
    deleteCardName(deckId: number, cardNameId: number): void;
    deleteAllCardName(): void;
}