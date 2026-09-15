import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MakeDeckScreenCardService} from "./MakeDeckScreenCardService";
import {MakeDeckScreenCard} from "../entity/MakeDeckScreenCard";
import {MakeDeckScreenCardRepository} from "../repository/MakeDeckScreenCardRepository";
import {MakeDeckScreenCardRepositoryImpl} from "../repository/MakeDeckScreenCardRepositoryImpl";
import {MakeDeckScreenCardPositionRepositoryImpl} from "../../make_deck_screen_card_position/repository/MakeDeckScreenCardPositionRepositoryImpl";
import {MakeDeckScreenCardPosition} from "../../make_deck_screen_card_position/entity/MakeDeckScreenCardPosition";

export class MakeDeckScreenCardServiceImpl implements MakeDeckScreenCardService {
    private static instance: MakeDeckScreenCardServiceImpl;
    private makeDeckScreenCardRepository: MakeDeckScreenCardRepositoryImpl;
    private makeDeckScreenCardPositionRepository: MakeDeckScreenCardPositionRepositoryImpl;

    private constructor(makeDeckScreenCardRepository: MakeDeckScreenCardRepository) {
        this.makeDeckScreenCardRepository = MakeDeckScreenCardRepositoryImpl.getInstance();
        this.makeDeckScreenCardPositionRepository = MakeDeckScreenCardPositionRepositoryImpl.getInstance();
    }

    public static getInstance(): MakeDeckScreenCardServiceImpl {
        if (!MakeDeckScreenCardServiceImpl.instance) {
            const repository = MakeDeckScreenCardRepositoryImpl.getInstance();
            MakeDeckScreenCardServiceImpl.instance = new MakeDeckScreenCardServiceImpl(repository);
        }
        return MakeDeckScreenCardServiceImpl.instance;
    }

    public async createMakeDeckScreenCardWithPosition(cardIdToCountMap: Map<number, number>): Promise<THREE.Group | null> {
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
                        const position = this.makeDeckScreenCardPosition(cardId, index + 1);
                        console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                        const cardCount = cardIdToCountMap.get(cardId);
                        if (cardCount === undefined) {
                            console.warn(`[WARN] Card count not found for cardId: ${cardId}, defaulting to 0`);
                            return;
                        }
                        console.log(`[DEBUG] Card id: ${cardId}, Card count: ${cardCount}`);
                        const makeDeckScreenCard = await this.createMakeDeckScreenCard(cardId, cardCount, position.position);
                        cardGroup.add(makeDeckScreenCard.getMesh());
                    })
                );
            }

        } catch (error) {
            console.error(`[Error] Failed to create MyDeckCardScene: ${error}`);
            return null;
        }
        return cardGroup;
    }

//     public async createMakeDeckScreenCardWithPosition(cardIdList: number[], cardCountList: number[]): Promise<THREE.Group | null> {
//         const cardGroup = new THREE.Group();
//         const cardList = Array.from(new Set(cardIdList));
//         const raceMap: Record<string, number[]> = {
//             "1": [], // humanCardIdList
//             "2": [], // undeadCardIdList
//             "3": [], // humanCardIdList
//         };
//
//         const cardIdToCountMap: Record<number, number> = {};
//             cardIdList.forEach((cardId, index) => {
//                 cardIdToCountMap[cardId] = cardCountList[index]; // 대응하는 cardCount 저장
//         });
//
//         try {
//             cardIdList.forEach((cardId)=>{
//                 const card = getCardById(cardId);
//                 if (!card) {
//                     throw new Error(`Card with ID ${cardId} not found`);
//                 }
//                 const cardRace = card.종족;
//                 switch (cardRace) {
//                     case "1":
//                         raceMap["1"].push(cardId);
//                         break;
//                     case "2":
//                         raceMap["2"].push(cardId);
//                         break;
//                     case "3":
//                         raceMap["3"].push(cardId);
//                         break;
//                     default:
//                         console.warn(`[WARN] Unknown race "${cardRace}" for cardId: ${cardId}`);
//                 }
//             });
//             for (const [race, idList] of Object.entries(raceMap)) {
//                 await Promise.all(
//                     idList.map(async (cardId, index) => {
//                         const position = this.makeDeckScreenCardPosition(cardId, index + 1);
//                         console.log(`[DEBUG] CardId ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);
//
//                         const cardCount = cardIdToCountMap[cardId];
//                         const makeDeckScreenCard = await this.createMakeDeckScreenCard(cardId, cardCount, position.position);
//                         cardGroup.add(makeDeckScreenCard.getMesh());
//                     })
//                 );
//             }
//
//         } catch (error) {
//             console.error(`[Error] Failed to create MyDeckCardScene: ${error}`);
//             return null;
//         }
//         return cardGroup;
//     }

    public adjustMakeDeckScreenCardPosition(): void {
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

            const cardWidth = 0.112 * window.innerWidth;
            const cardHeight = 0.345 * window.innerHeight;

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
        }
    }

    private async createMakeDeckScreenCard(cardId: number, cardCount: number, position: Vector2d): Promise<MakeDeckScreenCard> {
        return await this.makeDeckScreenCardRepository.createMakeDeckScreenCard(cardId, cardCount, position);
    }

    private makeDeckScreenCardPosition(cardId: number, cardIndex: number): MakeDeckScreenCardPosition {
        const position = this.makeDeckScreenCardPositionRepository.addMakeDeckScreenCardPosition(cardIndex);
        this.makeDeckScreenCardPositionRepository.save(cardId, position);
        return position;
    }

    public getPositionByCardId(cardId: number): MakeDeckScreenCardPosition | null{
        return this.makeDeckScreenCardPositionRepository.findPositionByCardId(cardId);
    }

    public getCardMeshByCardId(cardId: number): THREE.Mesh | null {
        const card = this.makeDeckScreenCardRepository.findCardByCardId(cardId);
        if (!card) {
            console.warn(`[WARN] Card with ID ${cardId} not found`);
            return null;
        }
        const cardMesh = card.getMesh();
        return cardMesh;
    }

    public getAllCardIdList(): number[] {
        return this.makeDeckScreenCardRepository.findCardIdList();
    }

}
