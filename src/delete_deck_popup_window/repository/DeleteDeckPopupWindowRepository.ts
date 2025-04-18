import * as THREE from 'three';
import {DeleteDeckPopupWindow} from "../entity/DeleteDeckPopupWindow";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeleteDeckPopupWindowRepository {
    createDeleteDeckPopupWindow(): Promise<DeleteDeckPopupWindow>;
    findPopupWindow(): DeleteDeckPopupWindow | null;
    deletePopupWindow(): void;
}
