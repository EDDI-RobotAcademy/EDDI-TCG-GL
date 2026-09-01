import * as THREE from 'three';
import {BattleFieldUnit} from "../entity/BattleFieldUnit";
import {ResourceManager} from "../../../resouce_manager/ResourceManager";
import {LegacyNonBackgroundImage} from "../../../shape/image/LegacyNonBackgroundImage";
import {BattleFieldUnitEntry} from "./BattleFieldUnitEntry";

export class BattleFieldUnitScene {
    private scene: THREE.Scene
    private unitList: { [id: number]: BattleFieldUnitEntry } = {};
    private nextUnitId: number = 1

    constructor() {
        this.scene = new THREE.Scene()
    }

    public addUnit(battleFieldUnit: BattleFieldUnit, resourceManager: ResourceManager): void {
        if (this.unitList[this.nextUnitId]) {
            return;
        }

        const unitId = this.nextUnitId;

        const cardPath = resourceManager.getCardPath(battleFieldUnit.getCardId());
        const weaponPath = resourceManager.getWeaponPath(battleFieldUnit.getWeaponId());
        const hpPath = resourceManager.getHpPath(battleFieldUnit.getHpId());
        const energyPath = resourceManager.getEnergyPath(battleFieldUnit.getEnergyId());
        const racePath = resourceManager.getRacePath(battleFieldUnit.getRaceId());

        const cardWidth = 120;
        const cardHeight = cardWidth * 1.615;
        const localTranslationPosition = battleFieldUnit.getLocalTranslationPosition();

        this.unitList[unitId] = {
            unit: battleFieldUnit,
            card: null,
            weapon: null,
            hp: null,
            energy: null,
            race: null
        };

        const card = new LegacyNonBackgroundImage(cardWidth, cardHeight, cardPath, 1, 1,
                                            new THREE.Vector2(
                                                0, 0
                                            ), undefined, undefined, undefined, undefined, undefined, () => {
            card.draw(this.scene)
            this.unitList[unitId].card = card
        }, 1);

        const weaponWidth = cardWidth * 0.63;
        const weaponHeight = weaponWidth * 1.651;
        const weapon = new LegacyNonBackgroundImage(weaponWidth, weaponHeight, weaponPath, 1, 1,
                                            new THREE.Vector2(
                                                localTranslationPosition.getX() + cardWidth / 2 - 8,
                                                localTranslationPosition.getY() - cardHeight / 2 + 8
                                            ), undefined, undefined, undefined, undefined, undefined, () => {
            weapon.draw(this.scene)
            this.unitList[unitId].weapon = weapon;
        }, 2);

        const hpWidth = cardWidth * 0.33;
        const hpHeight = hpWidth * 1.651;
        const hp = new LegacyNonBackgroundImage(hpWidth, hpHeight, hpPath, 1, 1,
                                            new THREE.Vector2(
                                                localTranslationPosition.getX() - cardWidth / 2, localTranslationPosition.getY() - cardHeight / 2 + 13
                                            ), undefined, undefined, undefined, undefined, undefined, () => {
            hp.draw(this.scene)
            this.unitList[unitId].hp = hp;
        }, 2);

        const energyWidth = cardWidth * 0.39;
        const energyHeight = energyWidth * 1.618;
        const energy = new LegacyNonBackgroundImage(energyWidth, energyHeight, energyPath, 1, 1,
                                            new THREE.Vector2(
                                                localTranslationPosition.getX() - cardWidth / 2,
                                                localTranslationPosition.getY() + cardHeight / 2
                                            ), undefined, undefined, undefined, undefined, undefined, () => {
            energy.draw(this.scene)
            this.unitList[unitId].energy = energy;
        }, 2);

        const raceWidth = cardWidth * 0.4;
        const raceHeight = raceWidth;
        const race = new LegacyNonBackgroundImage(raceWidth, raceHeight, racePath, 1, 1,
                                            new THREE.Vector2(
                                                localTranslationPosition.getX() + cardWidth / 2,
                                                localTranslationPosition.getY() + cardHeight / 2
                                            ), undefined, undefined, undefined, undefined, undefined, () => {
            race.draw(this.scene)
            this.unitList[unitId].race = race;
        }, 2);

        this.nextUnitId++
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getUnitList(): { [id: number]: BattleFieldUnitEntry } {
        return this.unitList;
    }

    public scaleUnitList(scaleX: number, scaleY: number): void {
        for (const unitId in this.unitList) {
            const unitEntry = this.unitList[unitId];
            unitEntry.card?.setScale(scaleX, scaleY);
            unitEntry.weapon?.setScale(scaleX, scaleY);
            unitEntry.hp?.setScale(scaleX, scaleY);
            unitEntry.energy?.setScale(scaleX, scaleY);
            unitEntry.race?.setScale(scaleX, scaleY);
        }
    }
}