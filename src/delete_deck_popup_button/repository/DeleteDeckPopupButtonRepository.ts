import * as THREE from 'three';
import {DeleteDeckPopupButton} from "../entity/DeleteDeckPopupButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeleteDeckPopupButtonRepository {
    createDeleteDeckPopupButton(type: number, position: Vector2d): Promise<DeleteDeckPopupButton>;
    findButtonById(id: number): DeleteDeckPopupButton | null;
    findAllButton(): DeleteDeckPopupButton[];
    deleteById(id: number): void;
    deleteAll(): void;
    findAllButtonIdList(): number[];
}