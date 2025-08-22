import * as THREE from "three";

import {LeftClickOpponentMasterDetectRepository} from "./LeftClickOpponentMasterDetectRepository";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";

export class LeftClickOpponentMasterDetectRepositoryImpl implements LeftClickOpponentMasterDetectRepository {
    private static instance: LeftClickOpponentMasterDetectRepositoryImpl;

    private readonly OPPONENT_START_X_RATIO: number = BattleFieldConstants.OPPONENT_START_X_RATIO;
    private readonly OPPONENT_START_Y_RATIO: number = BattleFieldConstants.OPPONENT_START_Y_RATIO;
    private readonly OPPONENT_END_X_RATIO: number = BattleFieldConstants.OPPONENT_END_X_RATIO;
    private readonly OPPONENT_END_Y_RATIO: number = BattleFieldConstants.OPPONENT_END_Y_RATIO;

    public static getInstance(): LeftClickOpponentMasterDetectRepositoryImpl {
        if (!LeftClickOpponentMasterDetectRepositoryImpl.instance) {
            LeftClickOpponentMasterDetectRepositoryImpl.instance = new LeftClickOpponentMasterDetectRepositoryImpl();
        }
        return LeftClickOpponentMasterDetectRepositoryImpl.instance;
    }

    isOpponentMasterClicked(clickPoint: { x: number; y: number }): boolean {
        const { x, y } = clickPoint;

        // 화면 좌표로 변환
        const startX = (this.OPPONENT_START_X_RATIO - 0.5) * window.innerWidth;
        const startY = (0.5 - this.OPPONENT_START_Y_RATIO) * window.innerHeight;
        const endX = (this.OPPONENT_END_X_RATIO - 0.5) * window.innerWidth;
        const endY = (0.5 - this.OPPONENT_END_Y_RATIO) * window.innerHeight;

        // 클릭 좌표가 영역 안에 있는지 체크
        if (x >= startX && x <= endX && y >= endY && y <= startY) {
            console.log("Opponent Master clicked!");
            return true;
        }

        return false;
    }
}