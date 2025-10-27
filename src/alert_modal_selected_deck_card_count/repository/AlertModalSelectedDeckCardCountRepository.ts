import * as THREE from 'three';
import {AlertModalSelectedDeckCardCount} from "../entity/AlertModalSelectedDeckCardCount";
import {Vector2d} from "../../common/math/Vector2d";

export interface AlertModalSelectedDeckCardCountRepository {
    createSelectedDeckCardCount(count: number): Promise<AlertModalSelectedDeckCardCount>;
    findSelectedDeckCardCount(): AlertModalSelectedDeckCardCount | null;
    deleteSelectedDeckCardCount(): void;
}