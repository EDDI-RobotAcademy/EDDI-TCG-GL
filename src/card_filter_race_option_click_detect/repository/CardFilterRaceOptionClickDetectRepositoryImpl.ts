import * as THREE from "three";

import {CardFilterRaceOptionClickDetectRepository} from "./CardFilterRaceOptionClickDetectRepository";
import {CardFilterRaceOptionInactive} from "../../card_filter_race_option_inactive/entity/CardFilterRaceOptionInactive";
import {CardRace} from "../../card/race";

export class CardFilterRaceOptionClickDetectRepositoryImpl implements CardFilterRaceOptionClickDetectRepository {
    private static instance: CardFilterRaceOptionClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedOption: CardFilterRaceOptionInactive | null = null;
    private allOptionClickEnabled: boolean = false;
    private optionClickEnabledMap: Map<CardRace, boolean> = new Map();
    private optionCLickStateMap: Map<CardRace, boolean> = new Map();

    public static getInstance(): CardFilterRaceOptionClickDetectRepositoryImpl {
        if (!CardFilterRaceOptionClickDetectRepositoryImpl.instance) {
            CardFilterRaceOptionClickDetectRepositoryImpl.instance = new CardFilterRaceOptionClickDetectRepositoryImpl();
        }
        return CardFilterRaceOptionClickDetectRepositoryImpl.instance;
    }

    public isOptionClicked(
        clickPoint: { x: number; y: number },
        optionList: CardFilterRaceOptionInactive[],
        camera: THREE.Camera
    ): CardFilterRaceOptionInactive | null {
        const { x, y } = clickPoint;

        const normalizedMouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(normalizedMouse, camera);

        const meshes = optionList.map(option => option.getMesh());
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object;
            const clickedOption = optionList.find(option => option.getMesh() === intersectedMesh);

            if (clickedOption) {
                console.log('Detect clicked Card Filter Race Option!')

                return clickedOption;
            }
        }
        return null;
    }

    public saveCurrentClickedOption(option: CardFilterRaceOptionInactive): void {
        this.currentClickedOption = option;
    }

    public getCurrentClickedOption(): CardFilterRaceOptionInactive | null {
        return this.currentClickedOption;
    }

    public resetCurrentClickedOption(): void {
        this.currentClickedOption = null;
    }

    public setAllOptionClickEnabled(isEnabled: boolean): void {
        this.allOptionClickEnabled = isEnabled;
    }

    public isAllOptionClickEnabled(): boolean {
        return this.allOptionClickEnabled;
    }

    public setOptionClickEnabled(type: CardRace, isEnabled: boolean): void {
        this.optionClickEnabledMap.set(type, isEnabled);
    }

    public isOptionClickEnabled(type: CardRace): boolean | undefined {
        return this.optionClickEnabledMap.get(type);
    }

    public saveOptionClickState(type: CardRace, state: boolean): void {
        this.optionCLickStateMap.set(type, state);
    }

    public findOptionClickState(type: CardRace): boolean | undefined {
        return this.optionCLickStateMap.get(type);
    }

    public findClickedOptionTypes(): CardRace[] | null {
        const activeOptionTypes: CardRace[] = [];

        for (const [type, state] of this.optionCLickStateMap.entries()) {
            if (state === true) {
                activeOptionTypes.push(type);
            }
        }

        // true인 상태가 하나도 없으면 null 반환
        return activeOptionTypes.length > 0 ? activeOptionTypes : null;
//         return activeOptionTypes;
    }

}