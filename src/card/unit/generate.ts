import * as THREE from "three";
import { Vector2d } from "../../common/math/Vector2d";
import { TextureManager } from "../../texture_manager/TextureManager";
import { MeshGenerator } from "../../mesh/generator";
import {CardRace} from "../race";
import {CardJob} from "../job";

export class UnitCardGenerator {
    static async createUnitCard(card: any, position: Vector2d = new Vector2d(0, 0)): Promise<THREE.Group> {
        const textureManager = TextureManager.getInstance();

        const cardTexture = await textureManager.getTexture('card', card.카드번호);
        const unitJob = parseInt(card.병종, 10)
        let weaponTexture: THREE.Texture | null = null;

        if (unitJob === CardJob.WARRIOR) {
            weaponTexture = await textureManager.getTexture('sword_power', card.공격력) || null;
        }
        const cardRaceTexture = await textureManager.getTexture('race', card.종족);
        const cardHpTexture = await textureManager.getTexture('hp', card.체력)
        const cardEnergyTexture = await textureManager.getTexture('energy', 0)

       if (!cardTexture) {
            throw new Error('Card texture not found');
        }
        if (!weaponTexture) {
            console.warn('Card weapon texture not found');
        }
        if (!cardRaceTexture) {
            console.warn('Card race texture not found');
        }
        if (!cardHpTexture) {
            console.warn('Card hp texture not found');
        }
        if (!cardEnergyTexture) {
            console.warn('Card energy texture not found');
        }

        const cardWidth = 120;
        const cardHeight = cardWidth * 1.615;

        const mainCardMesh = MeshGenerator.createMesh(cardTexture, cardWidth, cardHeight, position);
        const group = new THREE.Group();
        group.add(mainCardMesh);

        const weaponWidth = cardWidth * 0.63;
        const weaponHeight = weaponWidth * 1.651;

        if (weaponTexture) {
            const weaponPosition = new Vector2d(position.getX() + cardWidth * 0.44, position.getY() - cardHeight * 0.45666);
            const weaponMesh = MeshGenerator.createMesh(weaponTexture, weaponWidth, weaponHeight, weaponPosition);
            group.add(weaponMesh);
        }

        const raceWidth = cardWidth * 0.4;
        const raceHeight = raceWidth;

        if (cardRaceTexture) {
            const racePosition = new Vector2d(position.getX() + cardWidth * 0.5, position.getY() + cardHeight * 0.5);
            const raceMesh = MeshGenerator.createMesh(cardRaceTexture, raceWidth, raceHeight, racePosition);
            group.add(raceMesh);
        }

        const hpWidth = cardWidth * 0.31;
        const hpHeight = hpWidth * 1.65454;

        if (cardHpTexture) {
            const hpPosition = new Vector2d(position.getX() - cardWidth * 0.5, position.getY() - cardHeight * 0.43438);
            const hpMesh = MeshGenerator.createMesh(cardHpTexture, hpWidth, hpHeight, hpPosition);
            group.add(hpMesh);
        }

        const energyWidth = cardWidth * 0.39;
        const energyHeight = energyWidth * 1.344907;

        if (cardEnergyTexture) {
            const energyPosition = new Vector2d(position.getX() - cardWidth * 0.5, position.getY() + cardHeight * 0.5);
            const energyMesh = MeshGenerator.createMesh(cardEnergyTexture, energyWidth, energyHeight, energyPosition);
            group.add(energyMesh);
        }

        return group;
    }
}
