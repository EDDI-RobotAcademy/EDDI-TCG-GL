import {ActivePanelButtonType} from "../entity/ActivePanelButtonType";

// 액티브 패널에서 어느 버튼을 골랐는지만 담는다.
//
// 버튼을 골라도 패널은 안 닫힌다. 고른 값은 상대 유닛을 누를 때까지 살아 있어야 한다.
// 그때 이 값을 보고 공격인지 스킬인지 상세 보기인지를 정한다.
export interface SelectedActivePanelButtonStore {
    get(): ActivePanelButtonType;
    set(type: ActivePanelButtonType): void;
    clear(): void;
}
