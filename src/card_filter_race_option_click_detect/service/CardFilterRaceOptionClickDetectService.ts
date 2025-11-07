import {CardRace} from "../../card/race";
import {CardGrade} from "../../card/grade";

export interface CardFilterRaceOptionClickDetectService {
    handleOptionClick(clickPoint: { x: number; y: number }): any | null;
    onMouseDown(event: MouseEvent): Promise<any | null>;
    getClickedRaceOptionTypes(): CardRace[] | null;
    getClickedGradeOptionTypes(): CardGrade[] | null;
    getFilteredOwnedCardIdList(
        raceType: CardRace[] | null,
        gradeType: CardGrade[] | null
    ): number[] | null;
}