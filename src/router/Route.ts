import {Component} from "./Component";
import {Navigator} from "./Navigator";

// 화면 하나를 만들어 주는 것.
export type ComponentFactory = (
    rootElement: HTMLElement, navigator: Navigator,
) => Component;

// 길 하나다.
//
// **화면을 미리 들여오지 않는다.** `load` 를 부를 때 비로소 그 화면의 코드를 받아 온다.
// 그래서 로비만 열면 로비만 내려오고, 나머지는 사용자가 로비를 보는 동안 조용히 받힌다.
//
// 전에는 이 자리에 화면을 만드는 함수가 바로 있었고, 그러려면 길 목록이 화면 다섯을 다
// 들여와야 했다. 그 결과 어느 화면에서 시작해도 189파일 35,055줄이 전부 딸려왔다.
export interface Route {
    readonly path: string;
    load(): Promise<ComponentFactory>;
}
