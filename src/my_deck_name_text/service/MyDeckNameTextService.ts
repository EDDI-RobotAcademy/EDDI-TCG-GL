import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckNameText} from "../entity/MyDeckNameText";

export interface MyDeckNameTextService {
    getMyDeckNameTextByDeckId(deckId: number): MyDeckNameText | null;
    getAllMyDeckNameText(): MyDeckNameText[];
    deleteDeckNameTextByDeckId(deckId: number): void;
    deleteAllDeckNameText(): void;
}