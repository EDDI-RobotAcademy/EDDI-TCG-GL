import * as THREE from "three";
import { FirstSkillType } from "../entity/FirstSkillType";

export class FirstSkillHandler {
    private static instance: FirstSkillHandler;

    // private firstSkillAnimation: FirstSkillAnimation;

    private handlers: Record<FirstSkillType,
        (x: number, y: number) => Promise<void>> = {
        [FirstSkillType.OPPONENT_FIELD_UNIT]: this.handleOpponentFieldUnit.bind(this),
        [FirstSkillType.OPPONENT_MASTER]: this.handleOpponentMaster.bind(this),
    };

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {

    }

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): FirstSkillHandler {
        if (!FirstSkillHandler.instance) {
            FirstSkillHandler.instance = new FirstSkillHandler(camera, scene);
        }
        return FirstSkillHandler.instance;
    }

    public async execute(
        type: FirstSkillType,
        x: number,
        y: number
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for FirstSkillType: ${type}`);
            return;
        }
        await handler(x, y);
    }

    private async handleOpponentFieldUnit(x: number, y: number): Promise<void> {
        console.log(`첫 번째 스킬 (타겟팅) 공격: 상대 필드 유닛 공격 처리 (x:${x}, y:${y})`);
    }

    private async handleOpponentMaster(x: number, y: number): Promise<void> {
        console.log(`첫 번째 스킬 (타겟팅) 공격: 상대 본체 공격 처리 (x:${x}, y:${y})`);
    }
}