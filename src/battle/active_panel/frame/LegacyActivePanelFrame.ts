import {BattleFieldConstants} from "../../../common/BattleFieldConstants";

// 본편이 쓰는 액티브 패널의 자리다.
//
// 확인용 화면이 쓰는 ActivePanelFrame 과 다른 모양이다. 그쪽은 어두운 판에 버튼을
// 일정한 사이로 놓고, 이쪽은 흰 판에 위아래 끝을 맞춰 사이를 나눈다.
// 둘이 같아 보여서 합치면 본편의 모습이 달라진다.
export interface LegacyActivePanelFrame {
    readonly panelWidthRatio: number;
    readonly panelHeightRatio: number;
    readonly buttonWidthRatio: number;
    readonly buttonHeightRatio: number;
    readonly panelColor: number;
    readonly panelOpacity: number;
    readonly panelRenderOrder: number;
    readonly buttonRenderOrder: number;
}

export function createLegacyActivePanelFrame(): LegacyActivePanelFrame {
    return {
        panelWidthRatio: BattleFieldConstants.ACTIVE_PANEL_WIDTH_RATIO,
        panelHeightRatio: BattleFieldConstants.ACTIVE_PANEL_HEIGHT_RATIO,
        buttonWidthRatio: BattleFieldConstants.ACTIVE_PANEL_BUTTON_WIDTH_RATIO,
        buttonHeightRatio: BattleFieldConstants.ACTIVE_PANEL_BUTTON_HEIGHT_RATIO,
        panelColor: 0xffffff,
        panelOpacity: 0.6,
        panelRenderOrder: 2,
        buttonRenderOrder: 4,
    };
}

// 패널과 버튼의 크기다. 스킬 개수에 따라 패널이 길어진다.
export interface LegacyActivePanelSize {
    readonly panelWidth: number;
    readonly panelHeight: number;
    readonly heightMargin: number;
    readonly buttonWidth: number;
    readonly buttonHeight: number;
}

export function computeLegacyActivePanelSize(
    frame: LegacyActivePanelFrame,
    skillCount: number,
    viewportWidth: number,
): LegacyActivePanelSize {
    return {
        panelWidth: frame.panelWidthRatio * viewportWidth,
        // 일반 공격과 상세 보기 둘에 스킬 개수를 더한 만큼 길어진다.
        panelHeight: frame.panelHeightRatio * viewportWidth * (skillCount + 2),
        heightMargin: (frame.panelHeightRatio - frame.buttonHeightRatio) * viewportWidth,
        buttonWidth: frame.buttonWidthRatio * viewportWidth,
        buttonHeight: frame.buttonHeightRatio * viewportWidth,
    };
}

// 버튼 하나가 패널 가운데에서 얼마나 위에 있는가.
//
// 일반 공격이 맨 위, 상세 보기가 맨 아래에 서고 그 사이를 스킬 개수만큼 나눈다.
export function computeLegacyActivePanelButtonOffsetY(
    type: 'general' | 'details' | 'firstSkill' | 'secondSkill',
    size: LegacyActivePanelSize,
    skillCount: number,
): number {
    const {panelHeight, heightMargin, buttonHeight} = size;
    const generalY = panelHeight * 0.5 - buttonHeight * 0.5 - heightMargin * 0.5;
    const detailsY = panelHeight * 0.5
        - buttonHeight * (1.5 + skillCount)
        - heightMargin * (skillCount + 1.75);
    const step = skillCount > 0 ? (generalY - detailsY) / (skillCount + 1) : 0;

    switch (type) {
        case 'general':
            return generalY;
        case 'details':
            return detailsY;
        case 'firstSkill':
            return skillCount >= 1 ? generalY - step : 0;
        case 'secondSkill':
            return skillCount >= 2 ? generalY - step * 2 : 0;
    }
}
