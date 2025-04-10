import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {MyDeckNameTextService} from './MyDeckNameTextService';
import {MyDeckNameText} from "../entity/MyDeckNameText";
import {MyDeckNameTextRepository} from "../repository/MyDeckNameTextRepository";
import {MyDeckNameTextRepositoryImpl} from "../repository/MyDeckNameTextRepositoryImpl";
import {MyDeckNameTextPosition} from "../../my_deck_name_text_position/entity/MyDeckNameTextPosition";
import {MyDeckNameTextPositionRepositoryImpl} from "../../my_deck_name_text_position/repository/MyDeckNameTextPositionRepositoryImpl";
import {NameTextStateManager} from "../../my_deck_name_text_manager/NameTextStateManager";

export class MyDeckNameTextServiceImpl implements MyDeckNameTextService {
    private static instance: MyDeckNameTextServiceImpl;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private myDeckNameTextPositionRepository: MyDeckNameTextPositionRepositoryImpl;
    private nameTextStateManager: NameTextStateManager;

    private constructor(myDeckNameTextRepository: MyDeckNameTextRepository) {
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance();
        this.myDeckNameTextPositionRepository = MyDeckNameTextPositionRepositoryImpl.getInstance();
        this.nameTextStateManager = NameTextStateManager.getInstance();
    }

    public static getInstance(): MyDeckNameTextServiceImpl {
        if (!MyDeckNameTextServiceImpl.instance) {
            const repository = MyDeckNameTextRepositoryImpl.getInstance();
            MyDeckNameTextServiceImpl.instance = new MyDeckNameTextServiceImpl(repository);
        }
        return MyDeckNameTextServiceImpl.instance;
    }

    public async createMyDeckNameTextWithPosition(deckId: number, deckName: string): Promise<THREE.Group | null> {
        const textGroup = new THREE.Group();
        try {
            const position = this.myDeckNameTextPosition(deckId);
            console.log(`[DEBUG] Deck ${deckId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);
            this.saveMyDeckNameTextPosition(deckId, position);

            const deckNameText = await this.createMyDeckNameText(deckId, deckName, position.position);
            textGroup.add(deckNameText.mesh);

        } catch (error) {
            console.error('Error creating my deck button with position:', error);
            return null;
        }
        return textGroup;
    }

    private async createMyDeckNameText(deckId: number, deckName: string, position: Vector2d): Promise<MyDeckNameText> {
        return await this.myDeckNameTextRepository.createMyDeckNameText(deckId, deckName, position);
    }

    private myDeckNameTextPosition(deckId: number): MyDeckNameTextPosition {
        return this.myDeckNameTextPositionRepository.addMyDeckNameTextPosition(deckId);
    }

    private saveMyDeckNameTextPosition(deckId: number, position: MyDeckNameTextPosition): void {
        this.myDeckNameTextPositionRepository.save(deckId, position);
    }

    public adjustMyDeckNameTextPosition(): void {
        const nameTextList = this.myDeckNameTextRepository.findAll();
        const Position = this.myDeckNameTextPositionRepository.findAll();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        console.log('nameTextList:', nameTextList);
        console.log('nameTextPosition:', Position);

        for (const text of nameTextList) {
            const textMesh = text.getMesh();
            const textId = text.id;
            console.log(`Name Text ID: ${text.id}`);
            const initialPosition = this.myDeckNameTextPositionRepository.findById(textId);
            console.log(`InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`No position found for text id: ${textId}`);
                continue;
            }

            const textWidth = text.width;
            const textHeight = text.height;

            const newPositionX = initialPosition.position.getX() * window.innerWidth;
            const newPositionY = initialPosition.position.getY() * window.innerHeight;
            console.log(`text ${textId}:`, {
                initialPosition: initialPosition.position,
                newPositionX,
                newPositionY,
            });

            textMesh.geometry.dispose();
            textMesh.geometry = new THREE.PlaneGeometry(textWidth, textHeight);
            textMesh.position.set(newPositionX, newPositionY, 0);
        }

    }

    public getMyDeckNameTextByDeckId(deckId: number): MyDeckNameText | null {
        return this.myDeckNameTextRepository.findNameTextByDeckId(deckId);
    }

    public getAllMyDeckNameText(): MyDeckNameText[] {
        return this.myDeckNameTextRepository.findAll();
    }

    public getDeckNameTextIdByDeckId(deckId: number): number | null {
        return this.myDeckNameTextRepository.findNameTextIdByDeckId(deckId);
    }

    public getAllDeckNameTextIdList(): number[] {
        return this.myDeckNameTextRepository.findAllNameTextIdList();
    }

    public deleteDeckNameTextByDeckId(deckId: number): void {
        this.myDeckNameTextRepository.deleteTextByDeckId(deckId);
    }

     public deleteAllDeckNameText(): void {
         this.myDeckNameTextRepository.deleteAll();
     }

}
