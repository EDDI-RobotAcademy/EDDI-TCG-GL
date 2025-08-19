import * as THREE from "three";

import {LeftClickOpponentMasterDetectRepository} from "./LeftClickOpponentMasterDetectRepository";

export class LeftClickOpponentMasterDetectRepositoryImpl implements LeftClickOpponentMasterDetectRepository {
    private static instance: LeftClickOpponentMasterDetectRepositoryImpl;

    private readonly OPPONENT_START_X: number = 0.4605885;
    private readonly OPPONENT_START_Y: number = 0.1920103;
    private readonly OPPONENT_END_X: number = 0.5410156;
    private readonly OPPONENT_END_Y: number = 0.0476804;

    public static getInstance(): LeftClickOpponentMasterDetectRepositoryImpl {
        if (!LeftClickOpponentMasterDetectRepositoryImpl.instance) {
            LeftClickOpponentMasterDetectRepositoryImpl.instance = new LeftClickOpponentMasterDetectRepositoryImpl();
        }
        return LeftClickOpponentMasterDetectRepositoryImpl.instance;
    }

    isOpponentMasterClicked(clickPoint: { x: number; y: number }): boolean {
        const { x, y } = clickPoint;

        // 화면 좌표로 변환
        const startX = (this.OPPONENT_START_X - 0.5) * window.innerWidth;
        const startY = (0.5 - this.OPPONENT_START_Y) * window.innerHeight;
        const endX = (this.OPPONENT_END_X - 0.5) * window.innerWidth;
        const endY = (0.5 - this.OPPONENT_END_Y) * window.innerHeight;

        // 클릭 좌표가 영역 안에 있는지 체크
        if (x >= startX && x <= endX && y >= endY && y <= startY) {
            console.log("Opponent Master clicked!");
            return true;
        }

        return false;
    }
}