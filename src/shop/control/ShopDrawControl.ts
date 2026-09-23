import * as THREE from "three";

import {ViewportResize} from "../../core/resize/ViewportResize";
import {CardRace} from "../../card/race";
import {CardDraw, DRAW_COUNT} from "../draw/CardDraw";
import {ShopMenuType} from "../entity/ShopMenuType";
import {
    ShopDrawConfirmFrame, createDefaultShopDrawConfirmFrame,
} from "../frame/ShopDrawConfirmFrame";
import {
    ShopDrawResultFrame, createDefaultShopDrawResultFrame,
} from "../frame/ShopDrawResultFrame";
import {ShopDrawRenderer} from "../renderer/ShopDrawRenderer";

// 카드를 뽑는 일을 다루는 곳이다.
//
// 사용자가 하는 순서가 그대로 상태다.
//
//   뽑기 단추를 누른다 → 확인 화면 → 예 → 뽑은 카드 열 장 → 아무 곳이나 눌러 닫는다
//                                  → 아니오 → 닫힌다
//
// **무엇이 뽑히는지는 여기가 정하지 않는다.** 뽑는 창구에 묻고 받은 것을 보여 준다. 지금은
// 그 창구가 이 안에서 굴리고, 서버가 붙으면 서버에 묻는 것으로 바뀐다 — 여기는 안 바뀐다.
//
// 재화 200 은 아직 안 깎는다. 재화를 클라이언트가 들면 아무나 고칠 수 있어서, 서버가 붙을
// 때 서버가 깎는다.
export interface ShopDrawDeps {
    readonly scene: THREE.Scene;
    readonly camera: THREE.Camera;
    readonly onResize: ViewportResize;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    readonly canvasElement: HTMLElement;
    readonly cardDraw: CardDraw;
    // 왜 안 되는지 알린다.
    announce(message: string): void;
}

// 지금 무엇이 떠 있나.
type Stage = 'none' | 'confirm' | 'result';

export class ShopDrawControl {
    private stage: Stage = 'none';
    // 떠 있는 것. 닫을 때 치운다.
    private shown: THREE.Group | null = null;
    // 확인 화면에서 무엇을 뽑기로 했나.
    private chosen: ShopMenuType | null = null;
    // 뽑는 동안 또 누르는 것을 막는다.
    private drawing = false;

    private constructor(
        private readonly deps: ShopDrawDeps,
        private readonly renderer: ShopDrawRenderer,
        private readonly confirmFrame: ShopDrawConfirmFrame,
        private readonly resultFrame: ShopDrawResultFrame,
    ) {}

    public static build(deps: ShopDrawDeps): ShopDrawControl {
        const control = new ShopDrawControl(
            deps,
            new ShopDrawRenderer(),
            createDefaultShopDrawConfirmFrame(),
            createDefaultShopDrawResultFrame(),
        );
        control.installClick();
        // 떠 있는 것도 창 크기를 따라가야 한다. 안 그러면 확인 화면만 처음 크기에 남는다.
        deps.onResize.add('layout', (width, height) => control.resize(width, height));
        return control;
    }

    // 뽑기 단추가 눌렸다. 확인 화면을 띄운다.
    public async openConfirm(type: ShopMenuType): Promise<void> {
        if (this.stage !== 'none') return;

        const group = await this.renderer.buildConfirm(this.confirmFrame, type);
        if (!group) return;

        this.chosen = type;
        this.show(group, 'confirm');
    }

    // 무엇이 떠 있나. 떠 있으면 뒤의 단추가 눌리면 안 된다.
    public isOpen(): boolean {
        return this.stage !== 'none';
    }

    // ── 누름 ────────────────────────────────────────────────────────────────────

    private installClick(): void {
        const raycaster = new THREE.Raycaster();
        this.deps.listen(this.deps.canvasElement, 'mousedown', (event: never) => {
            const e = event as unknown as MouseEvent;
            if (e.button !== 0 || this.stage === 'none' || !this.shown) return;

            // 떠 있는 동안은 누름이 전부 여기로 온다. 뒤로 새어 나가면 안 된다.
            e.stopImmediatePropagation();

            if (this.stage === 'result') {
                this.close();
                return;
            }

            raycaster.setFromCamera(new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
            ), this.deps.camera);

            const pick = this.renderer.hitConfirm(raycaster, this.shown);
            if (pick === 'no') this.close();
            else if (pick === 'yes') void this.drawCards();
        });
    }

    private async drawCards(): Promise<void> {
        // 뽑는 동안 또 누르면 두 번 뽑힌다.
        if (this.drawing || this.chosen === null) return;
        this.drawing = true;
        const type = this.chosen;

        try {
            const cardIds = await this.deps.cardDraw.draw(raceOf(type), DRAW_COUNT);
            if (cardIds.length === 0) {
                this.deps.announce('뽑을 카드가 없습니다.');
                this.close();
                return;
            }
            const group = await this.renderer.buildResult(this.resultFrame, cardIds);
            this.clearShown();
            this.show(group, 'result');
            console.log(`[shop] ${type} 뽑기 ${cardIds.length}장: ${cardIds.join(', ')}`);
        } finally {
            this.drawing = false;
        }
    }

    // ── 띄우고 치우기 ───────────────────────────────────────────────────────────

    private show(group: THREE.Group, stage: Stage): void {
        this.deps.scene.add(group);
        this.shown = group;
        this.stage = stage;
    }

    private close(): void {
        this.clearShown();
        this.stage = 'none';
        this.chosen = null;
    }

    private clearShown(): void {
        if (!this.shown) return;
        this.shown.removeFromParent();
        this.renderer.dispose(this.shown);
        this.shown = null;
    }

    private resize(width: number, height: number): void {
        if (!this.shown) return;
        if (this.stage === 'confirm') {
            this.renderer.resizeConfirm(this.confirmFrame, this.shown, width, height);
        } else if (this.stage === 'result') {
            this.renderer.resizeResult(this.resultFrame, this.shown, width, height);
        }
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
