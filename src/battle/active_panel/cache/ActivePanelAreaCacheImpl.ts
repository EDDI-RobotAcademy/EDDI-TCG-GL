import * as THREE from "three";
import {ActivePanelAreaCache} from "./ActivePanelAreaCache";
import {Vector2d} from "../../../common/math/Vector2d";
import {getCardById} from "../../../card/utility";
import {SelectedActivePanelButtonStore} from "../store/SelectedActivePanelButtonStore";
import {SelectedActivePanelButtonStoreImpl} from "../store/SelectedActivePanelButtonStoreImpl";
import {createLegacyActivePanelFrame} from "../frame/LegacyActivePanelFrame";
import {LegacyActivePanelRenderer, LegacyActivePanelParts} from "../renderer/LegacyActivePanelRenderer";

export class ActivePanelAreaCacheImpl implements ActivePanelAreaCache {
    private static instance: ActivePanelAreaCacheImpl | null = null;

    private parts: LegacyActivePanelParts | null = null;

    // 만드는 일은 렌더러가 한다. 그래서 여기는 화면과 카메라를 안 든다.
    //
    // 전에는 이 곳이 버튼을 만들어 화면에 붙였다. 그러려면 화면과 카메라가 필요했고,
    // 혼자만 있는 것이라 처음 만든 화면에 묶였다. 화면이 둘이면 뒤엣것에 안 그려진다.
    private readonly renderer = new LegacyActivePanelRenderer();
    private readonly frame = createLegacyActivePanelFrame();

    // 고른 버튼 값의 주인은 이쪽이 아니다. 패널을 치울 때 함께 처음으로 돌리기만 한다.
    private readonly selectedActivePanelButtonStore: SelectedActivePanelButtonStore =
        SelectedActivePanelButtonStoreImpl.getInstance();

    private constructor() {}

    static getInstance(): ActivePanelAreaCacheImpl {
        if (!ActivePanelAreaCacheImpl.instance) {
            ActivePanelAreaCacheImpl.instance = new ActivePanelAreaCacheImpl();
        }
        return ActivePanelAreaCacheImpl.instance;
    }

    async open(
        scene: THREE.Scene, camera: THREE.Camera, x: number, y: number, cardId: number,
    ): Promise<void> {
        if (this.parts) {
            console.warn("이미 Active Panel이 존재합니다.");
            return;
        }

        const card = getCardById(cardId);
        if (!card) throw new Error(`Card ${cardId} 찾을 수 없음`);

        const skillCount = Number(card["스킬 개수" as keyof typeof card]) || 0;

        // 누른 자리를 화면 좌표로 옮긴다. 패널의 가운데가 된다.
        const center = this.resolveCenter(camera, x, y, skillCount);

        this.parts = await this.renderer.build(this.frame, center, cardId, skillCount);
        scene.add(this.parts.panel);
        for (const button of this.parts.buttons) {
            scene.add(button);
            console.log(`${button.userData.type} 버튼 추가 완료`, button.position);
        }
    }

    close(scene: THREE.Scene): void {
        if (!this.parts) {
            console.warn("삭제할 Active Panel 없음");
        } else {
            scene.remove(this.parts.panel);
            for (const button of this.parts.buttons) scene.remove(button);
            this.renderer.dispose(this.parts);
            this.parts = null;
        }
        this.selectedActivePanelButtonStore.clear();
    }

    exists(): boolean {
        return this.parts !== null;
    }

    getActiveButtons(): THREE.Mesh[] {
        return this.parts?.buttons ?? [];
    }

    // 누른 자리에서 패널 가운데를 잡는다. 옛 방식 그대로다.
    private resolveCenter(
        camera: THREE.Camera, x: number, y: number, skillCount: number,
    ): Vector2d {
        const width = this.frame.panelWidthRatio * window.innerWidth;
        const height = this.frame.panelHeightRatio * window.innerWidth * (skillCount + 2);
        const point = new THREE.Vector3(
            ((x + width * 0.5) / window.innerWidth) * 2 - 1,
            -((y + height * 0.5) / window.innerHeight) * 2 + 1,
            0,
        );
        point.unproject(camera);
        return new Vector2d(point.x, point.y);
    }
}
