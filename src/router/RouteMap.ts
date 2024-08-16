import { Route } from './routes';
import { Component } from './Component';

export class RouteMap {
    private routes: Route[] = [];
    private rootElement: HTMLElement;
    private activeComponent: Component | null = null;

    constructor(rootElement: HTMLElement, initialPath: string) {
        this.rootElement = rootElement;
        window.addEventListener('popstate', this.handleRouteChange.bind(this));

        if (initialPath) {
            this.navigate(initialPath);
        }
    }

    public registerRoutes(routes: Route[]): void {
        this.routes = routes;
        this.handleRouteChange();
    }

    public navigate(path: string): void {
        window.history.pushState({}, '', path);
        this.handleRouteChange();
    }

    private handleRouteChange(): void {
        const currentPath = window.location.pathname;
        const route = this.routes.find(route => route.path === currentPath);

        if (route) {
            if (this.activeComponent) {
                this.activeComponent.hide();
            }
            this.activeComponent = route.getComponentInstance(this.rootElement, this);
            this.activeComponent.initialize();
        } else {
            console.error(`No route found for ${currentPath}`);
            // 기본 경로가 이미 `/tcg-main-lobby`로 설정된 경우 무한 리디렉션을 피하기 위해 추가
            if (currentPath !== '/tcg-main-lobby') {
                this.navigate('/tcg-main-lobby');  // 기본 경로로 리디렉션
            }
        }
    }
}
