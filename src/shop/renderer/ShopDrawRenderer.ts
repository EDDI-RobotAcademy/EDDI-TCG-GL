import * as THREE from "three";

import {disposeGroup} from "../../core/lifecycle/DisposableMeshStore";
import {ShopMenuType} from "../entity/ShopMenuType";
import {
    ShopDrawConfirmFrame, confirmBoardImage, YES_IMAGE, NO_IMAGE,
} from "../frame/ShopDrawConfirmFrame";
import {ShopDrawResultFrame, resultCardWidth} from "../frame/ShopDrawResultFrame";

// 뽑기 확인 화면에서 누른 것.
export type ConfirmPick = 'yes' | 'no';

// 뽑기 화면 둘을 그린다. **THREE 물건을 만드는 것은 여기뿐이다.**
//
// 확인 화면과 결과 화면을 한 렌더러가 든다. 둘이 같은 방식으로 뜨고 사라지고 — 화면 전체를
// 덮는 판 위에 얹히고, 누르면 없어진다. 따로 두면 그 [덮고 얹고 없애기] 를 두 벌 쓴다.
export class ShopDrawRenderer {
    // ── 확인 화면 ───────────────────────────────────────────────────────────────

    public async buildConfirm(
        frame: ShopDrawConfirmFrame, type: ShopMenuType,
    ): Promise<THREE.Group | null> {
        const boardImage = confirmBoardImage(type);
        if (boardImage === null) return null;

        const group = new THREE.Group();
        // 뒤를 덮는다. 이것이 없으면 확인 화면 뒤의 단추가 눌린다.
        group.add(dimPlane(frame.dimOpacity, frame.dimRenderOrder));

        group.add(await imagePlane(boardImage, {
            widthRatio: frame.boardWidthRatio,
            heightRatio: frame.boardHeightRatio,
            xRatio: frame.boardXRatio,
            yRatio: frame.boardYRatio,
            renderOrder: frame.renderOrder,
        }));

        group.add(await imagePlane(YES_IMAGE, {
            widthRatio: frame.buttonWidthRatio,
            heightRatio: frame.buttonHeightRatio,
            xRatio: frame.yesXRatio,
            yRatio: frame.buttonYRatio,
            renderOrder: frame.renderOrder,
            pick: 'yes',
        }));
        group.add(await imagePlane(NO_IMAGE, {
            widthRatio: frame.buttonWidthRatio,
            heightRatio: frame.buttonHeightRatio,
            xRatio: frame.noXRatio,
            yRatio: frame.buttonYRatio,
            renderOrder: frame.renderOrder,
            pick: 'no',
        }));

        this.resizeConfirm(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resizeConfirm(
        frame: ShopDrawConfirmFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        applyPlanes(group, viewportWidth, viewportHeight);
    }

    // 눌린 자리에 예/아니오 단추가 있나. 없으면 null — 그 누름은 그냥 먹는다.
    public hitConfirm(raycaster: THREE.Raycaster, group: THREE.Group): ConfirmPick | null {
        for (const hit of raycaster.intersectObjects(group.children, false)) {
            const pick = (hit.object.userData as {pick?: ConfirmPick}).pick;
            if (pick) return pick;
        }
        return null;
    }

    // ── 결과 화면 ───────────────────────────────────────────────────────────────

    public async buildResult(
        frame: ShopDrawResultFrame, cardIds: readonly number[],
    ): Promise<THREE.Group> {
        const group = new THREE.Group();
        group.add(dimPlane(frame.dimOpacity, frame.dimRenderOrder));

        group.add(await imagePlane(frame.backgroundImage, {
            widthRatio: 1, heightRatio: 1, xRatio: 0, yRatio: 0,
            renderOrder: frame.renderOrder,
        }));

        // 열 장을 두 줄로 다섯씩.
        //
        // **자리와 크기를 여기서 굳히지 않는다.** 카드 높이와 줄 간격이 카드 **폭** 에서
        // 나오는데, 폭은 창 너비에서 나온다. 창 모양이 바뀌면 그 값도 바뀌므로, 어느 칸
        // 몇째 줄인지만 적어 두고 실제 자리는 다시 잴 때마다 낸다.
        const rows = Math.ceil(cardIds.length / frame.columns);
        for (let i = 0; i < cardIds.length; i++) {
            const row = Math.floor(i / frame.columns);
            const column = i % frame.columns;

            // 그림 한 장을 못 읽어도 나머지는 보여 준다.
            //
            // 전에는 한 장이 실패하면 결과 화면이 통째로 안 떴다. 그러면 사용자에게는
            // [예를 눌렀는데 아무 일도 안 난다] 로 보이고, 무엇이 잘못됐는지 알 길이
            // 없다. 실제로 카드 번호를 잘못 넘겨 그렇게 됐다.
            const card = await imagePlaneOrNull(frame.cardImage(cardIds[i]), {
                widthRatio: 0, heightRatio: 0, xRatio: 0, yRatio: 0,
                renderOrder: frame.renderOrder + 1,
                grid: {
                    row, column, rows,
                    // 이 줄에 몇 장 있나. 마지막 줄이 덜 찼을 때도 가운데에 모이게 한다.
                    inRow: Math.min(frame.columns, cardIds.length - row * frame.columns),
                },
            });
            if (card) group.add(card);
        }

        this.resizeResult(frame, group, window.innerWidth, window.innerHeight);
        return group;
    }

    public resizeResult(
        frame: ShopDrawResultFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        applyPlanes(group, viewportWidth, viewportHeight);
        applyCardGrid(frame, group, viewportWidth, viewportHeight);
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
    }
}

// 판 하나가 창 크기에 대해 어떻게 놓이는가. 다시 잴 때 이 값을 읽는다.
interface PlaneUserData {
    // 창 **너비** 에 대한 비율.
    widthRatio: number;
    // 창 **높이** 에 대한 비율. 카드처럼 폭에서 높이가 나오는 것은 이 값을 안 쓴다 —
    // 아래 grid 가 있으면 그쪽이 자리와 크기를 다 낸다.
    heightRatio: number;
    // x 는 창 너비에, y 는 창 높이에 대한 비율.
    xRatio: number;
    yRatio: number;
    baseWidth: number;
    baseHeight: number;
    pick?: ConfirmPick;
    grid?: GridCell;
}

// 카드 판에서 이 카드가 몇째 줄 몇째 칸인가.
interface GridCell {
    readonly row: number;
    readonly column: number;
    readonly rows: number;
    readonly inRow: number;
}

// 화면 전체를 덮어 뒤를 못 누르게 하는 판.
//
// 창 크기보다 넉넉하게 만든다. 창이 커지면 덮는 판도 커져야 하는데, 배율로 늘리면 가장자리
// 한 줄이 비는 일이 있다.
function dimPlane(opacity: number, renderOrder: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity}),
    );
    mesh.renderOrder = renderOrder;
    const userData: PlaneUserData = {
        widthRatio: 1.2, heightRatio: 1.2, xRatio: 0, yRatio: 0,
        baseWidth: 1, baseHeight: 1,
    };
    mesh.userData = userData;
    return mesh;
}

async function imagePlane(
    imageSrc: string,
    spec: {
        widthRatio: number; heightRatio: number;
        xRatio: number; yRatio: number; renderOrder: number;
        pick?: ConfirmPick;
        grid?: GridCell;
    },
): Promise<THREE.Mesh> {
    const texture = await loadCrisp(imageSrc);
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({map: texture, transparent: true}),
    );
    mesh.renderOrder = spec.renderOrder;
    const userData: PlaneUserData = {
        widthRatio: spec.widthRatio, heightRatio: spec.heightRatio,
        xRatio: spec.xRatio, yRatio: spec.yRatio,
        baseWidth: 1, baseHeight: 1,
        pick: spec.pick,
        grid: spec.grid,
    };
    mesh.userData = userData;
    return mesh;
}

// 카드 판을 지금 창 크기에 맞춘다.
//
// 카드 폭은 창 **너비** 에서 나오고, 높이와 줄 간격은 그 폭에서 나온다. 그래서 세로 값을
// 창 높이에 대한 비율로 굳혀 둘 수 없다 — 창 모양이 바뀌면 달라진다. 다시 잴 때마다 낸다.
function applyCardGrid(
    frame: ShopDrawResultFrame, group: THREE.Group,
    viewportWidth: number, viewportHeight: number,
): void {
    // 몇 줄인지는 어느 카드든 같은 값을 들고 있다.
    const rows = firstGridRows(group);
    if (rows === null) return;

    const cardWidth = resultCardWidth(frame, rows, viewportWidth, viewportHeight);
    const cardHeight = cardWidth * frame.cardAspect;
    const stepX = cardWidth * (1 + frame.columnGapRatio);
    const stepY = cardHeight * (1 + frame.rowGapRatio);

    for (const child of group.children) {
        if (!(child instanceof THREE.Mesh)) continue;
        const cell = (child.userData as PlaneUserData).grid;
        if (!cell) continue;

        child.scale.set(cardWidth, cardHeight, 1);
        child.position.set(
            (cell.column - (cell.inRow - 1) / 2) * stepX,
            frame.centerYRatio * viewportHeight
                - (cell.row - (cell.rows - 1) / 2) * stepY,
            0,
        );
    }
}

// 담긴 판 전부를 지금 창 크기에 맞춘다.
function applyPlanes(
    group: THREE.Group, viewportWidth: number, viewportHeight: number,
): void {
    for (const child of group.children) {
        if (!(child instanceof THREE.Mesh)) continue;
        const it = child.userData as PlaneUserData;
        // 카드 판은 따로 낸다.
        if (it.grid) continue;
        child.scale.set(
            (it.widthRatio * viewportWidth) / it.baseWidth,
            (it.heightRatio * viewportHeight) / it.baseHeight,
            1,
        );
        child.position.set(it.xRatio * viewportWidth, it.yRatio * viewportHeight, 0);
    }
}

// 이 프로젝트의 선명한 기준값. 전투·로비 렌더러와 같다.
function loadCrisp(imageSrc: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(
            imageSrc,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                resolve(texture);
            },
            undefined,
            (error) => reject(error),
        );
    });
}

// 그림을 못 읽으면 null 을 준다. 무엇을 못 읽었는지 적는다.
async function imagePlaneOrNull(
    imageSrc: string,
    spec: {
        widthRatio: number; heightRatio: number;
        xRatio: number; yRatio: number; renderOrder: number;
        grid?: GridCell;
    },
): Promise<THREE.Mesh | null> {
    try {
        return await imagePlane(imageSrc, spec);
    } catch {
        console.error(`[shop] 카드 그림을 못 읽었다: ${imageSrc}`);
        return null;
    }
}

// 카드 판이 몇 줄인가. 담긴 카드 하나에서 읽는다.
function firstGridRows(group: THREE.Group): number | null {
    for (const child of group.children) {
        const cell = (child.userData as PlaneUserData).grid;
        if (cell) return cell.rows;
    }
    return null;
}
