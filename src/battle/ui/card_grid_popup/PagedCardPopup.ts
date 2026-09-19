import * as THREE from "three";
import {CardFace} from "../hand/entity/CardFace";
import {CardGridPopupFrame} from "./frame/CardGridPopupFrame";
import {CardGridPopupRenderer} from "./renderer/CardGridPopupRenderer";
import {computeCardGridPopupBounds} from "./frame/CardGridPopupFrame";

// 카드를 격자로 펼쳐 보여 주는 창 하나다. 쪽이 여럿이면 넘길 수 있다.
//
// 무덤 둘과 로스트 존 둘이 이것을 쓴다. 넷의 다른 점은 셋뿐이다 — 어느 프레임을 쓰는가,
// 어느 카드 목록을 보여 주는가, 로그에 무슨 이름으로 적는가. 그리는 렌더러는 전에도
// 넷이 함께 썼다.
//
// 넷을 하나로 합친 것이 아니다. 넷은 여전히 넷이고, **어느 목록을 보여 주는가** 를 각자
// 들고 있다. 카드가 늘면 그 목록이 갈라진다 — 시체 폭발은 아군을 내 무덤으로 보내고,
// 해골 군주 레오닉은 상대 손패를 상대 로스트 존으로 보낸다. 그 차이는 목록에 남아 있다.
// 여기서 함께 쓰는 것은 [열고 닫고 쪽을 넘긴다] 는 일뿐이다.
export interface PagedCardPopupSpec {
    readonly frame: CardGridPopupFrame;
    // 이 창이 보여 줄 카드 목록. 부를 때마다 지금 것을 받는다.
    readonly cards: () => readonly number[];
    // 카드를 못 찾았을 때 로그에 적는 이름.
    readonly label: string;
}

export class PagedCardPopup {
    private group: THREE.Group | null = null;
    private page = 0;

    constructor(
        private readonly scene: THREE.Scene,
        private readonly renderer: CardGridPopupRenderer,
        private readonly spec: PagedCardPopupSpec,
        // 카드 번호를 그릴 수 있는 것으로 바꾼다. 화면 밖의 카드 자료를 읽는 일이다.
        private readonly resolve: (cardIds: number[], label: string) => CardFace[],
    ) {}

    public isOpen(): boolean {
        return this.group !== null;
    }

    public async open(): Promise<void> {
        if (this.group) return;
        this.group = await this.buildCurrentPage();
        this.scene.add(this.group);
    }

    public close(): void {
        if (!this.group) return;
        this.scene.remove(this.group);
        this.renderer.dispose(this.group);
        this.group = null;
        // 닫으면 첫 쪽으로 돌아간다. 다시 열었을 때 전에 보던 쪽이 남아 있으면
        // 그 사이에 카드가 빠져 빈 쪽이 보일 수 있다.
        this.page = 0;
    }

    // 열려 있는 채로 내용만 다시 그린다. 카드가 늘거나 줄었을 때, 쪽을 넘겼을 때 부른다.
    public async reload(): Promise<void> {
        if (!this.group) return;
        this.scene.remove(this.group);
        this.renderer.dispose(this.group);
        this.group = await this.buildCurrentPage();
        this.scene.add(this.group);
    }

    // 눌린 자리를 찾을 때 이 창 안의 것들만 본다. 닫혀 있으면 빈 목록이다.
    public objects(): THREE.Object3D[] {
        return this.group ? this.group.children : [];
    }

    public totalPages(): number {
        return Math.max(1, Math.ceil(this.spec.cards().length / this.cardsPerPage()));
    }

    public currentPage(): number {
        return this.page;
    }

    public async goToPreviousPage(): Promise<void> {
        if (this.page <= 0) return;
        this.page -= 1;
        await this.reload();
    }

    public async goToNextPage(): Promise<void> {
        if (this.page >= this.totalPages() - 1) return;
        this.page += 1;
        await this.reload();
    }

    // 열려 있을 때 누른 것을 스스로 처리한다. 처리했으면 true 다.
    //
    // 쪽 넘기기 단추면 넘기고, 창 밖을 눌렀으면 닫는다. 창 안을 눌렀으면 아무것도 안 하고
    // 그 누름을 먹는다 — 창 뒤의 카드가 집히면 안 된다.
    //
    // 전에는 이 스물여덟 줄이 창마다 한 벌씩 네 벌 있었다.
    public handleClick(
        raycaster: THREE.Raycaster, worldX: number, worldY: number,
        viewportWidth: number, viewportHeight: number,
    ): boolean {
        if (!this.group) return false;

        const hits = raycaster.intersectObjects(this.objects(), true);
        for (const hit of hits) {
            const buttonType = hit.object.userData.buttonType;
            if (buttonType === 'prev') {
                void this.goToPreviousPage();
                return true;
            }
            if (buttonType === 'next') {
                void this.goToNextPage();
                return true;
            }
        }

        const bounds = computeCardGridPopupBounds(this.spec.frame, viewportWidth, viewportHeight);
        const insidePopup =
            worldX >= bounds.minX && worldX <= bounds.maxX &&
            worldY >= bounds.minY && worldY <= bounds.maxY;
        if (!insidePopup) this.close();
        return true;
    }

    private cardsPerPage(): number {
        return this.spec.frame.cardColumns * this.spec.frame.rowsPerPage;
    }

    private async buildCurrentPage(): Promise<THREE.Group> {
        const all = [...this.spec.cards()];
        const perPage = this.cardsPerPage();
        const start = this.page * perPage;
        const resolved = this.resolve(all.slice(start, start + perPage), this.spec.label);
        return this.renderer.build(this.spec.frame, resolved);
    }
}

// 한 번에 하나만 열리는 창들이다.
//
// 전에는 창 하나를 열 때 나머지 셋을 하나씩 닫았다. 넷이 서로를 알아야 해서 부르는 자리가
// 열두 군데였고, 창이 하나 늘면 그만큼 더 늘었다.
export class ExclusivePopups {
    private readonly popups: PagedCardPopup[] = [];

    public register(popup: PagedCardPopup): PagedCardPopup {
        this.popups.push(popup);
        return popup;
    }

    // 하나를 열고 나머지를 닫는다.
    public async openOnly(popup: PagedCardPopup): Promise<void> {
        if (popup.isOpen()) return;
        this.closeAll();
        await popup.open();
    }

    public closeAll(): void {
        for (const it of this.popups) it.close();
    }

    public anyOpen(): boolean {
        return this.popups.some((it) => it.isOpen());
    }

    // 열려 있는 창이 누름을 처리한다. 한 번에 하나만 열리므로 많아도 하나가 받는다.
    public handleClick(
        raycaster: THREE.Raycaster, worldX: number, worldY: number,
        viewportWidth: number, viewportHeight: number,
    ): boolean {
        for (const it of this.popups) {
            if (it.handleClick(raycaster, worldX, worldY, viewportWidth, viewportHeight)) {
                return true;
            }
        }
        return false;
    }
}
