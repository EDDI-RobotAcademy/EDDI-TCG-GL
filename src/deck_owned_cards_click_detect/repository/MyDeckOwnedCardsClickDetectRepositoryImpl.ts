import * as THREE from "three";

import {MyDeckOwnedCardsClickDetectRepository} from "./MyDeckOwnedCardsClickDetectRepository";
import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";

export class MyDeckOwnedCardsClickDetectRepositoryImpl implements MyDeckOwnedCardsClickDetectRepository {
    private static instance: MyDeckOwnedCardsClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedCardId: number | null = null;
    private cardClickEnabled: boolean = false;

    public static getInstance(): MyDeckOwnedCardsClickDetectRepositoryImpl {
        if (!MyDeckOwnedCardsClickDetectRepositoryImpl.instance) {
            MyDeckOwnedCardsClickDetectRepositoryImpl.instance = new MyDeckOwnedCardsClickDetectRepositoryImpl();
        }
        return MyDeckOwnedCardsClickDetectRepositoryImpl.instance;
    }

    public isMyDeckOwnedCardsClicked(clickPoint: { x: number; y: number }, cardList: MyDeckOwnedCards[], camera: THREE.Camera): any | null {
        const { x, y } = clickPoint;
        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = cardList.map(card => card.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedCard = cardList.find(
                deckButton => deckButton.getMesh() === intersectedMesh
            );

            if (clickedCard) {
                console.log('Detect clicked Owned Cards!')
                return clickedCard;
            }
        }

        return null;
    }

    public saveCurrentClickedCardId(id: number): void {
        this.currentClickedCardId = id;
    }

    public getCurrentClickedCardId(): number | null {
        return this.currentClickedCardId;
    }

    public resetCurrentClickCardId(): void {
        this.currentClickedCardId = null;
    }

    public setCardClickEnabled(isEnabled: boolean): void {
        this.cardClickEnabled = isEnabled;
    }

    public isCardClickEnabled(): boolean {
        return this.cardClickEnabled;
    }

}