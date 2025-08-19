import * as THREE from "three";

export interface LeftClickOpponentMasterDetectRepository {
    isOpponentMasterClicked(clickPoint: { x: number; y: number }): boolean;
}