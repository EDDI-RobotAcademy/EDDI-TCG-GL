import * as THREE from "three";

import {AnimationType} from "../entity/AnimationType";
import {SlashCutEffect} from "../../battle/animation/attack/weapon/SlashCutEffect";

export class AnimationHandler {
    private static instance: AnimationHandler;

    private screenCutEffect: SlashCutEffect;

    private handlers: Record<AnimationType,
        () => Promise<void>> = {
        [AnimationType.GENERAL_SWORD_ATTACK_TO_MASTER]: this.handleGeneralSwordAttackToMaster.bind(this),
    };

    private constructor(
        private camera: THREE.Camera,
        private scene: THREE.Scene,
        private renderer: THREE.WebGLRenderer // 렌더러 추가
    ) {
        this.screenCutEffect = SlashCutEffect.initialize(renderer, scene, camera);
    }

    public static initialize(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): AnimationHandler {
        if (!AnimationHandler.instance) {
            AnimationHandler.instance = new AnimationHandler(camera, scene, renderer);
        }
        return AnimationHandler.instance;
    }

    public static getInstance(): AnimationHandler {
        if (!AnimationHandler.instance) {
            throw new Error("AnimationHandler 초기화 안됨. initialize() 먼저 호출 필요.");
        }
        return AnimationHandler.instance;
    }

    public async execute(
        type: AnimationType,
    ): Promise<void> {
        const handler = this.handlers[type];
        if (!handler) {
            console.warn(`Handler not found for AnimationType: ${type}`);
            return;
        }
        await handler();
    }

    private async handleGeneralSwordAttackToMaster(): Promise<void> {
        console.log(`검으로 본체 공격하기`);
    }
}