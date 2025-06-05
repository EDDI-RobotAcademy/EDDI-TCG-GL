import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckRemainingOutOfTotalSlashService {
    createSlashWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null>;
}