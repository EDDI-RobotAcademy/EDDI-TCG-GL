import * as THREE from "three";
import {CardFilterGradeOptionInactive} from "../../card_filter_grade_option_inactive/entity/CardFilterGradeOptionInactive";

export interface CardFilterGradeOptionClickDetectRepository {
    isOptionClicked(clickPoint: { x: number; y: number },
        optionList: CardFilterGradeOptionInactive[],
        camera: THREE.Camera): any | null;
}