import * as THREE from "three";

import {MyDeckOwnedCardsScrollService} from "./MyDeckOwnedCardsScrollService";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";
import {CardSelectionBlockerRepositoryImpl} from "../../card_selection_blocker/repository/CardSelectionBlockerRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class MyDeckOwnedCardsScrollServiceImpl implements MyDeckOwnedCardsScrollService {
    private static instance: MyDeckOwnedCardsScrollServiceImpl | null = null;
    private renderer: THREE.WebGLRenderer;
    private cameraRepository: CameraRepository;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;
    private cardSelectionBlockerRepository: CardSelectionBlockerRepositoryImpl;

    private isScrollEnabled: boolean = true;

    private constructor(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.renderer = renderer;
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
        this.cardSelectionBlockerRepository = CardSelectionBlockerRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer): MyDeckOwnedCardsScrollServiceImpl {
        if (!MyDeckOwnedCardsScrollServiceImpl.instance) {
            MyDeckOwnedCardsScrollServiceImpl.instance = new MyDeckOwnedCardsScrollServiceImpl(camera, scene, renderer);
        }
        return MyDeckOwnedCardsScrollServiceImpl.instance;
    }

    public setCardScrollEnabled(state: boolean): void {
        this.isScrollEnabled = state;
    }

    public isCardScrollEnabled(): boolean {
        return this.isScrollEnabled;
    }

    public async onWheelScroll(event: WheelEvent): Promise<void> {
        const scrollTargets = [
            this.getOwnedCardGroup(), // scrollTargetDeckOwnedCard
            this.getCardSelectionBlocker(),
        ];

        if (scrollTargets.every(target => !target)) return;
        console.log("Scroll Target Card Group:", scrollTargets[0]);
        console.log("Scroll Target Card Group Children Count:", scrollTargets[0]?.children.length);
        console.log(`Before Scroll- scrollTarget Deck Card position: ${scrollTargets[0]?.position.y}`);

        event.preventDefault(); // 기본 스크롤 방지

        const scrollSpeed = 0.2;
        const delta = event.deltaY * scrollSpeed;

        const cardRowCount = this.getCardRowCount();
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

    private getOwnedCardGroup(): THREE.Group {
        return this.myDeckOwnedCardsRepository.findCardGroup();
    }

    private getCardSelectionBlocker(): THREE.Group {
        return this.cardSelectionBlockerRepository.findBlockerGroup();
    }

    private getCardCount(): number {
        return this.myDeckOwnedCardsRepository.findAllCardCount();
    }

    public getCardRowCount(): number {
        const cardCount = this.getCardCount();
        const rowCount = Math.ceil(cardCount / 4);

        return rowCount;
    }

}
