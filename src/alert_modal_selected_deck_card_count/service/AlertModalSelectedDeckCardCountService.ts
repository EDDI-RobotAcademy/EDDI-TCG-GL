import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {AlertModalSelectedDeckCardCount} from "../entity/AlertModalSelectedDeckCardCount";

export interface AlertModalSelectedDeckCardCountService {
    createAlertModalSelectedDeckCardCount(count: number): Promise<void>;
    getAlertModalSelectedDeckCardCount(): AlertModalSelectedDeckCardCount | null;
}