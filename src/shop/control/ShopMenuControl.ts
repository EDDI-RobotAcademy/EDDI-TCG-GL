import * as THREE from "three";

import {ViewportResize} from "../../core/resize/ViewportResize";
import {BackgroundFrame, createShopBackgroundFrame} from "../../background/frame/BackgroundFrame";
import {BackgroundRendererV2} from "../../background/renderer/BackgroundRendererV2";
import {createDefaultShopMenuFrame} from "../frame/ShopMenuFrame";
import {ShopMenuRenderer} from "../renderer/ShopMenuRenderer";
import {ShopMenuType} from "../entity/ShopMenuType";

// 상점에서 누를 수 있는 것을 다루는 곳이다.
//
// **기능 하나가 제 만들기·누름·크기 조절을 함께 가져간다** — 로비·레이드와 같은 방식이다.
//
// 전에는 이 셋이 화면 파일 안 여섯 군데에 있었다 — 배경 만들기, 뽑기 단추 넷 만들기,
// 누르는 자리 둘 만들기, 단추 누름 받기, 누르는 자리 누름 받기, 창 크기 바뀔 때 단추와
// 누르는 자리를 각각 다시 세기. 누를 것이 두 종류라 처리도 두 벌이었다.
//
// 지금은 그림이 있든 없든 같은 목록에 있고 같은 길로 누름을 받는다.
export interface ShopMenuDeps {
    readonly scene: THREE.Scene;
    readonly camera: THREE.Camera;
    readonly onResize: ViewportResize;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    readonly canvasElement: HTMLElement;
    // 무엇을 눌렀다. 무슨 일이 일어나는지는 화면이 안다.
    onPick(type: ShopMenuType): void;
}

export class ShopMenuControl {
    private constructor(
        private readonly deps: ShopMenuDeps,
        private readonly renderer: ShopMenuRenderer,
        private readonly group: THREE.Group,
    ) {}

    public static async build(deps: ShopMenuDeps): Promise<ShopMenuControl> {
        const backgroundFrame: BackgroundFrame = createShopBackgroundFrame();
        const backgroundRenderer = new BackgroundRendererV2();
        const backgroundGroup = await backgroundRenderer.build(backgroundFrame);
        deps.scene.add(backgroundGroup);
        // 만드는 자리에서 바로 등록한다.
        deps.onResize.add('layout', (width, height) =>
            backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height));

        const frame = createDefaultShopMenuFrame();
        const renderer = new ShopMenuRenderer();
        const group = await renderer.build(frame);
        deps.scene.add(group);
        // 안 보이는 누르는 자리도 함께 다시 잰다. 안 보이는 것이 어긋나면 눈에 안 띈다.
        deps.onResize.add('layout', (width, height) =>
            renderer.resize(frame, group, width, height));

        const control = new ShopMenuControl(deps, renderer, group);
        control.installClick();
        return control;
    }

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
            const picked = this.renderer.hitTest(raycaster, this.group);
            if (picked) this.deps.onPick(picked);
        });
    }
}
