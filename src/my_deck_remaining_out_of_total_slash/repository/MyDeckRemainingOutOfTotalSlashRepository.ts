import * as THREE from 'three';
import {MyDeckRemainingOutOfTotalSlash} from "../entity/MyDeckRemainingOutOfTotalSlash";
import {Vector2d} from "../../common/math/Vector2d";

export interface MyDeckRemainingOutOfTotalSlashRepository {
    createSlash(cardId: number, position: Vector2d): Promise<MyDeckRemainingOutOfTotalSlash>;
    findSlashById(slashId: number): MyDeckRemainingOutOfTotalSlash | null;
    findAllSlashList(): MyDeckRemainingOutOfTotalSlash[];
    deleteSlashById(slashId: number): void;
    deleteAll(): void;
}