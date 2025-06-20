import * as THREE from "three";

import {MyDeckBlockScrollService} from "./MyDeckBlockScrollService";
import {MyDeckBlockRepositoryImpl} from "../../my_deck_block/repository/MyDeckBlockRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckCardNameRepositoryImpl} from "../../my_deck_card_name/repository/MyDeckCardNameRepositoryImpl";
import {MyDeckNumberOfSelectedCardsRepositoryImpl} from "../../my_deck_number_of_selected_cards/repository/MyDeckNumberOfSelectedCardsRepositoryImpl";
import {DeckCardDeleteButtonRepositoryImpl} from "../../deck_card_delete_button/repository/DeckCardDeleteButtonRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../../side_scroll_area_detect/repository/SideScrollAreaDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckBlockScrollServiceImpl implements MyDeckBlockScrollService {
    private static instance: MyDeckBlockScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckBlockRepository: MyDeckBlockRepositoryImpl;
    private myDeckCardNameRepository: MyDeckCardNameRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckNumberOfSelectedCardsRepository: MyDeckNumberOfSelectedCardsRepositoryImpl;
    private deckCardDeleteButtonRepository: DeckCardDeleteButtonRepositoryImpl;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;

    private scrollState: boolean = true;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckBlockRepository = MyDeckBlockRepositoryImpl.getInstance();
        this.myDeckCardNameRepository = MyDeckCardNameRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckNumberOfSelectedCardsRepository = MyDeckNumberOfSelectedCardsRepositoryImpl.getInstance();
        this.deckCardDeleteButtonRepository = DeckCardDeleteButtonRepositoryImpl.getInstance(scene);
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
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

    public async onWheelScroll(event: WheelEvent): Promise<void> {
        if (!this.getMyDeckScrollEnabledById(2)) return;

        const currentClickDeckId = this.getCurrentClickDeckButtonId();
        if (currentClickDeckId == null) return;
        console.log(`%c current click deck id?${currentClickDeckId}`, 'color: #0000FF; font-weight: bold;');

        const blockCount = this.getBlockCountByDeckId(currentClickDeckId);
        console.log(`Block Count?${blockCount}`);
        if (blockCount < 9) return;

        const scrollTargets = [
            this.getBlockGroup(currentClickDeckId), // scrollTargetBlock
            this.getCardNameGroup(currentClickDeckId),
            this.getNumberOfSelectedCardsGroup(currentClickDeckId),
            this.getDeckCardDeleteButtonGroup(currentClickDeckId),
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Block Group:", scrollTargets[0]);
        console.log("Scroll Target Block Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTarget Deck Block position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

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

    private getNumberOfSelectedCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfSelectedCardsRepository.findNumberGroupByDeckId(deckId);
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getDeckCardDeleteButtonGroup(deckId: number): THREE.Group {
        return this.deckCardDeleteButtonRepository.findButtonGroupByDeckId(deckId);
    }

    private getMyDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMyDeckScrollEnabledById(areaId);
    }

}
