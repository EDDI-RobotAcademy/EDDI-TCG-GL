import {LobbyMenuType} from "../entity/LobbyMenuType";

// 로비 메뉴 단추 하나가 화면에서 어떻게 보이는가.
//
// **THREE 를 모른다.** 값만 든다 (frame-no-three).
//
// 자리와 크기를 창 크기에 대한 비율로 든다. 전에는 1920x1080 을 기준으로 잡은 점 좌표를
// 들고 있었고, 창 크기가 바뀔 때마다 그 기준으로 다시 세는 코드가 화면 파일 안에 있었다.
// 비율로 두면 렌더러가 매번 같은 식으로 곱하기만 한다.
export interface LobbyMenuButtonFrame {
    readonly type: LobbyMenuType;
    // 단추 그림. 아직 그림이 없는 메뉴는 글자로 그린다.
    readonly imageSrc: string | null;
    // 그림이 없을 때 그릴 글자. 그림이 생기면 이 줄을 지우고 imageSrc 를 채운다.
    readonly label: string | null;
    // 창 너비·높이에 대한 비율. 화면 가운데가 0 이다.
    readonly xRatio: number;
    readonly yRatio: number;
    readonly widthRatio: number;
    readonly heightRatio: number;
    readonly renderOrder: number;
}

export interface LobbyMenuFrame {
    readonly buttons: readonly LobbyMenuButtonFrame[];
}

// 기준 화면 1920x1080 에서 재던 값을 비율로 옮긴 것이다.
const WIDTH_RATIO = 800 / 1920;
const HEIGHT_RATIO = 100 / 1080;
const X_RATIO = -400 / 1920;
const GAP_RATIO = 120 / 1080;

// 단추 줄 **전체의 가운데**. 맨 위 단추 자리가 아니다.
//
// 맨 위를 기준으로 잡으면 단추를 하나 더할 때마다 줄 전체가 위로 밀린다. 실제로
// 레이드를 더했을 때 그렇게 됐다 (R2-132). 가운데를 기준으로 두면 몇 개가 되어도
// 줄이 같은 자리에 선다.
//
// 아래로 내리려면 이 값을 더 작게, 올리려면 더 크게 한다. 한 칸이 120/1080 이다.
const CENTER_Y_RATIO = -20 / 1080;

// 위에서 아래로 놓이는 차례.
//
// 그림이 있는 것은 그림으로, 없는 것은 글자로 그린다. 둘이 같은 크기 같은 자리에 선다.
const ORDER: readonly {type: LobbyMenuType; imageSrc: string | null; label: string | null}[] = [
    {type: LobbyMenuType.Battle,     imageSrc: 'resource/main_lobby/buttons/entrance_game_button.png', label: null},
    {type: LobbyMenuType.Deck,       imageSrc: 'resource/main_lobby/buttons/my_card_button.png',       label: null},
    {type: LobbyMenuType.Shop,       imageSrc: 'resource/main_lobby/buttons/shop_button.png',          label: null},
    // 레이드 그림이 아직 없다. 글자로 둔다 (R2-132). 그림이 생기면 imageSrc 를 채우고
    // label 을 null 로 바꾸면 된다 — 렌더러는 이미 둘 다 그릴 수 있다.
    {type: LobbyMenuType.Raid,       imageSrc: null,                                                  label: '레이드'},
    {type: LobbyMenuType.TestBattle, imageSrc: 'resource/main_lobby/buttons/test_button.png',         label: null},
];

export function createDefaultLobbyMenuFrame(): LobbyMenuFrame {
    // 줄 가운데를 기준으로 위아래로 고르게 벌린다.
    const middle = (ORDER.length - 1) / 2;
    return {
        buttons: ORDER.map((it, index) => ({
            type: it.type,
            imageSrc: it.imageSrc,
            label: it.label,
            xRatio: X_RATIO,
            yRatio: CENTER_Y_RATIO + (index - middle) * GAP_RATIO,
            widthRatio: WIDTH_RATIO,
            heightRatio: HEIGHT_RATIO,
            renderOrder: 1,
        })),
    };
}
