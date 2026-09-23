import {Route} from "./Route";
import {Component} from "./Component";
import {Navigator} from "./Navigator";

// 지금 어느 화면을 띄우고 있는지 아는 곳이다.
//
// **화면 목록을 안 들여온다.** 길 하나가 어떻게 생겼는지(`Route`)만 알고, 그 안의 화면은
// 부를 때 받아 온다. 전에는 여기가 화면 목록을 들여와서 화면 → 길 안내 → 화면 목록 →
// 화면 으로 고리가 돌았고, 그 고리가 화면별로 쪼개는 것을 막고 있었다 (R2-134).
export class RouteMap implements Navigator {
    private routes: Route[] = [];
    private activeComponent: Component | null = null;

    // 지금 가려는 길. 받아 오는 동안 사용자가 또 누르면 앞의 것을 버린다.
    //
    // 화면을 받아 오는 데 시간이 걸리므로, 기다리는 사이에 다른 길로 갈 수 있다. 그때
    // 먼저 시작한 쪽이 늦게 도착해 화면을 덮으면 누른 것과 다른 화면이 뜬다.
    private pendingPath: string | null = null;

    constructor(
        private readonly rootElement: HTMLElement,
        initialPath: string = '/tcg-main-lobby',
    ) {
        window.addEventListener('popstate', () => { void this.handleRouteChange(); });

        if (initialPath !== '/tcg-main-lobby') {
            this.navigate(initialPath);
        }
    }

    public registerRoutes(routes: Route[]): void {
        this.routes = routes;
        void this.handleRouteChange();
    }

    public navigate(path: string): void {
        window.history.pushState({}, '', path);
        void this.handleRouteChange();
    }

    private async handleRouteChange(): Promise<void> {
        const currentPath = window.location.pathname;
        const route = this.routes.find((it) => it.path === currentPath);

        if (!route) {
            console.error(`No route found for ${currentPath}`);
            // 기본 길이 이미 로비면 또 보내지 않는다. 안 그러면 끝없이 돈다.
            if (currentPath !== '/tcg-main-lobby') {
                this.navigate('/tcg-main-lobby');
            }
            return;
        }

        this.pendingPath = currentPath;
        const create = await route.load();
        // 받아 오는 동안 다른 길로 갔다. 이 결과는 버린다.
        if (this.pendingPath !== currentPath) return;
        this.pendingPath = null;

        const next = create(this.rootElement, this);
        if (this.activeComponent && this.activeComponent !== next) {
            this.activeComponent.hide();
        }
        this.activeComponent = next;
        next.show();
    }
}
