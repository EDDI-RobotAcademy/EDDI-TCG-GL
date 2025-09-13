import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckMakePopupBackgroundService} from './DeckMakePopupBackgroundService';
import {DeckMakePopupBackground} from "../entity/DeckMakePopupBackground";
import {DeckMakePopupBackgroundRepository} from "../repository/DeckMakePopupBackgroundRepository";
import {DeckMakePopupBackgroundRepositoryImpl} from "../repository/DeckMakePopupBackgroundRepositoryImpl";

export class DeckMakePopupBackgroundServiceImpl implements DeckMakePopupBackgroundService {
    private static instance: DeckMakePopupBackgroundServiceImpl;
    private deckMakePopupBackgroundRepository: DeckMakePopupBackgroundRepository;

    private constructor(deckMakePopupBackgroundRepository: DeckMakePopupBackgroundRepository) {
        this.deckMakePopupBackgroundRepository = deckMakePopupBackgroundRepository;
    }

    public static getInstance(): DeckMakePopupBackgroundServiceImpl {
        if (!DeckMakePopupBackgroundServiceImpl.instance) {
            const deckMakePopupBackgroundRepository = DeckMakePopupBackgroundRepositoryImpl.getInstance();
            DeckMakePopupBackgroundServiceImpl.instance = new DeckMakePopupBackgroundServiceImpl(deckMakePopupBackgroundRepository);
        }
        return DeckMakePopupBackgroundServiceImpl.instance;
    }

    public async createDeckMakePopupBackground(): Promise<THREE.Mesh | null> {
        const background = await this.deckMakePopupBackgroundRepository.createDeckMakePopupBackground();
        const backgroundMesh = background.getMesh();

        return backgroundMesh;
    }

    public adjustDeckMakePopupBackgroundPosition(): void {
        const background = this.getDeckMakePopupBackground();
        if (!background) {
            console.error("DeckMakePopupBackground is null. Cannot adjust position.");
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

    public getDeckMakePopupBackground(): DeckMakePopupBackground | null {
        return this.deckMakePopupBackgroundRepository.findDeckMakePopupBackground();
    }

    public deleteDeckMakePopupBackground(): void {
        this.deckMakePopupBackgroundRepository.deleteDeckMakePopupBackground();
    }

}
