import * as THREE from 'three'
import {BattleFieldUnitRepository} from "../repository/BattleFieldUnitRepository";
import {ResourceManager} from "../../../resouce_manager/ResourceManager";
import {BattleFieldUnitScene} from "../scene/BattleFieldUnitScene";
import {BattleFieldUnit} from "../entity/BattleFieldUnit";
import {LegacyNonBackgroundImage} from "../../../shape/image/LegacyNonBackgroundImage";

export class BattleFieldUnitRenderer {
    private unitScene: BattleFieldUnitScene
    // TODO: Service로 수정해야함
    private battleFieldUnitRepository: BattleFieldUnitRepository
    private resourceManager: ResourceManager

    constructor(unitScene: BattleFieldUnitScene, resourceManager: ResourceManager) {
        this.unitScene = unitScene
        this.battleFieldUnitRepository = BattleFieldUnitRepository.getInstance()
        this.resourceManager = resourceManager

        this.battleFieldUnitRepository.setUnitAddedCallback((unit: BattleFieldUnit) => {
            this.unitScene.addUnit(unit, this.resourceManager);
        });
    }

    // public renderBattleFieldUnit(): void {
    //     const battleFieldUnitList = this.battleFieldUnitRepository.getBattleFieldUnitList()
    //
    //     battleFieldUnitList.forEach(battleFieldUnit => {
    //         this.unitScene.addUnit(battleFieldUnit, this.resourceManager);
    //     });
    // }

    public render(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera): void {
        // this.renderBattleFieldUnit();
        renderer.render(this.unitScene.getScene(), camera);
    }

    public animate(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera): void {
        requestAnimationFrame(() => this.animate(renderer, camera));
        this.render(renderer, camera);
    }

    public scaleUnitList(scaleX: number, scaleY: number): void {
        const unitList = this.unitScene.getUnitList();
        // console.log('battle field unit renderer -> unitList:', unitList)
        for (const unitId in unitList) {
            // const { card, weapon, hp, energy, race } = unitList[unitId];
            // if (card) card.setScale(scaleX, scaleY);
            // if (weapon) weapon.setScale(scaleX, scaleY);
            // if (hp) hp.setScale(scaleX, scaleY);
            // if (energy) energy.setScale(scaleX, scaleY);
            // if (race) race.setScale(scaleX, scaleY);

            const { card, weapon, hp, energy, race } = unitList[unitId];
            if (card) {
                card.setScale(scaleX, scaleY);

                const cardWidth = card.getWidth()
                const cardHeight = card.getHeight()
                const cardPosition = card.getLocalTranslation();

                if (weapon) {
                    const weaponPosition = new THREE.Vector2(
                        (cardPosition.x + cardWidth / 2 - 8) * scaleX,
                        (cardPosition.y - cardHeight / 2 + 8) * scaleY
                    );
                    weapon.setPosition(weaponPosition.x, weaponPosition.y);
                    weapon.setScale(scaleX, scaleY);
                }

                if (hp) {
                    const hpPosition = new THREE.Vector2(
                        (cardPosition.x - cardWidth / 2) * scaleX,
                        (cardPosition.y - cardHeight / 2 + 13) * scaleY
                    );
                    hp.setPosition(hpPosition.x, hpPosition.y);
                    hp.setScale(scaleX, scaleY);
                }

                if (energy) {
                    const energyPosition = new THREE.Vector2(
                        (cardPosition.x - cardWidth / 2) * scaleX,
                        (cardPosition.y + cardHeight / 2) * scaleY
                    );
                    energy.setPosition(energyPosition.x, energyPosition.y);
                    energy.setScale(scaleX, scaleY);
                }

                if (race) {
                    const racePosition = new THREE.Vector2(
                        (cardPosition.x + cardWidth / 2) * scaleX,
                        (cardPosition.y + cardHeight / 2) * scaleY
                    );
                    race.setPosition(racePosition.x, racePosition.y);
                    race.setScale(scaleX, scaleY);
                }
            }
        }
    }

    private updateComponentScaleAndPosition(
        component: LegacyNonBackgroundImage | null,
        cardPosition: THREE.Vector2,
        cardWidth: number,
        cardHeight: number,
        scaleX: number,
        scaleY: number,
        widthRatio: number,
        heightRatio: number,
        offsetRatioX: number,
        offsetRatioY: number,
        offsetX: number,
        offsetY: number
    ): void {
        if (component) {
            const componentWidth = cardWidth * widthRatio * scaleX;
            const componentHeight = cardHeight * heightRatio * scaleY;
            // const positionOffsetX = (cardWidth * offsetRatioX + offsetX) * scaleX;

            // localTranslationPosition.getX() + cardWidth / 2 - 8,
            // localTranslationPosition.getY() - cardHeight / 2 + 8

            // localTranslationPosition.getX() - cardWidth / 2,
            // localTranslationPosition.getY() - cardHeight / 2 + 13

            // localTranslationPosition.getX() - cardWidth / 2,
            // localTranslationPosition.getY() + cardHeight / 2

            // localTranslationPosition.getX() + cardWidth / 2,
            // localTranslationPosition.getY() + cardHeight / 2

            const positionOffsetX = (cardWidth / 2 + 8) * scaleX
            // const positionOffsetY = (cardHeight * offsetRatioY + offsetY) * scaleY;
            const positionOffsetY = (cardHeight / 2 + 8) * scaleY
            const componentPosition = new THREE.Vector2(cardPosition.x + (cardWidth / 2 - offsetX), cardPosition.y - (cardHeight / 2 + offsetY) * scaleY);

            const componentLocalTranslation = component.getLocalTranslation()
            // const componentPositionX = (cardPosition.x + cardWidth / 2 - 8) * scaleX
            // const componentPositionY = (cardPosition.y - cardHeight / 2 + 8) * scaleY

            const componentPositionX = (cardPosition.x + cardWidth / 2 - offsetX) * scaleX
            const componentPositionY = (cardPosition.y - cardHeight / 2 - offsetY) * scaleY

            component.setPosition(componentPositionX, componentPositionY);
            component.setScale(scaleX, scaleY);
        }
    }
}