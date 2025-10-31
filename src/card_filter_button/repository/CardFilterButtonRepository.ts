import * as THREE from 'three';
import {CardFilterButton} from "../entity/CardFilterButton";
import {Vector2d} from "../../common/math/Vector2d";

export interface CardFilterButtonRepository {
    createButton(): Promise<CardFilterButton>;
    findButton(): CardFilterButton | null;
    deleteButton(): void;
}