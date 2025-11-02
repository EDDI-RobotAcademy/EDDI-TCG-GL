import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";

export interface GradeOptionConfig {
    type: CardGrade;
    position: Vector2d;
}

export class CardFilterGradeOptionInactiveConfigList {
    public gradeOptionConfigs: GradeOptionConfig[] = [
        {
            type: CardGrade.COMMON,
            position: new Vector2d(0.0179, 0.052)
        },
        {
            type: CardGrade.UNCOMMON,
            position: new Vector2d(0.0179, 0.023)
        },
        {
            type: CardGrade.HERO,
            position: new Vector2d(0.0179, -0.006)
        },
        {
            type: CardGrade.LEGEND,
            position: new Vector2d(0.0179, -0.035)
        },
        {
            type: CardGrade.MYTHICAL,
            position: new Vector2d(0.0179, -0.064)
        },

    ];
}
