import * as THREE from "three";
import {CardFace} from "../../hand/entity/CardFace";
import {CardGridPopupFrame} from "../../card_grid_popup/frame/CardGridPopupFrame";
import {CardGridPopupRenderer} from "../../card_grid_popup/renderer/CardGridPopupRenderer";
import {PagedCardPopup, ExclusivePopups} from "../../card_grid_popup/PagedCardPopup";
import {ViewportResize} from "../../../../core/resize/ViewportResize";

// 무덤과 로스트 존 넷을 다루는 곳이다.
//
// 넷이 같은 모양이다 — 누를 수 있는 판 하나와, 눌렀을 때 열리는 창 하나. 다른 것은
// 판이 어떻게 생겼는지와, 창이 어느 목록을 보여 주는지 둘뿐이다.
//
// 넷을 하나로 합친 것이 아니다. 판 렌더러 넷과 목록 넷은 그대로 넷이다. 카드가 늘면 그
// 목록이 갈라진다 — 시체 폭발은 아군을 내 무덤으로, 해골 군주 레오닉은 상대 손패를 상대
// 로스트 존으로 보낸다. 여기서 함께 쓰는 것은 [판을 세우고, 눌리면 창을 열고 닫는다] 는
// 일뿐이다.

// 이 구역을 그리는 데 필요한 것. 구역마다 다른 것을 여기에 담는다.
export interface ZoneSpec {
    // 로그와 안내에 쓰는 이름.
    readonly name: string;
    // 판을 눌렀을 때 띄우는 안내 문구. 아이콘만으로는 넷을 가리기 어렵다.
    readonly guideMessage: string;
    // 판을 그리는 것. 무덤은 비석 모양, 로스트 존은 네모라 렌더러가 다르다.
    readonly panel: ZonePanelRenderer;
    // 창이 보여 줄 카드 목록. 이것이 넷을 가른다.
    readonly cards: () => readonly number[];
    readonly popupFrame: CardGridPopupFrame;
    // 카드를 못 찾았을 때 로그에 적는 이름.
    readonly label: string;
}

// 판 하나를 그리고, 어떤 자리가 그 판 안인지 안다.
//
// 판 모양이 구역마다 달라 여기를 채우는 것도 다르다. 무덤은 비석이라 네모 판정으로는
// 모서리 바깥이 눌린다.
export interface ZonePanelRenderer {
    build(): Promise<THREE.Group>;
    resize(group: THREE.Group, viewportWidth: number, viewportHeight: number): void;
    contains(
        worldX: number, worldY: number, viewportWidth: number, viewportHeight: number,
    ): boolean;
}

// 구역 하나 — 판과 창.
class Zone {
    constructor(
        public readonly spec: ZoneSpec,
        public readonly panelGroup: THREE.Group,
        public readonly popup: PagedCardPopup,
    ) {}
}

export class ZonePanels {
    private readonly zones: Zone[] = [];
    private readonly popups = new ExclusivePopups();

    private constructor(
        private readonly showGuide: (message: string) => void,
    ) {}

    // 구역 넷을 세운다. 판을 그려 화면에 올리고, 창을 만들고, 창 크기 조절에 등록한다.
    public static async build(
        scene: THREE.Scene,
        specs: readonly ZoneSpec[],
        onResize: ViewportResize,
        resolveCards: (cardIds: number[], label: string) => CardFace[],
        showGuide: (message: string) => void,
    ): Promise<ZonePanels> {
        const panels = new ZonePanels(showGuide);
        for (const spec of specs) {
            const group = await spec.panel.build();
            scene.add(group);
            // 판 모양이 창 너비와 높이에서 나오고 누르는 자리는 그때그때 다시 재므로,
            // 안 다시 그리면 그림과 누르는 자리가 어긋난다.
            onResize.add('layout', (w, h) => spec.panel.resize(group, w, h));

            const popup = panels.popups.register(new PagedCardPopup(
                scene, new CardGridPopupRenderer(),
                {frame: spec.popupFrame, cards: spec.cards, label: spec.label},
                resolveCards,
            ));
            panels.zones.push(new Zone(spec, group, popup));
        }
        return panels;
    }

    // 창이 하나라도 열려 있는가. 열려 있으면 뒤의 것을 누를 수 없다.
    public anyOpen(): boolean {
        return this.popups.anyOpen();
    }

    // 누름을 받는다. 처리했으면 true — 그 누름은 여기서 끝난다.
    //
    // 판을 누르면 그 창을 열거나 닫는다. 창이 열려 있으면 그 창이 받는다. 둘 다 아니면
    // 처리하지 않았다고 알린다.
    public handleClick(
        raycaster: THREE.Raycaster, worldX: number, worldY: number,
        viewportWidth: number, viewportHeight: number,
    ): boolean {
        for (const zone of this.zones) {
            if (!zone.spec.panel.contains(worldX, worldY, viewportWidth, viewportHeight)) {
                continue;
            }
            if (zone.popup.isOpen()) {
                zone.popup.close();
            } else {
                // 여는 순간에만 어느 구역인지 알린다. 닫을 때는 안 알린다 — 사라지는 창의
                // 이름을 알리는 것은 잡음이다.
                this.showGuide(zone.spec.guideMessage);
                void this.popups.openOnly(zone.popup);
            }
            return true;
        }
        return this.popups.handleClick(raycaster, worldX, worldY, viewportWidth, viewportHeight);
    }

    // 창 크기가 바뀌었다. 열려 있는 창을 새 크기로 다시 그린다.
    public async rebuildOpenPopups(): Promise<void> {
        for (const zone of this.zones) await zone.popup.reload();
    }
}
