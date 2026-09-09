import { TCGMainLobbyView } from '../lobby/TCGMainLobbyView';
import {RouteMap} from "./RouteMap";
import {Component} from "./Component";
import {TCGCardShopView} from "../shop/TCGCardShopView";
import {SimulationBattleFieldView} from "../battle/view/SimulationBattleFieldView";
import {TCGMyCardView} from "../my_card/TCGMyCardView";

export interface Route {
    path: string;
    getComponentInstance: (rootElement: HTMLElement, routeMap: RouteMap) => Component;
}

export const routes: Route[] = [
    {
        path: '/tcg-main-lobby',
        getComponentInstance: (rootElement: HTMLElement, routeMap: RouteMap) => {
            return TCGMainLobbyView.getInstance(rootElement, routeMap);
        }
    },
    {
        path: '/tcg-card-shop',
        getComponentInstance: (rootElement: HTMLElement, routeMap: RouteMap) => {
            return TCGCardShopView.getInstance(rootElement, routeMap);
        }
    },
    {
        // 대전 화면이다. 이름의 simulation 은 임시다. 나중에 대전으로 바뀐다.
        //
        // 확인용 화면으로 만들어 오던 것을 그대로 띄운다. 카드 열두 장의 효과,
        // 필드 에너지, 턴 표시, 무덤과 로스트 존이 다 여기 있다.
        path: '/tcg-simulation-battle-field',
        getComponentInstance: (rootElement: HTMLElement) => {
            return SimulationBattleFieldView.getInstance(rootElement);
        }
    },
    {
        path: '/tcg-my-card',
        getComponentInstance: (rootElement: HTMLElement, routeMap: RouteMap) => {
            return TCGMyCardView.getInstance(rootElement, routeMap);
        }
    },
];