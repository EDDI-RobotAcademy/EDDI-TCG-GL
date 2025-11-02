import * as THREE from 'three';
import {CardFilterGradeOptionActive} from "../entity/CardFilterGradeOptionActive";
import {Vector2d} from "../../common/math/Vector2d";
import {CardGrade} from "../../card/grade";

export interface CardFilterGradeOptionActiveRepository {
    createGradeOption(type: CardGrade, position:Vector2d): Promise<CardFilterGradeOptionActive>;
    findGradeOptionByType(type: CardGrade): CardFilterGradeOptionActive | null;
    deleteGradeOptionByType(type: CardGrade): void;
}