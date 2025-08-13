import {Card} from "../../card/types";
import * as THREE from "three";

export interface ActivePanelAreaRepository {
    create(x: number, y: number, cardId: number): void;
    delete(): void;
    exists(): boolean;
    getActiveButtons(): THREE.Mesh[];
}
