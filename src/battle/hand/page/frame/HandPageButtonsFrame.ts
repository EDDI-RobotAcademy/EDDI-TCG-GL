// Prev/next button layout for the hand-pagination row. Values come from
// BattleFieldHandPageStoreImpl (legacy): buttons are defined by a start/end CSS-style
// percent corner pair (origin = top-left of viewport), which the Renderer converts to world
// coords with (p - 0.5) for X and (0.5 - p) for Y. Width/height are the absolute difference
// between the two corners.

export interface HandPageButtonSpec {
    readonly imageSrc: string;
    readonly startXPercent: number;
    readonly startYPercent: number;
    readonly endXPercent: number;
    readonly endYPercent: number;
}

export interface HandPageButtonsFrame {
    readonly prev: HandPageButtonSpec;
    readonly next: HandPageButtonSpec;
    readonly renderOrder: number;
}

export function createDefaultHandPageButtonsFrame(): HandPageButtonsFrame {
    return {
        prev: {
            imageSrc: 'resource/battle_field/your_hand/prev_gold_button.png',
            startXPercent: 0.26992708,
            startYPercent: 0.948453608,
            endXPercent: 0.30561979,
            endYPercent: 0.896907216,
        },
        next: {
            imageSrc: 'resource/battle_field/your_hand/next_gold_button.png',
            startXPercent: 0.69438021,
            startYPercent: 0.948453608,
            endXPercent: 0.73007292,
            endYPercent: 0.896907216,
        },
        renderOrder: 1,
    };
}
