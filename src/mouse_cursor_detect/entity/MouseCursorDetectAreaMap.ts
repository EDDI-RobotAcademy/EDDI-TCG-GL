import { MouseCursorDetectArea } from "./MouseCursorDetectArea";

export class MouseCursorDetectAreaMap {
    private areaBounds: Partial<Record<MouseCursorDetectArea, { x1: number; y1: number; x2: number; y2: number }>>;

    constructor() {
        this.areaBounds = {
            // Mouse clicked at: (576, 906), (1275, 713) <=> 1848, 929
            [MouseCursorDetectArea.YOUR_HAND]: { x1: 0.311688, y1: 0.767491, x2: 0.689935, y2: 0.975242 },
            // (280, 504), (1568, 712) <=> 1848, 929
            [MouseCursorDetectArea.YOUR_FIELD]: { x1: 0.151515, y1: 0.542518, x2: 0.848484, y2: 0.766415 },

            [MouseCursorDetectArea.YOUR_TOMB]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.YOUR_LOSTZONE]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.YOUR_CONSTRUCTION]: { x1: 10, y1: 10, x2: 10, y2: 10 },

            [MouseCursorDetectArea.OPPONENT_HAND]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            // (281, 218), (1572, 431) <=> 1848, 929
            // (280, 430), (1573, 218) <=> 1848, 929
            [MouseCursorDetectArea.OPPONENT_FIELD]: { x1: 0.151515, y1: 0.234661, x2: 0.848484, y2: 0.462863 },
            [MouseCursorDetectArea.OPPONENT_TOMB]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.OPPONENT_LOSTZONE]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.OPPONENT_CONSTRUCTION]: { x1: 10, y1: 10, x2: 10, y2: 10 },

            [MouseCursorDetectArea.FIELD_ENERGY]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.ENVIRONMENT]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.SETTINGS]: { x1: 10, y1: 10, x2: 10, y2: 10 },
            [MouseCursorDetectArea.TURN_END]: { x1: 10, y1: 10, x2: 10, y2: 10 },

            [MouseCursorDetectArea.OPPONENT_MASETER]: { x1: 0.4605885, y1: 0.0476804, x2: 0.5410156, y2: 0.1920103 },
            [MouseCursorDetectArea.YOUR_HAND_PREV_BUTTON]: { x1: 0.265625, y1: 0.880154639, x2: 0.30859375, y2: 0.954896907 },
        };
    }

    public getAbsoluteBounds(area: MouseCursorDetectArea): { x1: number; y1: number; x2: number; y2: number } | null {
        const bounds = this.areaBounds[area];

        if (!bounds) return null;

        return {
            x1: bounds.x1 * window.innerWidth,
            y1: bounds.y1 * window.innerHeight,
            x2: bounds.x2 * window.innerWidth,
            y2: bounds.y2 * window.innerHeight,
        };
    }
}
