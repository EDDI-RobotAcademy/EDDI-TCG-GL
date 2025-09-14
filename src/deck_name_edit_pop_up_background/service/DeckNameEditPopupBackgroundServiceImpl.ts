import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckNameEditPopupBackgroundService} from './DeckNameEditPopupBackgroundService';
import {DeckNameEditPopupBackground} from "../entity/DeckNameEditPopupBackground";
import {DeckNameEditPopupBackgroundRepositoryImpl} from "../repository/DeckNameEditPopupBackgroundRepositoryImpl";

export class DeckNameEditPopupBackgroundServiceImpl implements DeckNameEditPopupBackgroundService {
    private static instance: DeckNameEditPopupBackgroundServiceImpl;
    private deckNameEditPopupBackgroundRepository: DeckNameEditPopupBackgroundRepositoryImpl;

    private constructor() {
        this.deckNameEditPopupBackgroundRepository = DeckNameEditPopupBackgroundRepositoryImpl.getInstance();
    }

    public static getInstance(): DeckNameEditPopupBackgroundServiceImpl {
        if (!DeckNameEditPopupBackgroundServiceImpl.instance) {
            DeckNameEditPopupBackgroundServiceImpl.instance = new DeckNameEditPopupBackgroundServiceImpl();
        }
        return DeckNameEditPopupBackgroundServiceImpl.instance;
    }

    public async createDeckNameEditPopupBackground(): Promise<THREE.Mesh | null> {
        const background = await this.deckNameEditPopupBackgroundRepository.createPopupBackground();
        const backgroundMesh = background.getMesh();

        return backgroundMesh;
    }

    public adjustDeckMakePopupBackgroundPosition(): void {
        const background = this.getDeckNameEditPopupBackground();
        if (!background) {
            console.error("Deck Name Edit Popup Background is null. Cannot adjust position.");
            return;
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const backgroundMesh = background.getMesh();

        const backgroundWidth = 0.425 * windowWidth;
        const backgroundHeight = backgroundWidth * (440/1000);

        const newPositionX = windowWidth / background.getWidth();
        const newPositionY = windowHeight / background.getHeight();

        backgroundMesh.geometry.dispose();
        backgroundMesh.geometry = new THREE.PlaneGeometry(backgroundWidth, backgroundHeight);

        backgroundMesh.position.set(newPositionX, newPositionY, 0);

    }

    public getDeckNameEditPopupBackground(): DeckNameEditPopupBackground | null {
        return this.deckNameEditPopupBackgroundRepository.findPopupBackground();
    }

    public deleteDeckNameEditPopupBackground(): void {
        this.deckNameEditPopupBackgroundRepository.deletePopupBackground();
    }

}
