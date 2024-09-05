import * as THREE from "three";
import { Vector2d } from "../../common/math/Vector2d";
import { TextureManager } from "../../texture_manager/TextureManager";
import { MeshGenerator } from "../../mesh/generator";

export class SupportCardGenerator {
    static async createSupportCard(card: any, position: Vector2d = new Vector2d(0, 0)): Promise<THREE.Group> {
        const textureManager = TextureManager.getInstance();

        // 카드 ID와 관련된 텍스처를 로드
        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        const cardKindsTexture = await textureManager.getTexture('card_kinds', card.종류);
        const cardRaceTexture = await textureManager.getTexture('race', card.종족);

        // 텍스처가 없을 경우 기본 텍스처를 생성하거나 오류를 발생시킵니다.
        if (!cardTexture) {
            throw new Error('Card texture not found');
        }
        if (!cardKindsTexture) {
            console.warn('Card kinds texture not found');
        }
        if (!cardRaceTexture) {
            console.warn('Card race texture not found');
        }

        const cardWidth = 120;
        const cardHeight = cardWidth * 1.615;

        // 메인 카드 메쉬 생성
        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);

        // 그룹을 생성하고 메인 카드 메쉬를 추가
        const group = new THREE.Group();
        group.add(mainCardMesh);

        const kindsWidth = cardWidth * 0.4;
        const kindsHeight = kindsWidth

        // 카드 종류 메쉬가 있는 경우 추가
        if (cardKindsTexture) {
            const kindsPosition = new Vector2d(position.getX() + cardWidth * 0.5, position.getY() - cardHeight * 0.5);
            const kindsMesh = MeshGenerator.createMesh(cardKindsTexture, kindsWidth, kindsHeight, kindsPosition);
            group.add(kindsMesh);
        }

        const raceWidth = cardWidth * 0.4;
        const raceHeight = raceWidth;

        if (cardRaceTexture) {
            const racePosition = new Vector2d(position.getX() + cardWidth * 0.5, position.getY() + cardHeight * 0.5);
            const raceMesh = MeshGenerator.createMesh(cardRaceTexture, raceWidth, raceHeight, racePosition);
            group.add(raceMesh);
        }

        return group;
    }
}
