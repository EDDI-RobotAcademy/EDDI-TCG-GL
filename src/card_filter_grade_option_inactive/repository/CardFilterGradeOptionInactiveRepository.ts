import * as THREE from 'three';
import {CardFilterGradeOptionInactive} from "../entity/CardFilterGradeOptionInactive";
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";

export interface CardFilterGradeOptionInactiveRepository {
    createGradeOption(type: CardGrade, position:Vector2d): Promise<CardFilterGradeOptionInactive>;
    findGradeOptionByType(type: CardGrade): CardFilterGradeOptionInactive | null;
    deleteGradeOptionByType(type: CardGrade): void;
}