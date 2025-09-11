import * as THREE from 'three';
import {MyDeckCardSearchBox} from "../entity/MyDeckCardSearchBox";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardSearchBoxRepository {
    createSearchBox(position: Vector2d): Promise<MyDeckCardSearchBox>;
    findSearchBox(): MyDeckCardSearchBox | null;
    deleteSearchBox(): void;
}