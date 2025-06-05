import {MyDeckOwnedCardsClickDetectService} from "./MyDeckOwnedCardsClickDetectService";

import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";

import {MyDeckOwnedCardsClickDetectRepositoryImpl} from "../repository/MyDeckOwnedCardsClickDetectRepositoryImpl";
import {MyDeckOwnedCardsRepositoryImpl} from "../../my_deck_owned_cards/repository/MyDeckOwnedCardsRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

import * as THREE from "three";

export class MyDeckOwnedCardsClickDetectServiceImpl implements MyDeckOwnedCardsClickDetectService {
    private static instance: MyDeckOwnedCardsClickDetectServiceImpl | null = null;
    private cameraRepository: CameraRepository;
    private myDeckOwnedCardsClickDetectRepository: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private myDeckOwnedCardsRepository: MyDeckOwnedCardsRepositoryImpl;

    private cardClickEnabled: boolean = false;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance();
        this.myDeckOwnedCardsClickDetectRepository = MyDeckOwnedCardsClickDetectRepositoryImpl.getInstance();
        this.myDeckOwnedCardsRepository = MyDeckOwnedCardsRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): MyDeckOwnedCardsClickDetectServiceImpl {
        if (!MyDeckOwnedCardsClickDetectServiceImpl.instance) {
            MyDeckOwnedCardsClickDetectServiceImpl.instance = new MyDeckOwnedCardsClickDetectServiceImpl(camera, scene);
        }
        return MyDeckOwnedCardsClickDetectServiceImpl.instance;
    }

    public setCardClickEnabled(isEnabled: boolean): void {
        this.cardClickEnabled = isEnabled;
    }

    public isCardClickEnabled(): boolean {
        return this.cardClickEnabled;
    }

    async handleCardClick(clickPoint: { x: number; y: number }): Promise<MyDeckOwnedCards | null> {
        const { x, y } = clickPoint;
        const allCards = this.getAllOwnedCardsList();
        const clickedCard = this.myDeckOwnedCardsClickDetectRepository.isMyDeckOwnedCardsClicked(
            { x, y },
            allCards,
            this.camera
        );

        if (clickedCard) {
            const cardUniqueId = clickedCard.id;
            const cardId = this.getCardIdByCardUniqueId(cardUniqueId);

            if (cardId == null) return null;

            console.log(`Clicked My Deck Owned Card Unique ID: ${cardUniqueId}, Card ID: ${cardId}`);

            this.saveCurrentClickedCardId(cardUniqueId);

            return clickedCard;
        }
        return null;
    }

    public async onMouseDown(event: MouseEvent): Promise<MyDeckOwnedCards | null> {
        if (event.button === 0) {
            const clickPoint = { x: event.clientX, y: event.clientY };
            return await this.handleCardClick(clickPoint);
        }
        return null;
    }

    private saveCurrentClickedCardId(cardUniqueId: number): void {
        this.myDeckOwnedCardsClickDetectRepository.saveCurrentClickedCardId(cardUniqueId);
    }

    public getCurrentClickedCardId(): number | null {
        return this.myDeckOwnedCardsClickDetectRepository.getCurrentClickedCardId() ?? null;
    }

    private getAllOwnedCardsList(): MyDeckOwnedCards[] {
        return this.myDeckOwnedCardsRepository.findAllCards();
    }

    private getCardIdByCardUniqueId(cardUniqueId: number): number | null {
        return this.myDeckOwnedCardsRepository.findCardIdByCardUniqueId(cardUniqueId);
    }

}
