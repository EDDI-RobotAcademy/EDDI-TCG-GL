import {RouteMap} from "./router/RouteMap";
import {routes} from "./router/routes";
import {TCGMainLobbyView} from "./lobby/TCGMainLobbyView";

const rootElement = document.getElementById('app');

if (rootElement) {
    const routeMap = new RouteMap(rootElement, '/tcg-main-lobby');
    routeMap.registerRoutes(routes);
} else {
    console.error('Root element not found');
}