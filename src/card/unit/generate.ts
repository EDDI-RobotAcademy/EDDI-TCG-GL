import * as THREE from "three";
import { Vector2d } from "../../common/math/Vector2d";
import { TextureManager } from "../../texture_manager/TextureManager";
import { MeshGenerator } from "../../mesh/generator";
import { CardJob } from "../job";
import { UserWindowSize } from "../../window_size/WindowSize";
import {CardState} from "../state";
import {CardStateManager} from "../CardStateManager";
import {BattleFieldUnitRepository} from "../../battle/unit/repository/BattleFieldUnitRepository";
import {LegacyDragAndDropManager} from "../../drag_and_drop/LegacyDragAndDropManager";

// interface CardInitialInfo {
//     cardMesh: THREE.Mesh;
//     initialPosition: Vector2d;
//     textureId: string;
//     width: number;
//     height: number;
//     cardIndex: number;
// }

export class UnitCardGenerator {
    private static resizeHandler: (() => void) | null = null;

    static async createUnitCard(card: any, position: Vector2d = new Vector2d(0, 0), indexCount: number = 0): Promise<THREE.Group> {
        const textureManager = TextureManager.getInstance();

        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        const unitJob = parseInt(card.병종, 10);
        const cardGroup = new THREE.Group();

        if (!cardTexture) {
            throw new Error('Card texture not found');
        }

        console.log('card:', card)

        const cardWidth = 0.064935 * window.innerWidth;
        const cardHeight = cardWidth * 1.615;

        // 메인 카드 Mesh 생성
        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);
        mainCardMesh.userData.cardNumber = card.카드번호
        mainCardMesh.userData.state = CardState.HAND
        cardGroup.add(mainCardMesh);

        this.saveCardInitialPosition(mainCardMesh, position, cardWidth, cardHeight, 'mainCardTextureId', indexCount);

        // 무기, 종족, 체력, 에너지 추가
        await this.addOptionalTextures(card, cardGroup, cardWidth, cardHeight, position, unitJob, indexCount);

        // Resize 이벤트 핸들러 등록
        this.registerResizeHandler();

        return cardGroup;
    }

    private static async addOptionalTextures(
        card: any,
        group: THREE.Group,
        cardWidth: number,
        cardHeight: number,
        position: Vector2d,
        unitJob: number,
        indexCount: number
    ) {
        const textureManager = TextureManager.getInstance();

        const textures = await Promise.all([
            unitJob === CardJob.WARRIOR ? textureManager.getTexture('sword_power', card.공격력) : null,
            textureManager.getTexture('race', card.종족),
            textureManager.getTexture('hp', card.체력),
            textureManager.getTexture('energy', 0),
        ]);

        const [weaponTexture, raceTexture, hpTexture, energyTexture] = textures;

        if (weaponTexture) {
            const weaponPosition = new Vector2d(position.getX() + cardWidth * 0.44, position.getY() - cardHeight * 0.45666);
            this.addTextureToGroup(group, weaponTexture, cardWidth * 0.63, cardWidth * 0.63 * 1.651, weaponPosition, 'weaponTextureId', indexCount);
        }

        if (raceTexture) {
            const racePosition = new Vector2d(position.getX() + cardWidth * 0.5, position.getY() + cardHeight * 0.5);
            this.addTextureToGroup(group, raceTexture, cardWidth * 0.4, cardWidth * 0.4, racePosition, 'raceTextureId', indexCount);
        }

        if (hpTexture) {
            const hpPosition = new Vector2d(position.getX() - cardWidth * 0.5, position.getY() - cardHeight * 0.43438);
            this.addTextureToGroup(group, hpTexture, cardWidth * 0.31, cardWidth * 0.31 * 1.65454, hpPosition, 'hpTextureId', indexCount);
        }

        if (energyTexture) {
            const energyPosition = new Vector2d(position.getX() - cardWidth * 0.5, position.getY() + cardHeight * 0.5);
            this.addTextureToGroup(group, energyTexture, cardWidth * 0.39, cardWidth * 0.39 * 1.344907, energyPosition, 'energyTextureId', indexCount);
        }
    }

    private static addTextureToGroup(group: THREE.Group, texture: THREE.Texture, width: number, height: number, position: Vector2d, textureId: string, indexCount: number) {
        const mesh = MeshGenerator.createMesh(texture, width, height, position);
        mesh.userData.textureId = textureId;
        group.add(mesh);

        this.saveCardInitialPosition(mesh, position, width, height, textureId, indexCount);
    }

    private static saveCardInitialPosition(mesh: THREE.Mesh, position: Vector2d, width: number, height: number, textureId: string, indexCount: number) {
        CardStateManager.addCardToHand(mesh.uuid, {
            cardMesh: mesh,
            initialPosition: position.clone(),
            width,
            height,
            textureId,
            cardIndex: indexCount,
        });
    }

    private static registerResizeHandler(): void {
        if (!this.resizeHandler) {
            this.resizeHandler = () => {
                const { scaleX, scaleY } = UserWindowSize.getInstance().getScaleFactors();
                this.adjustHandCardPositions();
            };
            window.addEventListener("resize", this.resizeHandler);
        }
    }

    // static removeCardFromHand(cardMesh: THREE.Mesh) {
    //     const cardInfo = this.handCardInitialInfoMap.get(cardMesh.uuid);
    //     if (cardInfo) {
    //         this.fieldCardInitialInfoMap.set(cardMesh.uuid, cardInfo);
    //         this.handCardInitialInfoMap.delete(cardMesh.uuid);
    //     }
    // }
    //
    // static getCardInitialInfoMap(): Map<string, any> {
    //     return this.handCardInitialInfoMap;
    // }

    static adjustHandCardPositions(): void {
        const handCardList = CardStateManager.getAllHandCards();
        handCardList.forEach(({ cardMesh, initialPosition, textureId, cardIndex }) => {
            console.log('adjustHandCardPositions() handCardList cardIndex:', cardIndex)

            const cardWidth = 0.06493506493 * window.innerWidth
            const cardHeight = cardWidth * 1.615

            const mainCardPositionX = (0.311904 - 0.5 + cardIndex * 0.094696) * window.innerWidth;
            const mainCardPositionY = (0.5 - 0.972107) * window.innerHeight + (cardHeight * 0.5)

            if (textureId === "mainCardTextureId") {
                // mainCardTextureId인 경우에만 카드 크기 조정
                // const cardWidth = 0.064935 * window.innerWidth;
                // const cardHeight = cardWidth * 1.615;

                // 메인 카드 geometry 재생성
                cardMesh.geometry.dispose(); // 기존 geometry 삭제
                cardMesh.geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
                // cardMesh.position.set(initialPosition.getX() * newScaleX, initialPosition.getY() * newScaleY, 0);
                // cardMesh.position.set(initialPosition.getX(), (0.5 - 0.972107) * window.innerHeight + (0.06493506493 * 1.615 * 0.5 * window.innerWidth), 0);
                cardMesh.position.set(mainCardPositionX, mainCardPositionY, 0);
            } else if (textureId === "weaponTextureId") {
                // 무기 텍스처 크기 및 위치 조정
                const weaponWidth = cardWidth * 0.63;
                const weaponHeight = weaponWidth * 1.651;

                // position.getX() + cardWidth * 0.44, position.getY() - cardHeight * 0.45666
                // const weaponPositionX = initialPosition.getX() + cardWidth * 0.44;
                const weaponPositionX = mainCardPositionX + cardWidth * 0.44;
                // const weaponPositionY = initialPosition.getY() - cardWidth * 0.45666;
                const weaponPositionY = mainCardPositionY - cardHeight * 0.45666;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(weaponWidth, weaponHeight);
                cardMesh.position.set(weaponPositionX, weaponPositionY, 0);

            } else if (textureId === "raceTextureId") {
                // 종족 텍스처 크기 및 위치 조정
                const raceWidth = cardWidth * 0.4;
                const raceHeight = raceWidth;

                // position.getX() + cardWidth * 0.5, position.getY() + cardHeight * 0.5
                const racePositionX = mainCardPositionX + cardWidth * 0.5;
                const racePositionY = mainCardPositionY + cardHeight * 0.5;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(raceWidth, raceHeight);
                cardMesh.position.set(racePositionX, racePositionY, 0);

            } else if (textureId === "hpTextureId") {
                // 체력 텍스처 크기 및 위치 조정
                const hpWidth = cardWidth * 0.31;
                const hpHeight = hpWidth * 1.65454;

                // position.getX() - cardWidth * 0.5, position.getY() - cardHeight * 0.43438
                const hpPositionX = mainCardPositionX - cardWidth * 0.5;
                const hpPositionY = mainCardPositionY - cardHeight * 0.43438;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(hpWidth, hpHeight);
                cardMesh.position.set(hpPositionX, hpPositionY, 0);

            } else if (textureId === "energyTextureId") {
                // 에너지 텍스처 크기 및 위치 조정
                const energyWidth = cardWidth * 0.39;
                const energyHeight = energyWidth * 1.344907;

                // position.getX() - cardWidth * 0.5, position.getY() + cardHeight * 0.5
                const energyPositionX = mainCardPositionX - cardWidth * 0.5;
                const energyPositionY = mainCardPositionY + cardHeight * 0.5;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(energyWidth, energyHeight);
                cardMesh.position.set(energyPositionX, energyPositionY, 0);
            }
        });
    }

    // TODO: 이거 개선해야함
    static adjustFieldCardPositions(): void {
        const repository = BattleFieldUnitRepository.getInstance();
        const currentUnitCount = repository.getBattleFieldUnitList().length

        const dragAndDropManager = LegacyDragAndDropManager.getExistingInstance()
        const targetShape = dragAndDropManager?.getTargetShape();
        if (!targetShape) {
            console.log("No targetShape found.");
            return;
        }

        const targetData = targetShape.userData;

        const fieldCardList = CardStateManager.getAllFieldCards();
        fieldCardList.forEach(({ cardMesh, initialPosition, textureId, cardIndex }) => {

            const cardWidth = 0.06493506493 * window.innerWidth
            const cardHeight = cardWidth * 1.615

            console.log('adjustFieldCardPositions() fieldCardList cardIndex:', cardIndex)
            // targetData.width = window.innerWidth * 0.7
            // -targetData.width / 2 + 0.044056 * window.innerWidth + 200 * currentUnitCount
            const mainCardPositionX = -(window.innerWidth * 0.7) / 2 + 0.044056 * window.innerWidth + 0.094696 * window.innerWidth * cardIndex;
            const mainCardPositionY = -(window.innerHeight / 2) + (0.024 * 3 + 0.11 * 2.5) * window.innerHeight;

            if (textureId === "mainCardTextureId") {
                cardMesh.geometry.dispose(); // 기존 geometry 삭제
                cardMesh.geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
                // cardMesh.position.set(initialPosition.getX() * newScaleX, initialPosition.getY() * newScaleY, 0);
                // cardMesh.position.set(initialPosition.getX(), (0.5 - 0.972107) * window.innerHeight + (0.06493506493 * 1.615 * 0.5 * window.innerWidth), 0);
                cardMesh.position.set(mainCardPositionX, mainCardPositionY, 0);
            } else if (textureId === "weaponTextureId") {
                const weaponWidth = cardWidth * 0.63;
                const weaponHeight = weaponWidth * 1.651;

                // position.getX() + cardWidth * 0.44, position.getY() - cardHeight * 0.45666
                // const weaponPositionX = initialPosition.getX() + cardWidth * 0.44;
                const weaponPositionX = mainCardPositionX + cardWidth * 0.44;
                // const weaponPositionY = initialPosition.getY() - cardWidth * 0.45666;
                const weaponPositionY = mainCardPositionY - cardHeight * 0.45666;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(weaponWidth, weaponHeight);
                cardMesh.position.set(weaponPositionX, weaponPositionY, 0);

            } else if (textureId === "raceTextureId") {
                const raceWidth = cardWidth * 0.4;
                const raceHeight = raceWidth;

                // position.getX() + cardWidth * 0.5, position.getY() + cardHeight * 0.5
                const racePositionX = mainCardPositionX + cardWidth * 0.5;
                const racePositionY = mainCardPositionY + cardHeight * 0.5;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(raceWidth, raceHeight);
                cardMesh.position.set(racePositionX, racePositionY, 0);

            } else if (textureId === "hpTextureId") {
                const hpWidth = cardWidth * 0.31;
                const hpHeight = hpWidth * 1.65454;

                // position.getX() - cardWidth * 0.5, position.getY() - cardHeight * 0.43438
                const hpPositionX = mainCardPositionX - cardWidth * 0.5;
                const hpPositionY = mainCardPositionY - cardHeight * 0.43438;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(hpWidth, hpHeight);
                cardMesh.position.set(hpPositionX, hpPositionY, 0);

            } else if (textureId === "energyTextureId") {
                const energyWidth = cardWidth * 0.39;
                const energyHeight = energyWidth * 1.344907;

                // position.getX() - cardWidth * 0.5, position.getY() + cardHeight * 0.5
                const energyPositionX = mainCardPositionX - cardWidth * 0.5;
                const energyPositionY = mainCardPositionY + cardHeight * 0.5;

                cardMesh.geometry.dispose();
                cardMesh.geometry = new THREE.PlaneGeometry(energyWidth, energyHeight);
                cardMesh.position.set(energyPositionX, energyPositionY, 0);
            }
        });
    }
}
