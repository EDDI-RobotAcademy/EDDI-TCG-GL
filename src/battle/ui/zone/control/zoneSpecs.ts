import {ZoneSpec, ZonePanelRenderer} from "./ZonePanels";
import {BattleReadModel} from "../../../domain/read/BattleReadModel";

import {
    createDefaultYourLostZonePanelFrame, computeYourLostZonePanelBounds,
} from "../your_lost_zone/frame/YourLostZonePanelFrame";
import {createDefaultYourLostZonePopupFrame} from "../your_lost_zone/frame/YourLostZonePopupFrame";
import {YourLostZonePanelRendererV2} from "../your_lost_zone/renderer/YourLostZonePanelRendererV2";

import {
    createDefaultOpponentLostZonePanelFrame, computeOpponentLostZonePanelBounds,
} from "../opponent_lost_zone/frame/OpponentLostZonePanelFrame";
import {createDefaultOpponentLostZonePopupFrame} from "../opponent_lost_zone/frame/OpponentLostZonePopupFrame";
import {OpponentLostZonePanelRendererV2} from "../opponent_lost_zone/renderer/OpponentLostZonePanelRendererV2";

import {
    createDefaultYourTombPanelFrame, isPointInsideYourTomb,
} from "../your_tomb/frame/YourTombPanelFrame";
import {createDefaultYourTombPopupFrame} from "../your_tomb/frame/YourTombPopupFrame";
import {YourTombPanelRendererV2} from "../your_tomb/renderer/YourTombPanelRendererV2";

import {
    createDefaultOpponentTombPanelFrame, isPointInsideOpponentTomb,
} from "../opponent_tomb/frame/OpponentTombPanelFrame";
import {createDefaultOpponentTombPopupFrame} from "../opponent_tomb/frame/OpponentTombPopupFrame";
import {OpponentTombPanelRendererV2} from "../opponent_tomb/renderer/OpponentTombPanelRendererV2";

// 구역 넷이 무엇인지 적어 둔 곳이다.
//
// 판 렌더러도 목록도 넷 그대로다. 여기는 [이 구역은 이 판을 쓰고 이 목록을 보여 준다] 를
// 한 자리에 모아 둔 것뿐이다. 카드가 늘어 어느 한쪽이 갈라지면 그 줄만 고친다.

// 네모난 판. 로스트 존 둘이 쓴다.
function rectanglePanel<F>(
    frame: F,
    renderer: {
        build(frame: F): Promise<import('three').Group>;
        resize(frame: F, group: import('three').Group, w: number, h: number): void;
    },
    bounds: (frame: F, w: number, h: number) => {
        minX: number; maxX: number; minY: number; maxY: number;
    },
): ZonePanelRenderer {
    return {
        build: () => renderer.build(frame),
        resize: (group, w, h) => renderer.resize(frame, group, w, h),
        contains: (x, y, w, h) => {
            const b = bounds(frame, w, h);
            return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY;
        },
    };
}

// 비석 모양 판. 무덤 둘이 쓴다. 네모로 재면 모서리 바깥이 눌린다.
function tombstonePanel<F>(
    frame: F,
    renderer: {
        build(frame: F): Promise<import('three').Group>;
        resize(frame: F, group: import('three').Group, w: number, h: number): void;
    },
    inside: (x: number, y: number, frame: F, w: number, h: number) => boolean,
): ZonePanelRenderer {
    return {
        build: () => renderer.build(frame),
        resize: (group, w, h) => renderer.resize(frame, group, w, h),
        contains: (x, y, w, h) => inside(x, y, frame, w, h),
    };
}

export function createZoneSpecs(view: BattleReadModel): ZoneSpec[] {
    const yourLostZoneFrame = createDefaultYourLostZonePanelFrame();
    const opponentLostZoneFrame = createDefaultOpponentLostZonePanelFrame();
    const yourTombFrame = createDefaultYourTombPanelFrame();
    const opponentTombFrame = createDefaultOpponentTombPanelFrame();

    return [
        {
            name: 'your-lost-zone',
            guideMessage: '당신의 로스트 존입니다.',
            panel: rectanglePanel(
                yourLostZoneFrame, new YourLostZonePanelRendererV2(),
                computeYourLostZonePanelBounds,
            ),
            cards: () => view.yourLostZoneCards(),
            popupFrame: createDefaultYourLostZonePopupFrame(),
            label: 'lost-zone',
        },
        {
            name: 'opponent-lost-zone',
            guideMessage: '상대방의 로스트 존입니다.',
            panel: rectanglePanel(
                opponentLostZoneFrame, new OpponentLostZonePanelRendererV2(),
                computeOpponentLostZonePanelBounds,
            ),
            cards: () => view.opponentLostZoneCards(),
            popupFrame: createDefaultOpponentLostZonePopupFrame(),
            label: 'opponent-lost-zone',
        },
        {
            name: 'your-tomb',
            guideMessage: '당신의 무덤입니다.',
            panel: tombstonePanel(
                yourTombFrame, new YourTombPanelRendererV2(), isPointInsideYourTomb,
            ),
            cards: () => view.yourTombCards(),
            popupFrame: createDefaultYourTombPopupFrame(),
            label: 'tomb',
        },
        {
            name: 'opponent-tomb',
            guideMessage: '상대방의 무덤입니다.',
            panel: tombstonePanel(
                opponentTombFrame, new OpponentTombPanelRendererV2(), isPointInsideOpponentTomb,
            ),
            cards: () => view.opponentTombCards(),
            popupFrame: createDefaultOpponentTombPopupFrame(),
            label: 'opponent-tomb',
        },
    ];
}
