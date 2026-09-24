import * as THREE from "three";

import {ViewportResize} from "../../core/resize/ViewportResize";
import {CardRace} from "../../card/race";
import {ShopMenuType} from "../entity/ShopMenuType";
import {
    ShopDrawConfirmFrame, createDefaultShopDrawConfirmFrame,
} from "../frame/ShopDrawConfirmFrame";
import {ShopDrawRenderer} from "../renderer/ShopDrawRenderer";

// 뽑기를 확인하는 화면을 다루는 곳이다.
//
//   뽑기 단추 → 확인 화면 → 예 → 뽑기 연출로 넘긴다
//                         → 아니오 → 닫힌다
//
// **연출은 여기가 안 든다.** 영상과 카드 열 장은 화면 위에 얹는 겹(DOM)이 그리고, 그것은
// `GachaOverlayControl` 이 다룬다 — 카드 뒤집기를 CSS 가 진짜 3D 로 돌려 주고 등급 이름과
// 카드 이름이 글자라, 그림판에 그리는 것보다 낫다.
//
// 확인 화면만 그림판에 남는다. 상점 배경 위에 얹히는 그림 셋(덮는 판, 종족 그림, 예/아니오)
// 이라 상점 화면과 같은 방식이 맞다.
export interface ShopDrawDeps {
    readonly scene: THREE.Scene;
    readonly camera: THREE.Camera;
    readonly onResize: ViewportResize;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    readonly canvasElement: HTMLElement;
    // [예] 를 눌렀다. 이 종족에서 뽑는다. null 이면 전 종족.
    onConfirmed(race: CardRace | null): void;
}

export class ShopDrawControl {
    // 확인 화면이 떠 있나.
    private shown: THREE.Group | null = null;

    private constructor(
        private readonly deps: ShopDrawDeps,
        private readonly renderer: ShopDrawRenderer,
        private readonly confirmFrame: ShopDrawConfirmFrame,
    ) {}

    public static build(deps: ShopDrawDeps): ShopDrawControl {
        const control = new ShopDrawControl(
            deps, new ShopDrawRenderer(), createDefaultShopDrawConfirmFrame(),
        );
        control.installClick();
        // 떠 있는 것도 창 크기를 따라가야 한다.
        deps.onResize.add('layout', (width, height) => control.resize(width, height));
        return control;
    }

    // 뽑기 단추가 눌렸다. 확인 화면을 띄운다.
    public async openConfirm(type: ShopMenuType): Promise<void> {
        if (this.shown) return;

        const group = await this.renderer.buildConfirm(this.confirmFrame, type);
        if (!group) return;

        group.userData = {...group.userData, shopMenuType: type};
        this.deps.scene.add(group);
        this.shown = group;
    }

    // 확인 화면이 떠 있나. 떠 있으면 뒤의 단추를 누를 수 없다.
    public isOpen(): boolean {
        return this.shown !== null;
    }

    public close(): void {
        if (!this.shown) return;
        this.shown.removeFromParent();
        this.renderer.dispose(this.shown);
        this.shown = null;
    }

    private installClick(): void {
        const raycaster = new THREE.Raycaster();
        this.deps.listen(this.deps.canvasElement, 'mousedown', (event: never) => {
            const e = event as unknown as MouseEvent;
            const shown = this.shown;
            if (e.button !== 0 || !shown) return;

            // 떠 있는 동안은 누름이 전부 여기로 온다. 뒤로 새어 나가면 안 된다.
            e.stopImmediatePropagation();

            raycaster.setFromCamera(new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
            ), this.deps.camera);

            const pick = this.renderer.hitConfirm(raycaster, shown);
            if (pick === 'no') {
                this.close();
                return;
            }
            if (pick === 'yes') {
                const type = (shown.userData as {shopMenuType?: ShopMenuType}).shopMenuType;
                this.close();
                if (type) this.deps.onConfirmed(raceOf(type));
            }
        });
    }

    private resize(width: number, height: number): void {
        if (!this.shown) return;
        this.renderer.resizeConfirm(this.confirmFrame, this.shown, width, height);
    }
}

// 뽑기 종류가 어느 종족을 뜻하나. 전 종족이면 null.
function raceOf(type: ShopMenuType): CardRace | null {
    switch (type) {
        case ShopMenuType.DrawHuman: return CardRace.HUMAN;
        case ShopMenuType.DrawUndead: return CardRace.UNDEAD;
        case ShopMenuType.DrawTrent: return CardRace.TRENT;
        default: return null;
    }
}
