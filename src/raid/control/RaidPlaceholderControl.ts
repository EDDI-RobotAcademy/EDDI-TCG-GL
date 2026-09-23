import * as THREE from "three";

import {ViewportResize} from "../../core/resize/ViewportResize";
import {createDefaultRaidPlaceholderFrame} from "../frame/RaidPlaceholderFrame";
import {RaidPlaceholderRenderer} from "../renderer/RaidPlaceholderRenderer";

// 레이드 화면에 놓인 것을 다루는 곳이다.
//
// **기능 하나가 제 만들기·누름·크기 조절을 함께 가져간다** — 로비와 같은 방식이다
// (R2-131 을 그대로 따른다).
//
// 지금 하는 일은 [준비 중] 을 알리고 아무 곳이나 누르면 돌아가는 것뿐이다. 실제 레이드
// 기능이 붙으면 이 자리 옆에 그 기능을 다루는 자리가 생긴다 — 이것을 키워서 만들지 않는다.
export interface RaidPlaceholderDeps {
    readonly scene: THREE.Scene;
    readonly onResize: ViewportResize;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    readonly canvasElement: HTMLElement;
    // 나가겠다고 눌렀다. 어디로 갈지는 화면이 안다.
    onLeave(): void;
}

export class RaidPlaceholderControl {
    private constructor() {}

    public static async build(deps: RaidPlaceholderDeps): Promise<RaidPlaceholderControl> {
        const frame = createDefaultRaidPlaceholderFrame();
        const renderer = new RaidPlaceholderRenderer();
        const group = await renderer.build(frame);
        deps.scene.add(group);
        // 만드는 자리에서 바로 등록한다.
        deps.onResize.add('layout', (width, height) =>
            renderer.resize(frame, group, width, height));

        // 준비 중인 화면이라 누를 것이 따로 없다. 아무 곳이나 누르면 나간다.
        deps.listen(deps.canvasElement, 'mousedown', (event: never) => {
            if ((event as unknown as MouseEvent).button !== 0) return;
            deps.onLeave();
        });

        return new RaidPlaceholderControl();
    }
}
