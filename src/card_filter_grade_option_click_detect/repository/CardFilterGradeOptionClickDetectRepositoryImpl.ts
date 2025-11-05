import * as THREE from "three";

import {CardFilterGradeOptionClickDetectRepository} from "./CardFilterGradeOptionClickDetectRepository";
import {CardFilterGradeOptionInactive} from "../../card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactive";
import {CardGrade} from "../../card/grade";

export class CardFilterGradeOptionClickDetectRepositoryImpl implements CardFilterGradeOptionClickDetectRepository {
    private static instance: CardFilterGradeOptionClickDetectRepositoryImpl;
    private raycaster = new THREE.Raycaster();

    private currentClickedOption: CardFilterGradeOptionInactive | null = null;
    private allOptionClickEnabled: boolean = false;
    private optionClickEnabledMap: Map<CardGrade, boolean> = new Map();
    private optionCLickStateMap: Map<CardGrade, boolean> = new Map();

    public static getInstance(): CardFilterGradeOptionClickDetectRepositoryImpl {
        if (!CardFilterGradeOptionClickDetectRepositoryImpl.instance) {
            CardFilterGradeOptionClickDetectRepositoryImpl.instance = new CardFilterGradeOptionClickDetectRepositoryImpl();
        }
        return CardFilterGradeOptionClickDetectRepositoryImpl.instance;
    }

    public isOptionClicked(
        clickPoint: { x: number; y: number },
        optionList: CardFilterGradeOptionInactive[],
        camera: THREE.Camera
    ): CardFilterGradeOptionInactive | null {
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
                console.log('Detect clicked Card Filter Grade Option!')

                return clickedOption;
            }
        }
        return null;
    }

    public saveCurrentClickedOption(option: CardFilterGradeOptionInactive): void {
        this.currentClickedOption = option;
    }

    public getCurrentClickedOption(): CardFilterGradeOptionInactive | null {
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

    public setOptionClickEnabled(type: CardGrade, isEnabled: boolean): void {
        this.optionClickEnabledMap.set(type, isEnabled);
    }

    public isOptionClickEnabled(type: CardGrade): boolean | undefined {
        return this.optionClickEnabledMap.get(type);
    }

    public saveOptionClickState(type: CardGrade, state: boolean): void {
        this.optionCLickStateMap.set(type, state);
    }

    public findOptionClickState(type: CardGrade): boolean | undefined {
        return this.optionCLickStateMap.get(type);
    }

    public findClickedOptionTypes(): CardGrade[] | null {
        const activeOptionTypes: CardGrade[] = [];

        for (const [type, state] of this.optionCLickStateMap.entries()) {
            if (state === true) {
                activeOptionTypes.push(type);
            }
        }

        // true인 상태가 하나도 없으면 null 반환
        return activeOptionTypes.length > 0 ? activeOptionTypes : null;
    }

}