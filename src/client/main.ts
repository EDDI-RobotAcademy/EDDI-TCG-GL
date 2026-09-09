// 게임의 진입점이다. 로비에서 시작한다.
//
// 여기서부터 로비, 상점, 보유 카드, 전투로 오간다. 어느 화면을 띄울지는 라우터가 정한다.
import {RouteMap} from "../router/RouteMap";
import {routes} from "../router/routes";

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("화면을 붙일 자리를 찾을 수 없습니다. index.html 의 app 을 확인해 주십시오.");
}

const routeMap = new RouteMap(rootElement, '/tcg-main-lobby');
routeMap.registerRoutes(routes);
