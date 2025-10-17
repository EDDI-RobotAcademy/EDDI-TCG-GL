import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {AlertModalContainer} from "../entity/AlertModalContainer";
import {AlertModalContainerType} from "../entity/AlertModalContainerType";

export interface AlertModalContainerRepository {
    createContainer(type: AlertModalContainerType, position: Vector2d): Promise<AlertModalContainer>;
    findContainerByType(type: AlertModalContainerType): AlertModalContainer | null;
    deleteContainerByType(type: AlertModalContainerType): void;
}