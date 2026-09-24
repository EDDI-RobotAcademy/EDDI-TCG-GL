import {CardGrade} from "../../card/grade";
import {CARD_ASPECT, CARD_BACK_IMAGE} from "../../card/shape";

// 카드 뽑기 연출이 화면에서 어떻게 보이는가.
//
// **THREE 도 DOM 도 모른다.** 값만 든다 (frame-no-three).
//
// 이 연출은 WebGL 이 아니라 **화면 위에 얹는 겹(DOM)** 으로 그린다. 이 저장소가 이미
// 그렇게 하는 것이 넷 있다 — 필드 에너지 표기, 모래시계, 턴 수, 안내 문구.
//
// 왜 DOM 인가:
//   · 카드 뒤집기를 CSS 가 진짜 3D 로 돌려 준다. 직교 카메라에서는 가로를 줄여 흉내 내야 한다
//   · 등급 이름·카드 이름·비용이 글자다. 그림판에 글자를 그리는 것보다 낫다
//   · 등급별 테두리와 발광이 CSS 한 줄이다
//   · 영상이 DOM 것이다

// 등급 하나가 어떻게 보이는가.
export interface GradeLook {
    readonly label: string;
    // 테두리 색.
    readonly border: string;
    // 테두리 밖으로 번지는 빛. 없으면 빈 문자열.
    readonly glow: string;
    // 이 등급을 가리키는 색. 카드 둘레 빛과 오른쪽 위 등급표가 같은 색을 쓴다.
    readonly tagColor: string;
    // 이 등급이 나오면 뒤집기를 얼마나 늦추나. 좋은 카드를 마지막에 보여 준다.
    readonly flipDelayMs: number;

    // 뒤집힌 뒤 카드에서 나오는 빛. 덮여 있을 때(glow)보다 세다 — 드러나는 순간이 정점이다.
    //
    // **세 겹이다.** 카드 가장자리에 붙는 진한 빛, 그 밖으로 퍼지는 중간 빛, 멀리까지
    // 옅게 번지는 빛. 한 겹으로 세게 하면 색 덩어리가 되고, 세 겹으로 나누면 세면서도
    // 가장자리가 또렷하다. 양피지가 밝아서 옅은 빛은 묻힌다.
    readonly revealGlow: string;
    // 드러난 뒤 카드 **뒤쪽**에 깔리는 은은한 빛. 없으면 빈 문자열.
    //
    // 좋은 등급에만 준다. 열 장이 다 뒤에서 빛나면 판이 뿌예진다.
    readonly revealHalo: string;
    // 뒤집히기 전에 뒷면이 맥동하나. **좋은 등급만 한다.**
    // 어느 자리에 좋은 것이 있는지 미리 알려 주는 것이 뽑기의 재미다.
    readonly anticipate: boolean;
    // 뒤집힌 뒤 카드를 세로로 훑는 빛줄기. 가장 좋은 둘에만 준다.
    readonly beam: boolean;
}

// 양피지 그림 안의 한 자리. **그림 크기에 대한 비율이다** (0~1).
//
// 픽셀로 적으면 안 된다. 양피지가 창 크기에 따라 커졌다 작아졌다 하므로, 그림에 그려진
// 딱지를 누르는 자리도 같이 따라가야 한다.
export interface AreaRatio {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}

export interface GachaOverlayFrame {
    // 영상. 없으면 영상 없이 곧바로 결과로 간다.
    readonly videoSrc: string | null;
    // 영상에서 빛이 터지는 순간. 이때 화면이 결과로 바뀐다.
    readonly flashAtSeconds: number;

    // ── 결과 양피지 ────────────────────────────────────────────────────────
    //
    // 상점이 **원래 뽑기 결과를 보여주던 그림**이다. 제목(New Cards)과 오른쪽 딱지
    // (Again / Lobby)가 그림에 이미 그려져 있다. 그래서 그 글자와 단추를 다시 그리지
    // 않는다 — 그리면 두 번 나온다.
    readonly resultBackground: string;
    // 그림의 가로/세로. 이 비율대로 놓아야 그림에 그려진 딱지 자리가 안 어긋난다.
    readonly resultAspect: number;
    // 화면에 딱 맞는 크기보다 얼마나 크게 그리나. 1 이면 딱 맞고, 넘는 만큼 둘레가 잘린다.
    //
    // **1.05 가 한계다.** 오른쪽 딱지가 그림 폭의 97.6% 자리에 있어서, 이보다 키우면
    // 딱지가 화면 밖으로 나가 누를 수 없게 된다. 잘려 나가는 것은 둘레의 갈색 여백뿐이다.
    readonly resultOverscan: number;
    // 그림 안에서 카드가 놓이는 자리. 제목 아래, 오른쪽 딱지 왼쪽이다.
    readonly cardArea: AreaRatio;
    // 그림에 그려진 딱지를 누르는 자리.
    readonly againTab: AreaRatio;
    readonly lobbyTab: AreaRatio;
    // 그림에 없는 단추 하나. 딱지 둘 아래에 같은 결로 그려 넣는다.
    readonly flipAllTab: AreaRatio;
    // 등급표 자리. **종이 안**, 제목 오른쪽, 카드 위의 빈 자리다.
    //
    // 화면 모서리에 두면 종이 밖 갈색 바탕에 뜨고 Again / Lobby 딱지와 겹친다.
    readonly legendArea: AreaRatio;

    // 카드 판.
    readonly columns: number;
    readonly rows: number;
    // 카드 한 칸의 세로/가로. **칸이 이 비율을 지켜야 카드가 카드로 보인다.**
    //
    // 칸을 남은 자리에 맞춰 늘리면 창 높이에 따라 카드가 납작해지고, 뒷면 그림이 잘린다.
    readonly cardAspect: number;
    // 좁은 화면에서는 세로로 길게 놓는다.
    readonly narrowColumns: number;
    readonly narrowRows: number;
    readonly narrowMaxWidthPx: number;

    // ── 카드가 날아와 앉는다 ───────────────────────────────────────────────
    //
    // 카드 판이 통째로 떠오르면 열 장이 한 덩어리로 보인다. 한 점에서 흩어져 제자리로
    // 날아와야 **열 장이 열 장으로 읽힌다.**

    // 한 장이 날아오는 시간.
    readonly flyInMs: number;
    // 장과 장 사이 간격. 0 이면 전부 같이 온다.
    readonly flyStepMs: number;
    // 결과 판이 뜬 뒤 첫 장이 뜨기까지의 뜸.
    readonly flyStartMs: number;
    // 흩어져 나오는 점이 판 가운데에서 얼마나 아래인가. 판 높이에 대한 비율.
    readonly flyFromBelowRatio: number;
    // 날아오기 시작할 때의 크기.
    readonly flyFromScale: number;
    // 날아오기 시작할 때 기울어진 정도. 장마다 이 폭 안에서 다르다.
    readonly flyFromTiltDeg: number;

    // 한 장씩 뒤집는 사이 간격.
    readonly flipStepMs: number;
    // 카드가 다 앉은 뒤 첫 장이 뒤집히기까지의 뜸.
    readonly flipStartMs: number;
    // 카드 한 장이 뒤집히는 데 걸리는 시간. 섬광이 이 한가운데에서 터진다.
    readonly flipMs: number;

    // 드러난 카드를 훑고 지나가는 빛줄기가 기울어진 정도.
    //
    // **0 이면 세로줄이다.** 세로로 지나가면 문이 열리는 것처럼 보이고, 기울이면
    // 표면이 반짝이는 것처럼 보인다. 22도쯤이 카드 모서리에서 모서리로 지나간다.
    readonly beamTiltDeg: number;
    // 빛줄기가 카드를 한 번 지나가는 데 걸리는 시간.
    readonly beamMs: number;
    // 그 빛줄기와 반짝임이 **되풀이되는 간격**.
    //
    // 뒤집힌 뒤에도 카드가 계속 반짝여야 좋은 카드로 보인다. 다만 쉴 틈이 있어야 한다 —
    // 쉬지 않고 반짝이면 눈이 아프고 싸구려로 보인다. 4.6초에 한 번이면 지나가는 눈에는
    // 이따금 반짝이는 것으로 보이고, 들여다보면 규칙이 보인다.
    readonly shineRepeatMs: number;

    // 오른쪽 위 등급표. **어느 색이 어느 등급인지 한 군데서만 말한다.**
    //
    // 카드마다 등급 이름을 찍으면 카드 그림을 가린다. 색은 카드 둘레 빛이 이미 말하고
    // 있으니, 그 색이 무슨 뜻인지만 한 번 적어 두면 된다.
    readonly legendTitle: string;
    // 등급표에 적을 등급. 좋은 것부터 적는다.
    readonly legendGrades: readonly CardGrade[];

    // 카드 앞면 경로를 카드 번호로 만든다.
    cardImage(cardId: number): string;
    // 카드 뒷면 경로. **없으면 null** — 그때는 그리는 쪽이 값으로 그린다.
    readonly cardBackImage: string | null;
    // 등급이 어떻게 보이는가.
    gradeLook(grade: CardGrade | null): GradeLook;
}

// 등급 다섯. 게임의 등급(1~5)과 일대일이다.
//
// 좋은 등급일수록 뒤집기가 늦다. **그것이 뽑기의 재미다** — 다 똑같이 뒤집히면 좋은 것이
// 나왔는지 알 길이 없다.
const GRADE_LOOKS: Readonly<Record<number, GradeLook>> = {
    [CardGrade.MYTHICAL]: {
        label: '신화',
        border: '#45bd80',
        glow: '0 0 25px rgba(69, 189, 128, 0.45), inset 0 0 15px rgba(69, 189, 128, 0.25)',
        tagColor: '#45bd80',
        flipDelayMs: 550,
        revealGlow: '0 0 16px rgba(69, 189, 128, 1), 0 0 44px rgba(69, 189, 128, 0.75),'
            + ' 0 0 110px rgba(69, 189, 128, 0.42), inset 0 0 26px rgba(69, 189, 128, 0.38)',
        revealHalo: '0 0 52px 16px rgba(69, 189, 128, 0.42)',
        anticipate: true,
        beam: true,
    },
    [CardGrade.LEGEND]: {
        label: '전설',
        border: '#a86fe8',
        glow: '0 0 22px rgba(168, 111, 232, 0.45), inset 0 0 15px rgba(168, 111, 232, 0.25)',
        tagColor: '#cca4fc',
        flipDelayMs: 350,
        revealGlow: '0 0 15px rgba(168, 111, 232, 1), 0 0 40px rgba(168, 111, 232, 0.72),'
            + ' 0 0 100px rgba(168, 111, 232, 0.38), inset 0 0 24px rgba(168, 111, 232, 0.34)',
        revealHalo: '0 0 46px 13px rgba(168, 111, 232, 0.38)',
        anticipate: true,
        beam: true,
    },
    [CardGrade.HERO]: {
        label: '영웅',
        border: '#4d9bf5',
        glow: '0 0 18px rgba(77, 155, 245, 0.35), inset 0 0 12px rgba(77, 155, 245, 0.2)',
        tagColor: '#7cb5f9',
        flipDelayMs: 0,
        revealGlow: '0 0 13px rgba(77, 155, 245, 0.92), 0 0 34px rgba(77, 155, 245, 0.55),'
            + ' 0 0 72px rgba(77, 155, 245, 0.26), inset 0 0 18px rgba(77, 155, 245, 0.28)',
        // 영웅부터는 뒤쪽 빛을 안 준다. 열 장에 영웅이 여럿이면 판이 뿌예진다.
        revealHalo: '',
        // 영웅은 맥동하지 않는다. 열 장 중 여럿이 영웅이면 판 전체가 깜박여 정신없다.
        anticipate: false,
        beam: false,
    },
    [CardGrade.UNCOMMON]: {
        label: '희귀',
        border: '#d9a443',
        glow: '0 0 14px rgba(217, 164, 67, 0.3)',
        tagColor: '#f3c774',
        flipDelayMs: 0,
        revealGlow: '0 0 10px rgba(217, 164, 67, 0.8), 0 0 26px rgba(217, 164, 67, 0.42),'
            + ' 0 0 54px rgba(217, 164, 67, 0.18)',
        revealHalo: '',
        anticipate: false,
        beam: false,
    },
    [CardGrade.COMMON]: {
        label: '일반',
        border: '#a33e38',
        glow: '0 0 8px rgba(163, 62, 56, 0.2)',
        tagColor: '#f07b75',
        flipDelayMs: 0,
        revealGlow: '0 0 8px rgba(163, 62, 56, 0.6), 0 0 20px rgba(163, 62, 56, 0.28)',
        revealHalo: '',
        anticipate: false,
        beam: false,
    },
};

// 등급이 안 적힌 카드가 카드 자료에 한 장 있다 (자연 에너지). 없는 값으로 두면 화면이
// 비므로 일반으로 보여 준다.
const UNKNOWN_GRADE: GradeLook = {
    label: '—',
    border: '#555',
    glow: '',
    tagColor: '#8fa3c7',
    flipDelayMs: 0,
    revealGlow: '0 0 8px rgba(143, 163, 199, 0.5), 0 0 20px rgba(143, 163, 199, 0.22)',
    revealHalo: '',
    anticipate: false,
    beam: false,
};

export function createDefaultGachaOverlayFrame(): GachaOverlayFrame {
    return {
        // 뽑기 영상.
        //
        // 영상은 그림 목록(image-paths.json)에 안 들어간다 — 그 목록은 그림만 훑어 만든다.
        // 그래서 경로를 여기 직접 적는다.
        //
        // 원본 17.76MB 를 2.6MB 로 줄인 것이다. 소리는 뺐다 — 연출에 소리를 안 쓴다.
        // 다시 만드는 방법은 docs/shop_gacha_effect.md 에 적어 두었다.
        videoSrc: 'resource/shop/video/gacha_effect.mp4',
        // 빛이 터지는 순간. **프레임별 밝기를 재서 찾은 값이다** — 8.42초가 가장 밝다.
        // 조금 앞서 시작해야 번쩍임과 영상의 빛이 겹친다.
        flashAtSeconds: 8.3,

        // 상점이 원래 쓰던 결과 양피지. 2250x1261 이다.
        resultBackground: 'resource/shop/background/new_card_background.png',
        resultAspect: 2250 / 1261,
        resultOverscan: 1.05,
        // 아래 넷은 **그림을 재서 나온 값이다.** 그림을 바꾸면 다시 재야 한다.
        // 종이는 가로 4.7%~87.8%, 세로 5.6%~92.9% 이고 제목이 15.5% 에서 끝난다.
        cardArea: {left: 0.055, right: 0.870, top: 0.170, bottom: 0.920},
        againTab: {left: 0.900, right: 0.976, top: 0.110, bottom: 0.178},
        lobbyTab: {left: 0.900, right: 0.976, top: 0.200, bottom: 0.262},
        flipAllTab: {left: 0.900, right: 0.976, top: 0.290, bottom: 0.352},
        // 제목(New Cards)이 가로 37.6%~56.4% 에서 끝나고 카드가 세로 17% 에서 시작한다.
        // 그 사이 빈 자리다.
        legendArea: {left: 0.575, right: 0.868, top: 0.060, bottom: 0.158},

        columns: 5,
        rows: 2,
        // 전투 손패와 같은 값이다. 카드 그림 자체의 사실이라 화면마다 다르지 않다.
        cardAspect: CARD_ASPECT,
        narrowColumns: 2,
        narrowRows: 5,
        narrowMaxWidthPx: 768,

        // 카드가 날아와 앉는다.
        //
        // 열 장이 다 앉기까지 120 + 9x55 + 620 = 1,235밀리초다. 그 뒤에 뒤집기가 시작한다.
        // 값을 올리면 느긋해지고 내리면 촤르륵 쏟아진다.
        flyInMs: 620,
        flyStepMs: 55,
        flyStartMs: 120,
        flyFromBelowRatio: 0.18,
        flyFromScale: 0.42,
        flyFromTiltDeg: 26,

        flipStepMs: 120,
        // 다 앉은 뒤의 뜸. **앉자마자 뒤집으면 앉은 것을 못 본다.**
        //
        // 맥동 한 바퀴(1,050밀리초)보다 길어야 한다. 첫 자리에 신화가 앉으면 이 뜸만큼만
        // 두근거리고 뒤집히는데, 그보다 짧으면 맥동이 한 번도 안 돈다.
        flipStartMs: 520,
        flipMs: 650,
        beamTiltDeg: 22,
        beamMs: 1050,
        shineRepeatMs: 4600,

        legendTitle: '등급',
        legendGrades: [
            CardGrade.MYTHICAL, CardGrade.LEGEND, CardGrade.HERO,
            CardGrade.UNCOMMON, CardGrade.COMMON,
        ],

        cardImage: (cardId) => `resource/my_card/card/${cardId}.png`,
        // 뒷면은 게임에 한 장뿐이라 카드 쪽(`card/shape`)이 든다. 여기서 두 번째로 적지
        // 않는다 — 전투도 같은 값을 쓸 것이다.
        cardBackImage: CARD_BACK_IMAGE,
        gradeLook: (grade) =>
            (grade !== null ? GRADE_LOOKS[grade] : undefined) ?? UNKNOWN_GRADE,
    };
}
