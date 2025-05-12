import * as THREE from "three";

import {MyDeckBlockScrollService} from "./MyDeckBlockScrollService";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckBlockScrollServiceImpl implements MyDeckBlockScrollService {
    private static instance: MyDeckBlockScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;

    private scrollState: boolean = true;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance();
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): MyDeckBlockScrollServiceImpl {
        if (!MyDeckBlockScrollServiceImpl.instance) {
            MyDeckBlockScrollServiceImpl.instance = new MyDeckBlockScrollServiceImpl(camera, scene, renderer);
        }
        return MyDeckBlockScrollServiceImpl.instance;
    }

    public setBlockScrollState(state: boolean): void {
        this.scrollState = state;
    }

    public getBlockScrollState(): boolean {
        return this.scrollState;
    }

    public async onWheelScroll(event: WheelEvent, currentClickDeckId: number): Promise<void> {
        const scrollTargets = [
            this.getBlockGroup(currentClickDeckId), // scrollTargetBlock
            this.getCardNameGroup(currentClickDeckId)
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Block Group:", scrollTargets[0]);
        console.log("Scroll Target Block Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTarget Deck Block position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

        const blockCount = this.getBlockCountByDeckId(currentClickDeckId);
        console.log(`Block Count?${blockCount}`);
        const lowerLimit = 0.073 * window.innerHeight * (blockCount - 8) + (0.166 * (250/1130) / 3) * window.innerWidth;
        const upperLimit = 0;
        console.log(`upperLimit: ${upperLimit}`); // 최대로 올릴 수 있는 범위
        console.log(`lowerLimit: ${lowerLimit}`); // 최대로 내릴 수 있는 범위

        scrollTargets.forEach(target => {
            if (target) {
                target.position.y += delta;
                target.position.y = Math.max(Math.min(target.position.y, lowerLimit), upperLimit);
            }
        });

        console.log('After Scroll- Scroll Target Deck Block Position Y', scrollTargets[0]?.position.y);
    }

    private getBlockGroup(deckId: number): THREE.Group {
        return this.myDeckBlockRepository.findBlockGroupByDeckId(deckId);
    }

    public getBlockCountByDeckId(deckId: number): number {
        return this.myDeckBlockRepository.findBlockCountByDeckId(deckId);
    }

    private getCardNameGroup(deckId: number): THREE.Group {
        return this.myDeckCardNameRepository.findCardNameGroupByDeckId(deckId);
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

}
