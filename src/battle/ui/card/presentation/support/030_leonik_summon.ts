import * as THREE from "three";
import {LeonikSummonEffect} from "../../../animation/card/support/030_leonik_summon/LeonikSummonEffect";
import {CardGridPopupRenderer} from "../../../card_grid_popup/renderer/CardGridPopupRenderer";
import {computeCardGridPopupBounds} from "../../../card_grid_popup/frame/CardGridPopupFrame";
import {createDefaultYourTombPopupFrame} from "../../../zone/your_tomb/frame/YourTombPopupFrame";
import {createDefaultHandCardFrame} from "../../../hand/frame/HandCardFrame";
import {LeonikPopupPartsRenderer} from "../../../leonik_popup/renderer/LeonikPopupPartsRenderer";
import {createAllyTargetingNeonBorderFrame} from "../../../../../neon_border/frame/NeonBorderFrame";
import {findCardAbility} from "../../../../domain/ability/CardAbility";
import {CardKind} from "../../../../../card/kind";
import {HandEntry} from "../../../hand/renderer/BattleFieldHandRendererV2";
import {
    CardPresentation, CardPresentationContext, DropHit, DroppedCard,
} from "../../CardPresentation";

// 해골 군주 레오닉의 부름 — 덱에서 영웅 등급 이하 유닛 둘을 골라 손패로 가져온다.
//
// 내 필드 영역 안에 떨어뜨려야 한다.
//
// **떨어뜨리면 창이 열린다.** 그 창은 이 카드의 것이다 — 덱에서 고를 수 있는 것만 보여 주고,
// 쪽을 넘길 수 있고, 고른 것에 초록 테두리가 붙고, 둘을 다 고르면 확인 단추가 밝아진다.
// 그 창이 어떻게 생겼는지는 이 카드만 알므로, 화면은 누른 자리만 넘겨 준다.
//
// 고를 것이 하나도 없으면 창을 안 열고 그냥 쓰인 것이 된다. 카드는 무덤으로 간다.

const CARD_ID = 30;

// 테두리가 밝기를 오르내리는 빠르기. 초에 한 번쯤 돈다.
const PULSE_STEP = createAllyTargetingNeonBorderFrame().timeIncrement;

interface SelectionBorder {
    readonly mesh: THREE.Mesh;
    readonly material: THREE.ShaderMaterial;
}

export const LeonikSummonPresentation: CardPresentation = {
    cardId: CARD_ID,
    dropTarget: 'yourFieldArea',

    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean {
        if (hit.kind !== 'area') return false;
        void new LeonikPicker(ctx, dropped.entry).open();
        return true;
    },
};

// 덱에서 고르는 창 하나. 카드를 쓸 때마다 새로 만든다.
class LeonikPicker {
    private readonly popupFrame = {
        ...createDefaultYourTombPopupFrame(),
        topRatio:      0.10,
        bottomRatio:   0.90,
        cardGapYRatio: 1.0,
    };
    private readonly popupRenderer = new CardGridPopupRenderer();
    private readonly parts = new LeonikPopupPartsRenderer();
    private readonly palette = createAllyTargetingNeonBorderFrame();
    private readonly borderThickness = this.palette.lineThickness;

    // 카드에 적힌 것 — 몇 장을 고르나, 어느 등급까지 고를 수 있나.
    private readonly maxPick = findCardAbility(CARD_ID)!.numbers.maxPick;
    private readonly maxGrade = findCardAbility(CARD_ID)!.grade!;

    private group: THREE.Group | null = null;
    private page = 0;
    // 덱에서 고를 수 있는 카드가 덱의 몇 번째인지. 이 목록의 자리 번호로 고른 것을 센다.
    private eligible: number[] = [];
    private readonly selected = new Set<number>();
    private readonly borders = new Map<number, SelectionBorder>();
    private readonly pulsing = new Set<THREE.ShaderMaterial>();
    private confirmMaterial: THREE.MeshBasicMaterial | null = null;
    private pulseRunning = false;

    constructor(
        private readonly ctx: CardPresentationContext,
        private readonly source: HandEntry,
    ) {}

    public async open(): Promise<void> {
        this.eligible = this.collectEligible();

        if (this.eligible.length === 0) {
            console.log('[leonik] no eligible deck cards (hero-or-below UNIT) — effect no-ops');
            // 고를 것이 없어도 카드는 쓴 것이 된다. 무덤에 넣고 섞는 것은 전투가 한다.
            this.ctx.send({
                type: 'useCardOnField',
                battleCardId: this.source.cardIndex,
                side: 'your',
                pickedDeckIndexes: [],
                shuffleSeed: this.ctx.makeShuffleSeed(),
            });
            this.ctx.hand.removeCard(this.source);
            this.ctx.hand.reflow();
            return;
        }

        this.group = await this.buildCurrentPage();
        this.ctx.scene.add(this.group);
        this.refreshBordersForPage();
        this.startPulse();

        // 창이 열려 있는 동안 누른 것은 전부 이 창으로 온다.
        this.ctx.picking.begin({
            kind: 'ownSurface',
            onClickAt: (worldX, worldY) => this.handleClick(worldX, worldY),
            onCancel: () => {
                // 고르다 턴이 넘어갔다. 창만 닫는다 — 카드는 손패에 남는다.
                this.close();
                this.ctx.picking.end();
            },
            onViewportChanged: () => void this.reload(),
        });
    }

    // 덱에서 고를 수 있는 것을 찾는다. 유닛이면서 정해진 등급 이하인 것만.
    private collectEligible(): number[] {
        const out: number[] = [];
        const deck = this.ctx.view.yourDeckCards();
        for (let i = 0; i < deck.length; i++) {
            const kind = this.ctx.catalog.getKind(deck[i]);
            const grade = this.ctx.catalog.getGrade(deck[i]);
            if (kind === null || grade === null) continue;
            if (kind === CardKind.UNIT && grade <= this.maxGrade) out.push(i);
        }
        return out;
    }

    private get cardsPerPage(): number {
        return this.popupFrame.cardColumns * this.popupFrame.rowsPerPage;
    }

    private totalPages(): number {
        return Math.max(1, Math.ceil(this.eligible.length / this.cardsPerPage));
    }

    private async buildCurrentPage(): Promise<THREE.Group> {
        const start = this.page * this.cardsPerPage;
        const pageDeckIndices = this.eligible.slice(start, start + this.cardsPerPage);
        const deck = this.ctx.view.yourDeckCards();
        const group = await this.popupRenderer.build(
            this.popupFrame,
            this.ctx.resolveCards(pageDeckIndices.map((di) => deck[di]), 'leonik'),
        );

        // 확인 단추는 창 한가운데, 쪽 넘기기 단추 사이에 놓인다.
        //
        // 재료를 들고 있는 이유는, 고른 개수가 바뀔 때 창을 다시 그리지 않고 밝기만
        // 바꾸기 위해서다. 다시 그리면 한 박자 깜빡인다.
        const bounds = computeCardGridPopupBounds(
            this.popupFrame, window.innerWidth, window.innerHeight,
        );
        const buttonWidth = bounds.width * 0.12;
        const {mesh, material} = this.parts.buildConfirmButton(
            buttonWidth, buttonWidth * 0.5, bounds.centerX, bounds.centerY,
            this.popupFrame.renderOrder + 12,
            this.selected.size === this.maxPick,
        );
        group.add(mesh);
        this.confirmMaterial = material;
        return group;
    }

    // 창 안에서 카드 한 장이 놓이는 자리.
    private cardPosition(absIndex: number): {cx: number; cy: number; cw: number; ch: number} | null {
        const start = this.page * this.cardsPerPage;
        if (absIndex < start || absIndex >= start + this.cardsPerPage) return null;

        const handFrame = createDefaultHandCardFrame();
        const bounds = computeCardGridPopupBounds(
            this.popupFrame, window.innerWidth, window.innerHeight,
        );
        const cw = window.innerWidth * handFrame.cardWidthRatio;
        const ch = cw * handFrame.cardAspect;
        const stepX = cw * (1 + this.popupFrame.cardGapXRatio);
        const stepY = ch * (1 + this.popupFrame.cardGapYRatio);
        const cols = Math.max(1, this.popupFrame.cardColumns);
        const rows = Math.max(1, this.popupFrame.rowsPerPage);
        const originX = bounds.centerX - ((cols - 1) * stepX) / 2;
        const originY = bounds.centerY + ((rows - 1) * stepY) / 2;

        const i = absIndex - start;
        return {
            cx: originX + (i % cols) * stepX,
            cy: originY - Math.floor(i / cols) * stepY,
            cw, ch,
        };
    }

    // 이 자리에 있는 카드가 덱 목록의 몇 번째인가. 없으면 -1.
    private hitCard(worldX: number, worldY: number): number {
        const start = this.page * this.cardsPerPage;
        const pageLength = Math.min(this.cardsPerPage, this.eligible.length - start);
        for (let i = 0; i < pageLength; i++) {
            const pos = this.cardPosition(start + i);
            if (!pos) continue;
            if (
                worldX >= pos.cx - pos.cw / 2 && worldX <= pos.cx + pos.cw / 2 &&
                worldY >= pos.cy - pos.ch / 2 && worldY <= pos.cy + pos.ch / 2
            ) {
                return start + i;
            }
        }
        return -1;
    }

    private addBorder(absIndex: number): void {
        if (!this.group || this.borders.has(absIndex)) return;
        const pos = this.cardPosition(absIndex);
        if (!pos) return;
        const {mesh, material} = this.parts.buildBorder(
            this.palette, this.borderThickness,
            pos.cw, pos.ch, pos.cx, pos.cy,
            this.popupFrame.renderOrder + 5,
        );
        this.group.add(mesh);
        this.borders.set(absIndex, {mesh, material});
        this.pulsing.add(material);
    }

    private removeBorder(absIndex: number): void {
        const held = this.borders.get(absIndex);
        if (!held) return;
        this.group?.remove(held.mesh);
        held.mesh.geometry.dispose();
        held.material.dispose();
        this.pulsing.delete(held.material);
        this.borders.delete(absIndex);
    }

    // 쪽을 넘기면 카드 자리가 달라지므로 테두리를 다시 놓는다.
    private refreshBordersForPage(): void {
        for (const absIndex of [...this.borders.keys()]) this.removeBorder(absIndex);
        this.borders.clear();
        this.selected.forEach((absIndex) => this.addBorder(absIndex));
    }

    private updateConfirmState(): void {
        if (!this.confirmMaterial) return;
        this.confirmMaterial.opacity = this.selected.size === this.maxPick ? 1.0 : 0.45;
    }

    private startPulse(): void {
        if (this.pulseRunning) return;
        this.pulseRunning = true;
        const step = () => {
            if (!this.pulseRunning) return;
            this.pulsing.forEach((material) => {
                material.uniforms.time.value += PULSE_STEP;
            });
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    private handleClick(worldX: number, worldY: number): void {
        if (!this.group) return;

        // 쪽 넘기기와 확인 단추. 눌린 것을 찾는 일은 창구가 해 준다.
        const button = this.ctx.picking.hitButtonIn(this.group);
        if (button === 'prev') {
            if (this.page > 0) { this.page -= 1; void this.reload(); }
            return;
        }
        if (button === 'next') {
            if (this.page < this.totalPages() - 1) { this.page += 1; void this.reload(); }
            return;
        }
        if (button === 'confirm') {
            void this.confirm();
            return;
        }

        // 카드를 눌렀다. 이미 고른 것을 누르면 고르기를 무른다. 다 골랐는데 새 것을
        // 누르면 아무 일도 안 한다 — 하나를 물러야 한다.
        const absIndex = this.hitCard(worldX, worldY);
        if (absIndex >= 0) {
            if (this.selected.has(absIndex)) {
                this.selected.delete(absIndex);
                this.removeBorder(absIndex);
            } else if (this.selected.size < this.maxPick) {
                this.selected.add(absIndex);
                this.addBorder(absIndex);
            }
            this.updateConfirmState();
            return;
        }
        // 창 밖을 눌렀다. 그냥 먹는다 — 창이 열려 있는 동안 뒤의 것이 눌리면 안 된다.
    }

    private async reload(): Promise<void> {
        if (!this.group) return;
        for (const absIndex of [...this.borders.keys()]) this.removeBorder(absIndex);
        this.borders.clear();

        this.ctx.scene.remove(this.group);
        this.popupRenderer.dispose(this.group);
        this.group = await this.buildCurrentPage();
        this.ctx.scene.add(this.group);
        this.refreshBordersForPage();
    }

    private close(): void {
        if (!this.group) return;
        // 테두리 재료는 창을 지우는 것과 별개로 놓아주어야 한다. 밝기를 올리는 목록에서도 뺀다.
        for (const absIndex of [...this.borders.keys()]) this.removeBorder(absIndex);
        this.borders.clear();
        this.pulsing.clear();
        this.pulseRunning = false;

        this.ctx.scene.remove(this.group);
        this.popupRenderer.dispose(this.group);
        this.group = null;
        this.confirmMaterial = null;
    }

    private async confirm(): Promise<void> {
        if (this.selected.size !== this.maxPick) return;

        // 무엇을 골랐는지만 보낸다. 덱에서 빼고 손패에 넣고 섞는 것은 전투가 한다.
        const pickedDeckIndexes = [...this.selected].map((i) => this.eligible[i]);
        const events = this.ctx.send({
            type: 'useCardOnField',
            battleCardId: this.source.cardIndex,
            side: 'your',
            pickedDeckIndexes,
            shuffleSeed: this.ctx.makeShuffleSeed(),
        });
        const pulled = events
            .filter((ev) => ev.type === 'cardMoved' && ev.from === 'yourDeck' && ev.to === 'hand')
            .map((ev) => ev as {cardId: number; battleCardId: number});

        // 연출보다 먼저 창을 닫는다. 문이 화면 한가운데 서는데 창이 덮고 있으면 안 보인다.
        this.close();
        this.ctx.picking.end();

        const hand = this.ctx.hand.worldCenter();
        const destinations = pulled.map((_it, i) => new THREE.Vector3(
            // 조금씩 벌려 둔다. 두 장이 같은 자리에 도착하면 한 장처럼 보인다.
            hand.x + (i - (pulled.length - 1) / 2) * 80,
            hand.y,
            5,
        ));

        const effect = this.ctx.createEffect((scene) => new LeonikSummonEffect(scene));
        await this.ctx.whileRunning(effect, () => effect.play(
            new THREE.Vector3(0, 0, 5),
            destinations,
            this.ctx.canvasElement,
            // 한 장이 닿을 때마다 그 카드를 손패에 붙인다. 전투가 매긴 번호를 그대로 쓴다.
            (index: number) => {
                const card = pulled[index];
                if (card) this.ctx.hand.appendCard(card.cardId, card.battleCardId);
            },
        ));

        // 무덤에 넣고 섞는 것은 전투가 이미 했다. 화면에서 치우기만 한다.
        this.ctx.hand.removeCard(this.source);
        this.ctx.hand.reflow();
        console.log(`[leonik] pulled ${pulled.map((it) => it.cardId).join(',')} from deck → hand; leonik → tomb; deck shuffled; remaining=${this.ctx.view.yourDeckRemainingCount()}`);
    }
}
