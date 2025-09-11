import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckCardSearchBoxService {
    createMyDeckCardSearchBox(): Promise<void>;
}