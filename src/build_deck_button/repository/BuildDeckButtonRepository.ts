import * as THREE from 'three';
import {BuildDeckButton} from "../entity/BuildDeckButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface BuildDeckButtonRepository {
    createBuildDeckButton(type: number, position: Vector2d): Promise<BuildDeckButton>;
    findButtonById(id: number): BuildDeckButton | null;
    findAllButton(): BuildDeckButton[];
    deleteById(id: number): void;
    deleteAll(): void;
    findAllButtonIds(): number[];
    hideButton(buttonId: number): void;
    showButton(buttonId: number): void;
}