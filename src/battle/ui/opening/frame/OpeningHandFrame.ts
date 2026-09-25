import {CARD_ASPECT} from "../../../../card/shape";

// 대전을 시작할 때 받은 카드를 화면 가운데 크게 보여 주는 겹이 어떻게 보이는가.
//
// **THREE 도 DOM 도 모른다.** 값만 든다 (frame-no-three).
//
// 이 겹은 WebGL 이 아니라 화면 위에 얹는 겹(DOM)으로 그린다. 전투 화면이 이미 그렇게 하는
// 것이 넷 있다 — 필드 에너지 표기, 모래시계, 턴 수, 안내 문구.
//
// 왜 DOM 인가:
//   · 받은 카드를 크게 늘어놓는 일은 가로 배치 한 줄이면 된다. 직교 카메라에서는 자리마다
//     좌표를 손으로 내야 한다
//   · 글자(제목, 단추)가 들어간다
//   · 손패로 넘어간 뒤에는 사라지는 겹이라 전투 장면에 남길 것이 없다

export interface OpeningHandFrame {
    // 카드 한 장의 세로/가로. 전투 손패와 같은 값이다.
    readonly cardAspect: number;
    // 크게 늘어놓은 카드가 화면 높이의 얼마를 차지하나.
    readonly heightRatio: number;
    // 다섯 장이 가로로 쓸 수 있는 화면 폭.
    readonly widthRatio: number;
    // 카드 사이 간격. 카드 폭에 대한 비율이다.
    readonly gapRatio: number;

    // 한 장씩 나타나는 시간과 장 사이 간격.
    readonly dealMs: number;
    readonly dealStepMs: number;
    // 겹이 사라지는 시간.
    readonly fadeMs: number;

    readonly title: string;
    readonly confirmLabel: string;

    // 카드 그림 경로를 카드 번호로 만든다.
    cardImage(cardId: number): string;
}

export function createDefaultOpeningHandFrame(): OpeningHandFrame {
    return {
        cardAspect: CARD_ASPECT,
        // 다섯 장이라 열 장짜리 뽑기 판보다 크게 잡을 수 있다.
        heightRatio: 0.62,
        widthRatio: 0.82,
        gapRatio: 0.08,

        dealMs: 420,
        dealStepMs: 110,
        fadeMs: 420,

        title: '받은 카드',
        confirmLabel: '시작',

        // 내 카드 화면의 큰 그림을 쓴다. 크게 보여 주는 자리라 전투용 작은 그림은 뭉갠다.
        cardImage: (cardId) => `resource/my_card/card/${cardId}.png`,
    };
}
