import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MyCardScreenCardEffectService} from "./MyCardScreenCardEffectService";
import {MyCardScreenCardEffect} from "../entity/MyCardScreenCardEffect";
import {MyCardScreenCardEffectRepositoryImpl} from "../repository/MyCardScreenCardEffectRepositoryImpl";
import {MyCardScreenCardEffectPositionRepositoryImpl} from "../../my_card_screen_card_effect_position/repository/MyCardScreenCardEffectPositionRepositoryImpl";
import {MyCardScreenCardEffectPosition} from "../../my_card_screen_card_effect_position/entity/MyCardScreenCardEffectPosition";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {CardEffectStateManager} from "../../my_card_screen_card_effect_manager/CardEffectStateManager";

export class MyCardScreenCardEffectServiceImpl implements MyCardScreenCardEffectService {
    private static instance: MyCardScreenCardEffectServiceImpl;
    private myCardScreenCardEffectRepository: MyCardScreenCardEffectRepositoryImpl;
    private myCardScreenCardEffectPositionRepository: MyCardScreenCardEffectPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;
    private cardEffectStateManager: CardEffectStateManager;

    private constructor() {
        this.myCardScreenCardEffectRepository = MyCardScreenCardEffectRepositoryImpl.getInstance();
        this.myCardScreenCardEffectPositionRepository = MyCardScreenCardEffectPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();

        this.clippingMaskManager = ClippingMaskManager.getInstance();
        this.cardEffectStateManager = CardEffectStateManager.getInstance();
    }

    public static getInstance(): MyCardScreenCardEffectServiceImpl {
        if (!MyCardScreenCardEffectServiceImpl.instance) {
            MyCardScreenCardEffectServiceImpl.instance = new MyCardScreenCardEffectServiceImpl();
        }
        return MyCardScreenCardEffectServiceImpl.instance;
    }

    public async createMyCardScreenCardEffectWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null> {
        const effectGroup = new THREE.Group();
        const raceMap: Record<string, number[]> = {
            "1": [], // humanCardIdList
            "2": [], // undeadCardIdList
            "3": [], // humanCardIdList
        };
        const cardIdList = Array.from(cardIdToCountMap.keys());

        try {
            cardIdList.forEach((cardId)=>{
                const card = getCardById(cardId);
                if (!card) {
                    throw new Error(`Card with ID ${cardId} not found`);
                }
                const cardRace = card.종족;
                switch (cardRace) {
                    case "1":
                        raceMap["1"].push(cardId);
                        break;
                    case "2":
                        raceMap["2"].push(cardId);
                        break;
                    case "3":
                        raceMap["3"].push(cardId);
                        break;
                    default:
                        console.warn(`[WARN] Unknown race "${cardRace}" for cardId: ${cardId}`);
                }
            });
            for (const [race, idList] of Object.entries(raceMap)) {
                await Promise.all(
                    idList.map(async (cardId, index) => {
                        const position = this.myCardScreenCardEffectPosition(cardId, index + 1);
                        console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                        const myCardScreenCardEffect = await this.createMyCardScreenCardEffect(cardId, position.position);
                        effectGroup.add(myCardScreenCardEffect.getMesh());
                    })
                );
            }

        } catch (error) {
            console.error(`[Error] Failed to create My Card Screen Card Effect: ${error}`);
            return null;
        }
        return effectGroup;
    }


    public adjustMyCardScreenCardEffectPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardIdList = this.getAllCardIdList();
        for (const cardId of cardIdList) {
            const effectMesh = this.getEffectMeshByCardId(cardId);
            if (!effectMesh) {
                console.warn(`[WARN] Card Effect Mesh with card ID ${cardId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByCardId(cardId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for card id: ${cardId}`);
                continue;
            }

            const effectWidth = 0.125 * window.innerWidth;
            const effectHeight = effectWidth * 1.6176;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Card Effect ${cardId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            effectMesh.geometry.dispose();
            effectMesh.geometry = new THREE.PlaneGeometry(effectWidth, effectHeight);
            effectMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.902 * windowWidth;
                scrollArea.height = 0.884 * windowHeight;
                scrollArea.position.set(0.048 * window.innerWidth, -0.06 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                this.applyClippingPlanesToMesh(effectMesh, clippingPlanes);
            }
        }
    }

    private async createMyCardScreenCardEffect(cardId: number, position: Vector2d): Promise<MyCardScreenCardEffect> {
        return await this.myCardScreenCardEffectRepository.createMyCardScreenCardEffect(cardId, position);
    }

    private myCardScreenCardEffectPosition(cardId: number, cardIndex: number): MyCardScreenCardEffectPosition {
        return this.myCardScreenCardEffectPositionRepository.addMyCardScreenCardEffectPosition(cardId, cardIndex);
    }

    public getPositionByCardId(cardId: number): MyCardScreenCardEffectPosition | null{
        return this.myCardScreenCardEffectPositionRepository.findPositionByCardId(cardId);
    }

    public getEffectMeshByCardId(cardId: number): THREE.Mesh | null {
        const effect = this.myCardScreenCardEffectRepository.findEffectByCardId(cardId);
        if (!effect) {
            console.warn(`[WARN] Card Effect with ID ${cardId} not found`);
            return null;
        }
        return effect.getMesh();
    }

    public getAllCardEffect(): MyCardScreenCardEffect[] {
        return this.myCardScreenCardEffectRepository.findAllEffect();
    }

    public getAllCardIdList(): number[] {
        return this.myCardScreenCardEffectRepository.findAllCardIdList();
    }

    public getHumanEffectGroups(): THREE.Group {
        return this.myCardScreenCardEffectRepository.findHumanEffectGroup();
    }

    public getUndeadEffectGroups(): THREE.Group {
        return this.myCardScreenCardEffectRepository.findUndeadEffectGroup();
    }

    public getTrentEffectGroups(): THREE.Group {
        return this.myCardScreenCardEffectRepository.findTrentEffectGroup();
    }

    public resetCardEffectGroups(): void {
        this.myCardScreenCardEffectRepository.resetEffectGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(2, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public initializeCardEffectVisibility(): void {
        const allCardIdList = this.getAllCardIdList();
        this.cardEffectStateManager.initializeEffectVisibility(allCardIdList);
    }

}
