import * as THREE from 'three';
import {MyDeckChosenOutOfTotalSlash} from "../entity/MyDeckChosenOutOfTotalSlash";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckChosenOutOfTotalSlashRepository {
    createSlash(position: Vector2d): Promise<MyDeckChosenOutOfTotalSlash>;
    findSlash(): MyDeckChosenOutOfTotalSlash | null;
    deleteSlash(): void;
}