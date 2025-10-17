import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {AlertModalButtons} from "../entity/AlertModalButtons";
import {AlertModalButtonsType} from "../entity/AlertModalButtonsType";

export interface AlertModalButtonsRepository {
    createButton(type: AlertModalButtonsType, position: Vector2d): Promise<AlertModalButtons>;
    findButtonByType(type: AlertModalButtonsType): AlertModalButtons | null;
    deleteButtonByType(type: AlertModalButtonsType): void;
}