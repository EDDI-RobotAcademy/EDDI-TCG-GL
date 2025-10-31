import * as THREE from 'three';
import {CardFilterPanel} from "../entity/CardFilterPanel";
import {Vector2d} from "../../common/math/Vector2d";

export interface CardFilterPanelRepository {
    createPanel(): Promise<CardFilterPanel>;
    findPanel(): CardFilterPanel | null;
    deletePanel(): void;
}