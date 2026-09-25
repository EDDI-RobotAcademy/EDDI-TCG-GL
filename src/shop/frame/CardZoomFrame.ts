import {CardGrade} from "../../card/grade";
import {CARD_ASPECT} from "../../card/shape";
import {GradeLook, GachaOverlayFrame} from "./GachaOverlayFrame";

// 카드 한 장을 크게 볼 때 어떻게 보이는가.
//
// **THREE 도 DOM 도 모른다.** 값만 든다.
//
// 내 카드 화면에도 크게 보기가 있는데 (`my_card_screen_detail_card`) 그것을 안 썼다.
// 이유가 둘이다.
//
//   하나. 그쪽은 THREE 로 그린다. 뽑기 결과는 화면 위에 얹는 겹(DOM)이라 층이 다르다.
//         카드 그림이 이미 `<img>` 로 떠 있는데 그것을 다시 메시로 만들 이유가 없다
//   둘.  그쪽은 [내 카드 전부를 미리 만들어 두고 보일지 말지만 바꾼다]. 뽑기는
//         [방금 뽑은 열 장 중 지금 이것 하나]다. 담는 방식부터 다르다
//
// 생김새가 비슷하다고 합치면, 한쪽이 바뀔 때 다른 쪽이 딸려 온다 (규칙 - 같은 이유로
// 바뀌는가로 판단한다).

export interface CardZoomFrame {
    // 크게 띄운 카드가 화면 높이의 얼마를 차지하나.
    readonly heightRatio: number;
    // 좌우 화살표가 들어갈 자리를 빼고 카드가 쓸 수 있는 화면 가로 폭.
    readonly widthRatio: number;
    // 카드 세로/가로. 뽑기 판과 같은 값이라야 크게 떠도 모양이 안 변한다.
    readonly cardAspect: number;
    // 뜨고 지는 데 걸리는 시간.
    readonly fadeMs: number;

    // 카드 그림 경로를 카드 번호로 만든다.
    cardImage(cardId: number): string;
    // 등급이 어떻게 보이는가. 뽑기 판과 같은 것을 쓴다.
    gradeLook(grade: CardGrade | null): GradeLook;
}

// 뽑기 판이 쓰는 값을 그대로 물려받는다. **카드 그림 경로와 등급 색을 두 번 적지 않는다** —
// 두 곳에 있으면 한쪽만 고쳐진다.
export function createCardZoomFrame(overlay: GachaOverlayFrame): CardZoomFrame {
    return {
        // 화면 높이의 92%. 1920x1080 에서 카드가 994x615 가 되고, 카드에 찍힌 설명 글자가
        // 22픽셀쯤 된다 — 뽑기 판에서는 10픽셀이라 안 읽혔다.
        heightRatio: 0.92,
        // 좌우 화살표와 여백을 빼고 남는 폭.
        widthRatio: 0.78,
        cardAspect: CARD_ASPECT,
        fadeMs: 220,

        cardImage: overlay.cardImage,
        gradeLook: overlay.gradeLook,
    };
}
