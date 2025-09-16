import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {DeckNameEditInfoTextType} from "../entity/DeckNameEditInfoTextType";

import {DeckNameEditInfoTextService} from './DeckNameEditInfoTextService';
import {DeckNameEditInfoText} from "../entity/DeckNameEditInfoText";
import {DeckNameEditInfoTextRepositoryImpl} from "../repository/DeckNameEditInfoTextRepositoryImpl";

export class DeckNameEditInfoTextServiceImpl implements DeckNameEditInfoTextService {
    private static instance: DeckNameEditInfoTextServiceImpl;
    private deckNameEditInfoTextRepository: DeckNameEditInfoTextRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.deckNameEditInfoTextRepository = DeckNameEditInfoTextRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): DeckNameEditInfoTextServiceImpl {
        if (!DeckNameEditInfoTextServiceImpl.instance) {
            DeckNameEditInfoTextServiceImpl.instance = new DeckNameEditInfoTextServiceImpl(scene);
        }
        return DeckNameEditInfoTextServiceImpl.instance;
    }

    public async createDeckNameEditInfoText(
        typeId: DeckNameEditInfoTextType,
        color: string,
        infoText: string,
        position: Vector2d
    ): Promise<THREE.Group | null> {
        const textGroup = new THREE.Group();
        try {
            const deckNameText = await this.deckNameEditInfoTextRepository.createDeckNameEditInfoText(typeId, color, infoText, position);
            const deckNameTextMesh = deckNameText.getMesh();
            textGroup.add(deckNameTextMesh);

        } catch (error) {
            console.error('Error creating Deck Name Edit Info Text:', error);
            return null;
        }
        return textGroup;
    }

    public adjustDeckNameEditInfoTextPosition(): void {
        const infoTextList = this.getAllDeckNameEditInfoText();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        infoTextList.forEach((infoText) =>{
            const infoTextMesh = infoText.getMesh();
            const initialPosition = infoText.position;

            const infoTextWidth = (infoText.width / 1800) * windowWidth;
            const infoTextHeight = infoTextWidth * (infoText.height / infoText.width);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            infoTextMesh.geometry.dispose();
            infoTextMesh.geometry = new THREE.PlaneGeometry(infoTextWidth, infoTextHeight);
            infoTextMesh.position.set(newPositionX, newPositionY, 0);
        });
    }

    public getAllDeckNameEditInfoText(): DeckNameEditInfoText[] {
        return this.deckNameEditInfoTextRepository.findAllInfoText();
    }

}
