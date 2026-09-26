// Per-card frame for hand rendering. All offsets are proportional to the card's own width/height:
//   cardWidth  = cardWidthRatio * window.innerWidth
//   cardHeight = cardWidth * cardAspect
//   slot X      = offsetXRatio * cardWidth   (from the card's local origin = card center)
//   slot Y      = offsetYRatio * cardHeight
//   slot width  = widthRatio * cardWidth
//   slot height = slot width * slot.aspect
//
// These match BattleFieldHandServiceImpl.calculate*Position / create*Mesh exactly.
// Staff aspect/offset differ from weapon, so a staff-cast MAGICIAN looks identical to the legacy path.

import {CARD_ASPECT} from "../../../../card/shape";

// 배지 위에 얹는 숫자가 어디에 얼마만 하게 오는가.
//
// 체력과 공격력은 전에 **값마다 그림 한 장**이었다 (153장씩). 그래서 152 를 넘는 값을
// 못 보여 주고, 전투 중에 값이 바뀌면 그림을 갈아 끼워야 했다 — 갈아 끼우는 길이 아예
// 없어서 유닛 체력은 판이 끝날 때까지 처음 값 그대로 있었다.
//
// 이제 **숫자 없는 바탕 그림 한 장** 위에 숫자를 글자로 얹는다.
//
// 자리와 크기는 **바탕 그림을 재서 나온 값이다.** 그림을 바꾸면 다시 재야 한다.
export interface BadgeTextSpec {
    // 배지 한가운데에서 얼마나 치우쳐 있나. 배지 크기에 대한 비율. 세로는 위가 양수.
    readonly offsetXRatio: number;
    readonly offsetYRatio: number;
    // **글자 먹 자국의 높이.** 배지 높이에 대한 비율이다.
    //
    // 글꼴 상자 높이가 아니다. 글꼴마다 상자 안에서 글자가 차지하는 몫이 달라서, 상자로
    // 적으면 글꼴을 바꿀 때마다 크기가 달라진다.
    readonly sizeRatio: number;
    readonly color: string;
    // 글꼴. **원본 그림이 쓰던 것과 같아야 한다.**
    readonly font: string;
    // 숫자와 숫자 사이를 얼마나 벌리나. 글자 높이에 대한 비율.
    //
    // 원본은 글꼴 기본 간격보다 벌어져 있다. 이것이 0 이면 숫자가 서로 붙어 보인다.
    readonly letterSpacingRatio: number;
}

export interface HandCardSlot {
    readonly widthRatio: number;
    readonly aspect: number;
    readonly offsetXRatio: number;
    readonly offsetYRatio: number;
    readonly renderOrder: number;
}

export interface HandCardFrame {
    readonly cardWidthRatio: number;
    readonly cardAspect: number;
    // 배지 위 숫자.
    readonly badgeText: {
        readonly weapon: BadgeTextSpec;
        readonly staff: BadgeTextSpec;
        readonly hp: BadgeTextSpec;
    };
    readonly slots: {
        readonly weapon: HandCardSlot;
        readonly staff: HandCardSlot;
        readonly kinds: HandCardSlot;
        readonly race: HandCardSlot;
        readonly hp: HandCardSlot;
        readonly energy: HandCardSlot;
    };
}

export function createDefaultHandCardFrame(): HandCardFrame {
    return {
        cardWidthRatio: 0.06493506493,
        cardAspect: CARD_ASPECT,
        // **숫자가 박혀 있던 그림에서 흰 글자만 집어내 잰 값이다.**
        //
        //   hp/40.png          글자 한가운데 가로 49.5% · 세로 67.6%,  글자 높이 배지의 25.6%
        //   sword_power/40.png 글자 한가운데 가로 57.8% · 세로 54.3%,  글자 높이 배지의 10.3%
        //
        // 한가운데(50%)에서 얼마나 치우쳤는지로 적는다. 세로는 위가 양수라 부호가 뒤집힌다.
        //
        // 처음에는 **색 영역의 무게중심**으로 잡았다가 글자가 위로 떴다. 방울은 아래가 넓어
        // 색 무게중심이 아래로 쏠리는데, 글자는 그보다 **더 아래**에 있다. 색이 있는 자리와
        // 글자가 있던 자리는 다르다 — 글자를 재야 한다.
        //
        // 글꼴은 원본 그림을 확대해 보고 골랐다. **굵고 얇은 획의 차이가 큰 세리프**다 —
        // 굵은 Arial 로 그리면 획이 고르게 굵어서 훨씬 두꺼워 보인다.
        //
        // 그림자도 안 넣는다. 원본에 없고, 넣으면 글자가 부어 보인다.
        //
        // **글자를 판이 아니라 배지 기준으로 쟀다.** 빈 그림과 숫자 그림은 배지가 놓인
        // 자리가 서로 다르다 (검은 가로 2.9% · 세로 2.5% 어긋나 있다). 판 기준으로 재면
        // 그 어긋남이 그대로 들어온다.
        //
        //   숫자 그림에서   글자가 배지 한가운데에서 얼마나 떨어져 있나
        //   빈 그림에서     배지가 판 어디에 있나
        //   둘을 합쳐       판 기준 자리를 낸다
        //
        // **크기는 배지를 거치지 않고 판에서 바로 잰다.** 배지를 거치면 빈 그림과 숫자
        // 그림의 배지 크기 차이가 섞여 들어온다.
        //
        // 아직 그림 그대로인 지팡이와 대 보면 셋이 화면에서 거의 같은 크기여야 한다.
        // 카드 폭을 1 로 놓았을 때:
        //
        //   지팡이  0.0892 x 슬롯 1.219 = 0.1087
        //   검      0.1045 x 슬롯 1.040 = 0.1087
        //   체력    0.2117 x 슬롯 0.513 = 0.1086
        //
        // 지팡이 원본 그림의 글자는 0.1040 이었다. 검보다 4% 작았던 것인데, 원을 검에
        // 맞추면서 글자도 같이 맞췄다 — **원이 같은 크기인데 글자만 다르면 더 튄다.**
        badgeText: {
            weapon: {
                offsetXRatio: 0.0713, offsetYRatio: -0.0394, sizeRatio: 0.1045,
                color: '#ffffff', font: 'bold {px}px "Times New Roman", "Nimbus Roman", serif',
                letterSpacingRatio: 0.06,
            },
            staff: {
                offsetXRatio: -0.0936, offsetYRatio: -0.2345, sizeRatio: 0.0892,
                color: '#ffffff', font: 'bold {px}px "Times New Roman", "Nimbus Roman", serif',
                letterSpacingRatio: 0.06,
            },
            hp: {
                offsetXRatio: -0.0200, offsetYRatio: -0.1695, sizeRatio: 0.2117,
                color: '#ffffff', font: 'bold {px}px "Times New Roman", "Nimbus Roman", serif',
                letterSpacingRatio: 0.06,
            },
        },
        slots: {
            // **칸은 그림을 글자로 바꾸기 전 그대로다.** 건드리지 않는다.
            //
            // 한 번 건드렸다가 되돌렸다. 빈 바탕 그림은 그림 안에서 배지가 놓인 자리가
            // 숫자 그림과 달랐는데(검은 가로 2.9% · 세로 2.5%), 그것을 칸으로 보정했더니
            // **일반 공격에서 칼이 날아가는 길이 달라졌다.** 연출은 칸 한가운데를 축으로
            // 돌고 거기서 날아가므로, 칸을 옮기면 길이 옮겨 간다.
            //
            // 그래서 **그림 쪽을 맞췄다.** 빈 그림의 배지가 숫자 그림과 같은 자리 같은
            // 크기에 오도록 그림을 옮겨 담았다 (`*_source.png` 가 받은 원본이다).
            // 다시 만드는 방법은 R2-141 문서에 적어 두었다.
            weapon: { widthRatio: 0.63, aspect: 1.651,    offsetXRatio:  0.44, offsetYRatio: -0.45666, renderOrder: 2 },
            // 지팡이 원이 검 원과 같은 자리 같은 크기로 보이는 것도 **그림에 넣었다.**
            // 칸은 원래 값 그대로다.
            staff:  { widthRatio: 0.63, aspect: 1.9353,   offsetXRatio:  0.54, offsetYRatio: -0.30666, renderOrder: 2 },
            kinds:  { widthRatio: 0.4,  aspect: 1,        offsetXRatio:  0.5,  offsetYRatio: -0.5,     renderOrder: 2 },
            race:   { widthRatio: 0.4,  aspect: 1,        offsetXRatio:  0.5,  offsetYRatio:  0.5,     renderOrder: 2 },
            hp:     { widthRatio: 0.31, aspect: 1.65454,  offsetXRatio: -0.5,  offsetYRatio: -0.43438, renderOrder: 2 },
            energy: { widthRatio: 0.39, aspect: 1.344907, offsetXRatio: -0.5,  offsetYRatio:  0.5,     renderOrder: 2 },
        },
    };
}
