import * as THREE from "three";

import {MyDeckScrollService} from "./MyDeckScrollService";
import {MyDeckButtonRepositoryImpl} from "../../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonEffectRepositoryImpl} from "../../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";
import {MyDeckNameTextRepositoryImpl} from "../../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";
import {DeckNameEditButtonRepositoryImpl} from "../../deck_name_edit_button/repository/DeckNameEditButtonRepositoryImpl";
import {DeckDeleteButtonRepositoryImpl} from "../../deck_delete_button/repository/DeckDeleteButtonRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../../side_scroll_area_detect/repository/SideScrollAreaDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckScrollServiceImpl implements MyDeckScrollService {
    private static instance: MyDeckScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;
    private myDeckNameTextRepository : MyDeckNameTextRepositoryImpl;
    private deckNameEditButtonRepository: DeckNameEditButtonRepositoryImpl;
    private deckDeleteButtonRepository: DeckDeleteButtonRepositoryImpl;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;

    private scrollState: boolean = true;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance(scene);
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance(scene);
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance(scene);
        this.deckNameEditButtonRepository = DeckNameEditButtonRepositoryImpl.getInstance(scene);
        this.deckDeleteButtonRepository = DeckDeleteButtonRepositoryImpl.getInstance(scene);
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): MyDeckScrollServiceImpl {
        if (!MyDeckScrollServiceImpl.instance) {
            MyDeckScrollServiceImpl.instance = new MyDeckScrollServiceImpl(camera, scene, renderer);
        }
        return MyDeckScrollServiceImpl.instance;
    }

    public setScrollState(state: boolean): void {
        this.scrollState = state;
    }

    public getScrollState(): boolean {
        return this.scrollState;
    }

    public async onWheelScroll(event: WheelEvent): Promise<void> {
        if (!this.getMyDeckScrollEnabledById(0)) return;
        if (this.getDeckCount() < 6) return;

        const scrollTargets = [
            this.getDeckButtonGroup(),         // scrollTargetDeckButton
            this.getDeckButtonEffectGroup(),  // scrollTargetDeckButtonEffect
            this.getDeckNameTextGroup(),      // scrollTargetDeckNameText
            this.getDeckNameEditButtonGroup(),     // scrollTargetDeckEditButton
            this.getDeckDeleteButtonGroup()
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Button Group:", scrollTargets[0]);
        console.log("Scroll Target Button Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTargetDeckButton.position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

        // lowerLimit: 보이지 않는 덱 버튼이 차지하는 전체 높이
        const deckCount = this.getDeckCount();
        const lowerLimit = 0.075 * window.innerHeight * (deckCount - 6) + (0.18 * (240/1040) / 3) * window.innerWidth;
        const upperLimit = 0;
        console.log(`upperLimit: ${upperLimit}`); // 최대로 올릴 수 있는 범위
        console.log(`lowerLimit: ${lowerLimit}`); // 최대로 내릴 수 있는 범위

        scrollTargets.forEach(target => {
            if (target) {
                target.position.y += delta;
                target.position.y = Math.max(Math.min(target.position.y, lowerLimit), upperLimit);
            }
        });

        console.log('After Scroll- scrollTargetDeckButton.position.y', scrollTargets[0]?.position.y);
    }

    private getDeckButtonGroup(): THREE.Group {
        return this.myDeckButtonRepository.findAllButtonGroups();
    }

    private getDeckButtonEffectGroup(): THREE.Group {
        return this.myDeckButtonEffectRepository.findAllEffectGroups();
    }

    private getDeckNameTextGroup(): THREE.Group {
        return this.myDeckNameTextRepository.findTextGroup();
    }

    private getDeckNameEditButtonGroup(): THREE.Group {
        return this.deckNameEditButtonRepository.findAllButtonGroups();
    }

    private getDeckDeleteButtonGroup(): THREE.Group {
        return this.deckDeleteButtonRepository.findAllButtonGroups();
    }

    public getDeckCount(): number {
        return this.myDeckButtonRepository.findDeckCount();
    }

    private getMyDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMyDeckScrollEnabledById(areaId);
    }

}
