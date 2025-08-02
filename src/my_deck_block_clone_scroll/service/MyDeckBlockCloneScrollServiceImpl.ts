import * as THREE from "three";

import {MyDeckBlockCloneScrollService} from "./MyDeckBlockCloneScrollService";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../../side_scroll_area_detect/repository/SideScrollAreaDetectRepositoryImpl";
import {DeckEditButtonClickDetectRepositoryImpl} from "../../deck_edit_button_click_detect/repository/DeckEditButtonClickDetectRepositoryImpl";
import {MyDeckBlockCloneRepositoryImpl} from "../../my_deck_block_clone/repository/MyDeckBlockCloneRepositoryImpl";
import {MyDeckNumberOfSelectedCardsCloneRepositoryImpl} from "../../my_deck_number_of_selected_cards_clone/repository/MyDeckNumberOfSelectedCardsCloneRepositoryImpl";
import {MyDeckCardNameCloneRepositoryImpl} from "../../my_deck_card_name_clone/repository/MyDeckCardNameCloneRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckBlockCloneScrollServiceImpl implements MyDeckBlockCloneScrollService {
    private static instance: MyDeckBlockCloneScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;
    private deckEditButtonClickDetectRepository: DeckEditButtonClickDetectRepositoryImpl;
    private myDeckBlockCloneRepository: MyDeckBlockCloneRepositoryImpl;
    private myDeckNumberOfSelectedCardsCloneRepository: MyDeckNumberOfSelectedCardsCloneRepositoryImpl;
    private myDeckCardNameCloneRepository: MyDeckCardNameCloneRepositoryImpl;

    private scrollEnable: boolean = false;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
        this.deckEditButtonClickDetectRepository = DeckEditButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckBlockCloneRepository = MyDeckBlockCloneRepositoryImpl.getInstance(scene);
        this.myDeckNumberOfSelectedCardsCloneRepository = MyDeckNumberOfSelectedCardsCloneRepositoryImpl.getInstance(scene);
        this.myDeckCardNameCloneRepository = MyDeckCardNameCloneRepositoryImpl.getInstance(scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): MyDeckBlockCloneScrollServiceImpl {
        if (!MyDeckBlockCloneScrollServiceImpl.instance) {
            MyDeckBlockCloneScrollServiceImpl.instance = new MyDeckBlockCloneScrollServiceImpl(camera, scene, renderer);
        }
        return MyDeckBlockCloneScrollServiceImpl.instance;
    }

    public setScrollEnabled(isEnabled: boolean): void {
        this.scrollEnable = isEnabled;
    }

    public isScrollEnabled(): boolean {
        return this.scrollEnable;
    }

    public async onWheelScroll(event: WheelEvent): Promise<void> {
        if (!this.getMyDeckScrollEnabledById(2)) return;

        const currentDeckEditButtonClickDetect = this.getCurrentDeckEditButtonClickState();
        if (currentDeckEditButtonClickDetect == false) return;

        const blockCloneCount = this.getBlockCloneCount();
        console.log(`Block Clone Count?: ${blockCloneCount}`);
        if (blockCloneCount < 9) return;

        const scrollTargets = [
            this.getBlockCloneGroup(), // scrollTargetBlock
            this.getNumberOfSelectedCardsCloneGroup(),
            this.getCardNameCloneGroup(),
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Clone Group:", scrollTargets[0]);
        console.log("Scroll Target Clone Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTarget Clone position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

        const lowerLimit = 0.073 * window.innerHeight * (blockCloneCount - 8) + (0.166 * (250/1130) / 3) * window.innerWidth;
        const upperLimit = 0;
        console.log(`upperLimit: ${upperLimit}`); // 최대로 올릴 수 있는 범위
        console.log(`lowerLimit: ${lowerLimit}`); // 최대로 내릴 수 있는 범위

        scrollTargets.forEach(target => {
            if (target) {
                target.position.y += delta;
                target.position.y = Math.max(Math.min(target.position.y, lowerLimit), upperLimit);
            }
        });

        console.log('After Scroll- Scroll Target Clone Position Y', scrollTargets[0]?.position.y);
    }

    private getMyDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMyDeckScrollEnabledById(areaId);
    }

    public getBlockCloneCount(): number {
        return this.myDeckBlockCloneRepository.findCloneCount();
    }

    public getCurrentDeckEditButtonClickState(): boolean | null {
        return this.deckEditButtonClickDetectRepository.getCurrentButtonClickState();
    }

    private getBlockCloneGroup(): THREE.Group {
        return this.myDeckBlockCloneRepository.findCloneGroup();
    }

    private getNumberOfSelectedCardsCloneGroup(): THREE.Group {
        return this.myDeckNumberOfSelectedCardsCloneRepository.findCloneGroup();
    }

    private getCardNameCloneGroup(): THREE.Group {
        return this.myDeckCardNameCloneRepository.findCloneGroup();
    }

}
