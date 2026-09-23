import * as THREE from "three";

import {ViewportResize} from "../../core/resize/ViewportResize";
import {BackgroundFrame, createMainLobbyBackgroundFrame} from "../../background/frame/BackgroundFrame";
import {BackgroundRendererV2} from "../../background/renderer/BackgroundRendererV2";
import {LobbyMenuFrame, createDefaultLobbyMenuFrame} from "../frame/LobbyMenuFrame";
import {LobbyMenuRenderer} from "../renderer/LobbyMenuRenderer";
import {LobbyMenuType} from "../entity/LobbyMenuType";

// 로비 메뉴를 다루는 곳이다.
//
// **기능 하나가 제 만들기·누름·크기 조절을 함께 가져간다.** 전에는 셋이 화면 파일 안
// 다른 자리에 있었다 — 배경과 단추를 만드는 두 곳, 누름을 받는 곳, 창 크기가 바뀔 때
// 단추 넷의 자리와 크기를 다시 세는 곳. 단추 하나를 더하려면 그 넷을 다 찾아야 했다.
//
// 지금은 단추를 더하는 일이 프레임 목록에 한 줄 적는 일이다 (R2-131).
export interface LobbyMenuDeps {
    readonly scene: THREE.Scene;
    readonly camera: THREE.Camera;
    readonly onResize: ViewportResize;
    // 화면을 떠날 때 함께 떼도록 화면이 든다.
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    readonly canvasElement: HTMLElement;
    // 메뉴를 골랐다. 어디로 갈지는 화면이 안다.
    onPick(type: LobbyMenuType): void;
}

export class LobbyMenuControl {
    private constructor(
        private readonly deps: LobbyMenuDeps,
        private readonly menuFrame: LobbyMenuFrame,
        private readonly menuRenderer: LobbyMenuRenderer,
        private readonly menuGroup: THREE.Group,
    ) {}

    public static async build(deps: LobbyMenuDeps): Promise<LobbyMenuControl> {
        const backgroundFrame: BackgroundFrame = createMainLobbyBackgroundFrame();
        const backgroundRenderer = new BackgroundRendererV2();
        const backgroundGroup = await backgroundRenderer.build(backgroundFrame);
        deps.scene.add(backgroundGroup);
        // 만드는 자리에서 바로 등록한다. 만드는 곳과 다시 재는 곳이 멀어지면 잊는다.
        deps.onResize.add('layout', (width, height) =>
            backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height));

        const menuFrame = createDefaultLobbyMenuFrame();
        const menuRenderer = new LobbyMenuRenderer();
        const menuGroup = await menuRenderer.build(menuFrame);
        deps.scene.add(menuGroup);
        deps.onResize.add('layout', (width, height) =>
            menuRenderer.resize(menuFrame, menuGroup, width, height));

        const control = new LobbyMenuControl(deps, menuFrame, menuRenderer, menuGroup);
        control.installClick();
        return control;
    }

    // 누른 자리에 단추가 있으면 그 메뉴를 고른 것이다.
    //
    // 어느 단추인지 찾는 일은 그리는 쪽이 한다. 여기는 찾은 것을 화면에 알린다.
    private installClick(): void {
        const raycaster = new THREE.Raycaster();
        this.deps.listen(this.deps.canvasElement, 'mousedown', (event: never) => {
            const e = event as unknown as MouseEvent;
            if (e.button !== 0) return;
            const ndc = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
            );
            raycaster.setFromCamera(ndc, this.deps.camera);
            const picked = this.menuRenderer.hitTest(raycaster, this.menuGroup);
            if (picked) this.deps.onPick(picked);
        });
    }
}
