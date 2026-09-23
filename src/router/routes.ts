import {Route} from "./Route";

// 갈 수 있는 길의 목록이다.
//
// **화면을 미리 들여오지 않는다.** `import(...)` 를 부를 때 그 화면의 코드가 내려온다.
// 그래서 로비를 열 때 로비만 내려오고, 나머지 넷은 사용자가 로비를 보는 동안 브라우저가
// 한가한 틈에 미리 받아 둔다 (`webpackPrefetch`). 누를 때는 이미 와 있으므로 멈칫하지
// 않는다.
//
// 전에는 이 파일이 화면 다섯을 맨 위에서 다 들여왔다. 그래서 어느 화면에서 시작해도
// 189파일 35,055줄이 전부 딸려오고, 내려가는 파일 하나가 6.87MB 였다 (R2-134).
export const routes: Route[] = [
    {
        path: '/tcg-main-lobby',
        load: async () => {
            const {TCGMainLobbyView} = await import('../lobby/TCGMainLobbyView');
            return (root, navigator) => TCGMainLobbyView.getInstance(root, navigator);
        },
    },
    {
        path: '/tcg-card-shop',
        load: async () => {
            const {TCGCardShopView} = await import(
                /* webpackPrefetch: true */ '../shop/TCGCardShopView');
            return (root, navigator) => TCGCardShopView.getInstance(root, navigator);
        },
    },
    {
        // 대전 화면이다. 이름의 simulation 은 임시다. 나중에 대전으로 바뀐다.
        //
        // 다섯 중 가장 크다. 미리 받아 두는 것이 가장 크게 듣는 자리다.
        path: '/tcg-simulation-battle-field',
        load: async () => {
            const {SimulationBattleFieldView} = await import(
                /* webpackPrefetch: true */ '../battle/ui/view/SimulationBattleFieldView');
            return (root) => SimulationBattleFieldView.getInstance(root);
        },
    },
    {
        // 레이드 화면이다. 아직 준비 중이라 자리만 있다 (R2-132).
        path: '/tcg-raid',
        load: async () => {
            const {TCGRaidView} = await import(
                /* webpackPrefetch: true */ '../raid/TCGRaidView');
            return (root, navigator) => TCGRaidView.getInstance(root, navigator);
        },
    },
    {
        path: '/tcg-my-card',
        load: async () => {
            const {TCGMyCardView} = await import(
                /* webpackPrefetch: true */ '../my_card/TCGMyCardView');
            return (root, navigator) => TCGMyCardView.getInstance(root, navigator);
        },
    },
];
