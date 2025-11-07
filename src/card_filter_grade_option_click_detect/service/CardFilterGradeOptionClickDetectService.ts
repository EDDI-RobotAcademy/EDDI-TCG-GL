import {CardGrade} from "../../card/grade";

export interface CardFilterGradeOptionClickDetectService {
    handleOptionClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getClickedGradeOptionTypes(): CardGrade[] | null;
}