import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MyCardScreenCardService} from "./MyCardScreenCardService";
import {MyCardScreenCard} from "../../my_card_screen_card/entity/MyCardScreenCard";
import {MyCardScreenCardRepositoryImpl} from "../../my_card_screen_card/repository/MyCardScreenCardRepositoryImpl";
import {MyCardScreenCardPositionRepositoryImpl} from "../../my_card_screen_card_position/repository/MyCardScreenCardPositionRepositoryImpl";
import {MyCardScreenCardPosition} from "../../my_card_screen_card_position/entity/MyCardScreenCardPosition";
import {CardStateManager} from "../../my_card_screen_card_manager/CardStateManager";
import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

export class MyCardScreenCardServiceImpl implements MyCardScreenCardService {
    private static instance: MyCardScreenCardServiceImpl;
    private myCardScreenCardRepository: MyCardScreenCardRepositoryImpl;
    private myCardScreenCardPositionRepository: MyCardScreenCardPositionRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private cardStateManager: CardStateManager;
    private clippingMaskManager: ClippingMaskManager;

    private constructor() {
        this.myCardScreenCardRepository = MyCardScreenCardRepositoryImpl.getInstance();
        this.myCardScreenCardPositionRepository = MyCardScreenCardPositionRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();

        this.cardStateManager = CardStateManager.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(): MyCardScreenCardServiceImpl {
        if (!MyCardScreenCardServiceImpl.instance) {
            MyCardScreenCardServiceImpl.instance = new MyCardScreenCardServiceImpl();
        }
        return MyCardScreenCardServiceImpl.instance;
    }

    public async createMyCardScreenCardWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null> {
        const cardGroup = new THREE.Group();
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
                        const position = this.myCardScreenCardPosition(cardId, index + 1);
                        console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                        const cardCount = cardIdToCountMap.get(cardId);
                        if (cardCount === undefined) {
                            console.warn(`[WARN] Card count not found for cardId: ${cardId}, defaulting to 0`);
                            return;
                        }
                        console.log(`[DEBUG] Card id: ${cardId}, Card count: ${cardCount}`);
                        const myCardScreenCard = await this.createMyCardScreenCard(cardId, cardCount, position.position);
                        cardGroup.add(myCardScreenCard.getMesh());
                    })
                );
            }

        } catch (error) {
            console.error(`[Error] Failed to create My Card Screen Card: ${error}`);
            return null;
        }
        return cardGroup;
    }


    public adjustMyCardScreenCardPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardIdList = this.getAllCardIdList();
        for (const cardId of cardIdList) {
            const cardMesh = this.getCardMeshByCardId(cardId);
            if (!cardMesh) {
                console.warn(`[WARN] cardMesh with card ID ${cardId} not found`);
                continue;
            }

            const initialPosition = this.getPositionByCardId(cardId);
            console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

            if (!initialPosition) {
                console.error(`[DEBUG] (adjust) No position found for card id: ${cardId}`);
                continue;
            }

            const cardWidth = 0.125 * window.innerWidth;
//             const cardHeight = 0.3980 * window.innerHeight;
            const cardHeight = cardWidth * 1.6176;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;
            console.log(`[DEBUG] (adjust) Card ${cardId}:`, {
                initialPosition: initialPosition,
                newPositionX,
                newPositionY,
            });

            cardMesh.geometry.dispose();
            cardMesh.geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
            cardMesh.position.set(newPositionX, newPositionY, 0);

            const scrollArea = this.getScrollArea();
            if (scrollArea) {
                scrollArea.width = 0.902 * windowWidth;
                scrollArea.height = 0.884 * windowHeight;
                scrollArea.position.set(0.048 * window.innerWidth, -0.06 * window.innerHeight);
                const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                this.applyClippingPlanesToMesh(cardMesh, clippingPlanes);
            }
        }
    }

    private async createMyCardScreenCard(cardId: number, cardCount: number, position: Vector2d): Promise<MyCardScreenCard> {
        return await this.myCardScreenCardRepository.createMyCardScreenCard(cardId, cardCount, position);
    }

    private myCardScreenCardPosition(cardId: number, cardIndex: number): MyCardScreenCardPosition {
        return this.myCardScreenCardPositionRepository.addMyCardScreenCardPosition(cardId, cardIndex);
    }

    public getPositionByCardId(cardId: number): MyCardScreenCardPosition | null{
        return this.myCardScreenCardPositionRepository.findPositionByCardId(cardId);
    }

    public getCardMeshByCardId(cardId: number): THREE.Mesh | null {
        const card = this.myCardScreenCardRepository.findCardByCardId(cardId);
        if (!card) {
            console.warn(`[WARN] Card with ID ${cardId} not found`);
            return null;
        }
        const cardMesh = card.getMesh();
        return cardMesh;
    }

    public getAllCard(): MyCardScreenCard[] {
        return this.myCardScreenCardRepository.findAllCard();
    }

    public getAllCardIdList(): number[] {
        return this.myCardScreenCardRepository.findAllCardIdList();
    }

//     public initializeCardVisibility(cardIdList: number[]): void {
//         this.cardStateManager.initializeCardVisibility(cardIdList);
//     }

    // 첫 화면에 휴먼 종족 버튼 클릭된 것으로 나타나야 함.
    public initializeCardVisibility(): void {
        const humanCardIdList = this.myCardScreenCardRepository.findCardIdsByRaceId("1");
        const undeadCardIdList = this.myCardScreenCardRepository.findCardIdsByRaceId("2");
        const trentCardIdList = this.myCardScreenCardRepository.findCardIdsByRaceId("3");
        humanCardIdList.forEach((cardId) => this.cardStateManager.setCardVisibility(cardId, true));
        this.cardStateManager.initializeCardVisibility(undeadCardIdList);
        this.cardStateManager.initializeCardVisibility(trentCardIdList);
    }

    public getHumanCardGroups(): THREE.Group {
        return this.myCardScreenCardRepository.findHumanCardGroup();
    }

    public getUndeadCardGroups(): THREE.Group {
        return this.myCardScreenCardRepository.findUndeadCardGroup();
    }

    public getTrentCardGroups(): THREE.Group {
        return this.myCardScreenCardRepository.findTrentCardGroup();
    }

    public resetCardGroups(): void {
        this.myCardScreenCardRepository.resetCardGroups();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(2, 0);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

}
