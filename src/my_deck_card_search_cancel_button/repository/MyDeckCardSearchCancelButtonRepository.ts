import * as THREE from 'three';
import {MyDeckCardSearchCancelButton} from "../entity/MyDeckCardSearchCancelButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardSearchCancelButtonRepository {
    createButton(position: Vector2d): Promise<MyDeckCardSearchCancelButton>;
    findButton(): MyDeckCardSearchCancelButton | null;
    deleteButton(): void;
}