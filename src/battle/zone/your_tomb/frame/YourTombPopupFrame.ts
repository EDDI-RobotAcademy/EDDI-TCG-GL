import {
    CardGridPopupFrame,
    createDefaultCardGridPopupFrame,
} from "../../../card_grid_popup/frame/CardGridPopupFrame";

// 내 무덤 팝업의 배치 값. 지금은 카드 격자 팝업의 기본값을 그대로 쓴다.
// 자기 모듈로 남겨 둔 이유는, 이 화면만 배치가 달라져야 할 때
// 다른 화면을 건드리지 않고 여기만 고치기 위해서다.
export type YourTombPopupFrame = CardGridPopupFrame;

export function createDefaultYourTombPopupFrame(): YourTombPopupFrame {
    return createDefaultCardGridPopupFrame();
}
