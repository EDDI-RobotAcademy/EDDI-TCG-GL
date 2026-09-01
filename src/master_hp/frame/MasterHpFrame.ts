import { createDefaultHandCardFrame } from "../../battle/hand/frame/HandCardFrame";

// 메인 캐릭터(본체) HP 표기의 배치 스펙.
// 수치는 이미지에 새겨져 있고(resource/battle_field_unit/hp/{hp}.png), 프레임은
// 그 이미지를 놓을 화면 위치와 크기만 값으로 들고 있다.
//
// 위치·크기는 **전부 화면 비율**로만 표현한다. 픽셀 값을 들고 있으면 창 크기가
// 바뀔 때 배치가 따라오지 않는다.
//   x 중심 0.544653   (지정값 0.552653 에서 왼쪽으로 0.008)
//   y 중심 0.808954   (지정값 0.813954 에서 위로 0.005 — 위에서부터 재므로 작을수록 위)
//
// **크기는 지정하지 않는다.** 카드의 HP 핏방울을 기준으로 삼아 배수로만 정한다.
//   폭   = (카드 폭 × hp 슬롯 widthRatio) × sizeMultiplier
//   높이 = 폭 × hp 슬롯 aspect
// 값을 복제하지 않고 HandCardFrame에서 직접 읽으므로 카드 쪽이 바뀌면 본체 표기도
// 같이 따라가고, sizeMultiplier > 1 인 한 본체 표기가 카드보다 작아질 수 없다.
const HAND_CARD_FRAME = createDefaultHandCardFrame();

// 카드 HP 핏방울이 화면 폭에서 차지하는 비율.
export const CARD_HP_WIDTH_RATIO =
    HAND_CARD_FRAME.cardWidthRatio * HAND_CARD_FRAME.slots.hp.widthRatio;
export const MASTER_HP_ASPECT = HAND_CARD_FRAME.slots.hp.aspect;

export interface MasterHpFrame {
    readonly centerXRatio: number;  // screen-space x
    readonly centerYRatio: number;  // screen-space y from top
    readonly sizeMultiplier: number;  // 카드 HP 핏방울 대비 배수 (1보다 커야 한다)
    readonly aspect: number;          // 높이 = 폭 × aspect (월드 단위)
    readonly imageSrcTemplate: string;
    readonly renderOrder: number;
    readonly maxHp: number;
}

// 상대 본체 HP. 지정된 사각형의 중심을 쓴다 (전부 화면 비율).
//   x  0.526527 ~ 0.562701  → 중심 0.544614 에서 왼쪽으로 0.008 이동 → 0.536614
//   y  0.177187 ~ 0.232558  → 중심 0.204873 에서 위로 0.061 이동 → 0.143873
//      (화면 위에서부터 재므로 값이 작을수록 위쪽)
// 크기·비율·에셋은 내 본체와 완전히 공유한다 — 한쪽만 커지는 일이 없어야 한다.
export function createOpponentMasterHpFrame(): MasterHpFrame {
    return {
        ...createDefaultMasterHpFrame(),
        centerXRatio: 0.536614,
        centerYRatio: 0.143873,
    };
}

export function createDefaultMasterHpFrame(): MasterHpFrame {
    return {
        centerXRatio: 0.544653,
        centerYRatio: 0.808954,
        // 본체 표기는 카드의 1.32배. 처음 잡았던 사각형이 1.80배, 한 번 줄여 1.50배였다.
        sizeMultiplier: 1.32,
        aspect: MASTER_HP_ASPECT,
        imageSrcTemplate: 'resource/battle_field_unit/hp/{hp}.png',
        renderOrder: 40,
        maxHp: 100,
    };
}

export interface MasterHpBounds {
    readonly centerX: number;
    readonly centerY: number;
    readonly width: number;
    readonly height: number;
}

// 화면 비율 → 월드 좌표. OrthographicCamera가 [-w/2, +w/2] × [-h/2, +h/2]를 덮고
// +y가 위쪽이므로, 위에서 잰 비율 0이 +h/2, 1.0이 -h/2로 간다.
// 높이는 뷰포트 세로가 아니라 **폭 × aspect**로 정한다 — 카드 슬롯과 같은 방식이라
// 창 비율이 바뀌어도 핏방울이 늘어나거나 눌리지 않는다.
export function computeMasterHpBounds(
    frame: MasterHpFrame,
    viewportWidth: number,
    viewportHeight: number,
): MasterHpBounds {
    const width = CARD_HP_WIDTH_RATIO * frame.sizeMultiplier * viewportWidth;
    return {
        centerX: (frame.centerXRatio - 0.5) * viewportWidth,
        centerY: (0.5 - frame.centerYRatio) * viewportHeight,
        width,
        height: width * frame.aspect,
    };
}

// 텍스처가 존재하는 범위(0~150)로 잘라 파일 경로를 만든다.
export function resolveMasterHpImageSrc(frame: MasterHpFrame, hp: number): string {
    const clamped = Math.max(0, Math.min(150, Math.round(hp)));
    return frame.imageSrcTemplate.replace('{hp}', String(clamped));
}
