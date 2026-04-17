import { BattleFieldConstants } from "../../common/BattleFieldConstants";

export interface ActivePanelButtonSpec {
    readonly type: string;
    readonly imageSrc: string;
}

export interface ActivePanelFrame {
    readonly buttonWidthRatio: number;
    readonly buttonHeightRatio: number;
    readonly buttonGapRatio: number;
    readonly renderOrder: number;
    readonly generalButton: ActivePanelButtonSpec;
    readonly detailsButton: ActivePanelButtonSpec;
}

export function createDefaultActivePanelFrame(): ActivePanelFrame {
    return {
        buttonWidthRatio: BattleFieldConstants.ACTIVE_PANEL_BUTTON_WIDTH_RATIO,
        buttonHeightRatio: BattleFieldConstants.ACTIVE_PANEL_BUTTON_HEIGHT_RATIO,
        buttonGapRatio: 0.005,
        renderOrder: 4,
        generalButton: {
            type: 'general',
            imageSrc: 'resource/active_panel/general/general_attack_button.png',
        },
        detailsButton: {
            type: 'details',
            imageSrc: 'resource/active_panel/details/view_details_button.png',
        },
    };
}

export function resolveSkillButtonImageSrc(cardId: number, skillIndex: number): string {
    return `resource/active_panel/skill/${cardId}/${skillIndex}`;
}
