import * as THREE from "three";

import {MyDeckCardScrollService} from "./MyDeckCardScrollService";
import {MyDeckCardRepositoryImpl} from "../../my_deck_card/repository/MyDeckCardRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {MyDeckNumberOfCardsRepositoryImpl} from "../../my_deck_number_of_cards/repository/MyDeckNumberOfCardsRepositoryImpl";
import {DeckCardCountMarkerRepositoryImpl} from "../../deck_card_count_marker/repository/DeckCardCountMarkerRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../../side_scroll_area_detect/repository/SideScrollAreaDetectRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckCardScrollServiceImpl implements MyDeckCardScrollService {
    private static instance: MyDeckCardScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckCardRepository: MyDeckCardRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private myDeckNumberOfCardsRepository: MyDeckNumberOfCardsRepositoryImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckCardRepository = MyDeckCardRepositoryImpl.getInstance(scene);
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.myDeckNumberOfCardsRepository = MyDeckNumberOfCardsRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): MyDeckCardScrollServiceImpl {
        if (!MyDeckCardScrollServiceImpl.instance) {
            MyDeckCardScrollServiceImpl.instance = new MyDeckCardScrollServiceImpl(camera, scene, renderer);
        }
        return MyDeckCardScrollServiceImpl.instance;
    }

    public async onWheelScroll(event: WheelEvent): Promise<void> {
        if (!this.getMyDeckScrollEnabledById(1)) return;

        const currentClickDeckId = this.getCurrentClickDeckButtonId();
        if (currentClickDeckId == null) return;
        console.log(`%c current click deck id?${currentClickDeckId}`, 'color: #0000FF; font-weight: bold;');

        const cardRowCount = this.getCardRowCount(currentClickDeckId);
        if (cardRowCount < 3) return;

        const scrollTargets = [
            this.getDeckCardGroup(currentClickDeckId), // scrollTargetDeckCard
            this.getNumberOfCardsGroup(currentClickDeckId),
            this.getDeckCardCountMarkerGroup(currentClickDeckId),
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Card Group:", scrollTargets[0]);
        console.log("Scroll Target Card Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTarget Deck Card position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

        console.log(`card row count?${cardRowCount}`);
        const lowerLimit = 0.34 * window.innerHeight * (cardRowCount - 2) + (0.096 * (1540 / 952) / 3) * window.innerWidth;
        const upperLimit = 0;
        console.log(`upperLimit: ${upperLimit}`); // 최대로 올릴 수 있는 범위
        console.log(`lowerLimit: ${lowerLimit}`); // 최대로 내릴 수 있는 범위

        scrollTargets.forEach(target => {
            if (target) {
                target.position.y += delta;
                target.position.y = Math.max(Math.min(target.position.y, lowerLimit), upperLimit);
            }
        });

        console.log('After Scroll- Scroll Target Deck Card Position Y', scrollTargets[0]?.position.y);
    }

    private getDeckCardGroup(deckId: number): THREE.Group {
        return this.myDeckCardRepository.findCardGroupByDeckId(deckId);
    }

    private getNumberOfCardsGroup(deckId: number): THREE.Group {
        return this.myDeckNumberOfCardsRepository.findNumberGroupByDeckId(deckId);
    }

    private getDeckCardCountMarkerGroup(deckId: number): THREE.Group {
        return this.deckCardCountMarkerRepository.findMarkerGroupByDeckId(deckId);
    }

    private getCardCountByDeckId(deckId: number): number {
        return this.myDeckCardRepository.findCardCountByDeckId(deckId);
    }

    public getCardRowCount(deckId: number): number {
        const cardCount = this.getCardCountByDeckId(deckId);
        console.log(`Card Count?${cardCount}`);
        const rowCount = Math.ceil(cardCount / 4);
        console.log(`Card Row Count? ${rowCount}`);

        return rowCount;
    }

    public getCurrentClickDeckButtonId(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    private getMyDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMyDeckScrollEnabledById(areaId);
    }

}
