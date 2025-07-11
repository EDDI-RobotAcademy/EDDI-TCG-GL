import * as THREE from 'three';
import {RequiredNumberOfCards} from "../entity/RequiredNumberOfCards";
import {Vector2d} from "../../common/math/Vector2d";

export interface RequiredNumberOfCardsRepository {
    createRequiredNumberOfCards(): Promise<RequiredNumberOfCards>;
    findNumber(): RequiredNumberOfCards | null;
    deleteNumber(): void;
}