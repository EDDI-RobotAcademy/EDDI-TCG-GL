import * as THREE from "three";
import {HandEntry} from "../hand/renderer/BattleFieldHandRendererV2";
import {CardFace} from "../hand/entity/CardFace";
import {BattleCommand} from "../../domain/flow/BattleCommand";
import {BattleEvent} from "../../domain/flow/BattleEvent";
import {BattleReadModel} from "../../domain/read/BattleReadModel";
import {CardCatalog} from "../../domain/ability/CardCatalog";
import {HandCardFrame} from "../hand/frame/HandCardFrame";

// 카드 한 장을 화면에서 어떻게 쓰고 어떻게 보여 주는가. 카드마다 파일 하나다.
//
// 규칙 쪽의 짝이다. 규칙은 카드 한 장이 판을 어떻게 바꾸는지 알고, 여기는 그 결과를 어떻게
// 보여 주는지 안다. 새 카드를 만들면 규칙 파일 하나와 이 파일 하나를 놓고 명부에 한 줄씩
// 더한다. 그 밖의 파일은 안 고친다.

// 상대 필드에 선 유닛 하나를 화면이 볼 때의 것.
export interface OpponentEntry {
    readonly card: CardFace;
    readonly cardIndex: number;
    readonly group: THREE.Group;
}

// 이 카드를 어디에 떨어뜨려야 쓸 수 있나.
//
// 떨어뜨린 자리를 찾는 일은 화면만 할 수 있다. 어디에 떨어져야 하는지는 카드가 정하고,
// 그 자리에 무엇이 있는지 찾는 일은 화면이 한다.
export type CardDropTarget =
    | 'opponentUnit'        // 상대 유닛 위
    | 'allyUnit'            // 내 필드의 아군 유닛 위
    | 'opponentFieldArea'   // 상대 필드 영역 안. 유닛을 안 가린다
    | 'yourFieldArea';      // 내 필드 영역 안

// 떨어뜨린 자리에서 찾은 것.
export type DropHit =
    | {readonly kind: 'opponentUnit'; readonly entry: OpponentEntry}
    | {readonly kind: 'allyUnit'; readonly entry: HandEntry}
    | {readonly kind: 'area'};

// 떨어뜨린 카드.
export interface DroppedCard {
    // 화면 카드의 번호. 전투에 보낼 때 이 번호로 가리킨다.
    readonly battleCardId: number;
    readonly cardId: number;
    // 손패에서 몇 번째였나. 화면에서 치울 때 쓴다.
    readonly handIndex: number;
    readonly entry: HandEntry;
}

// 손패를 다루는 것.
export interface HandPresentation {
    readonly cardFrame: HandCardFrame;
    // 이 카드를 화면에서 치운다. 무덤에 넣는 것은 전투가 이미 했다.
    removeCard(entry: HandEntry, handIndex: number): void;
    // 손패와 필드에 놓인 것을 다시 줄 세운다.
    reflow(): void;
    // 카드 한 장을 손패에 붙인다. 뽑는 것은 전투가 이미 했고 번호도 전투가 매겼다.
    appendCard(cardId: number, battleCardId: number): void;
    // 손패가 놓이는 자리의 중심. 뽑히는 카드가 거기로 날아간다.
    worldCenter(): {x: number; y: number};
}

// 내 필드 영역이 화면에서 차지하는 자리.
export interface AreaBoundsView {
    readonly centerX: number;
    readonly centerY: number;
    readonly width: number;
    readonly height: number;
}

// 상대 필드를 다루는 것.
export interface OpponentFieldPresentation {
    // 쓰러진 것이 빠진 뒤 남은 것을 다시 줄 세운다.
    reflow(): void;
    // 맞은 표시 — 붉게 번쩍이고 흔든다.
    flashAndShake(group: THREE.Group): void;
    // 이 유닛에 붙은 에너지 개수를 화면에 다시 그린다.
    redrawEnergyCount(entry: OpponentEntry, count: number): void;
    // 쓰러진 유닛을 화면에서 감춘다. 무덤으로 보내는 것은 전투가 이미 했다.
    hideUnit(battleCardId: number): void;
    // 이 유닛이 화면에서 있는 자리. 연출이 거기로 날아간다.
    unitWorldPosition(battleCardId: number): {x: number; y: number} | null;
    // 아직 화면에 보이는가.
    isUnitVisible(battleCardId: number): boolean;
    // 이 영역이 화면에서 차지하는 자리.
    bounds(): AreaBoundsView;
}

// 내 필드를 다루는 것.
export interface YourFieldPresentation {
    // 필드에 서 있던 유닛을 화면에서 치운다. 무덤으로 보내는 것은 전투가 이미 했다.
    removeUnit(entry: HandEntry): void;
    // 줄에서만 빼고 그림은 남긴다. 그 그림이 날아가는 연출에 쓰일 때 그렇게 한다.
    dropFromLineup(entry: HandEntry): void;
    // 남겨 둔 그림을 이제 놓아준다.
    disposeUnit(entry: HandEntry): void;
    // 이 필드 영역이 화면에서 차지하는 자리. 영역 전체에 도는 연출이 쓴다.
    bounds(): AreaBoundsView;
}

// 내 필드 에너지 표기를 다루는 것.
export interface FieldEnergyPresentation {
    // 화면에서 이 표기가 있는 자리. 알갱이가 거기로 날아간다.
    worldPosition(): {x: number; y: number};
    // 표기를 고친다.
    setEnergy(count: number): void;
    // 지금 참인 값으로 맞춘다. 연출이 끝날 때 부른다 (규칙 28).
    syncToTruth(): void;
}

// 카드에 붙은 에너지 표기를 다루는 것.
export interface CardEnergyPresentation {
    // 이 카드의 에너지 개수를 그린다. 올라가는 쪽만 그려진다 (규칙 28).
    setCount(entry: HandEntry, count: number): void;
    // 차갑게 불타는 암흑 에너지를 지녔다는 두 마크를 카드에 붙인다.
    //
    // 이 에너지는 개수를 세는 데서 끝나지 않는다. 이 유닛이 때릴 때마다 맞은 쪽에 암흑
    // 화염과 빙결이 따라붙는다. 그 사실을 마크가 알리므로 따로 배너를 안 띄운다.
    attachColdDarkMarks(entry: HandEntry): void;
}

// 상대 본체를 다루는 것.
export interface OpponentMasterPresentation {
    // 체력 표기를 고친다. 내려가는 쪽만 그려진다 (규칙 28).
    setHp(hp: number): void;
    // 쓰러진 본체를 감춘다.
    hide(): void;
    // 화면에서 본체가 있는 자리. 연출이 거기로 날아간다.
    worldPosition(): {x: number; y: number};
    // 아직 화면에 보이는가. 이미 감췄는지 가릴 때 쓴다.
    isVisible(): boolean;
}

// 상대 필드 에너지 표기를 다루는 것.
export interface OpponentFieldEnergyPresentation {
    // 화면에서 이 표기가 있는 자리와 크기. 연출이 거기로 날아간다.
    bounds(): {centerX: number; centerY: number; width: number; height: number};
    // 표기를 고친다.
    setEnergy(count: number): void;
    // 표기를 떨리게 하고 손상된 모습으로 바꾼다. 죽음의 대지가 찢을 때 쓴다.
    setOffset(dx: number, dy: number): void;
    setDamageLevel(level: 0 | 1 | 2): void;
}

// 카드 연출이 쓸 수 있는 것이다.
//
// 이 목록이 [카드 연출이 할 수 있는 일] 이다. 화면을 통째로 넘기면 카드가 아무거나
// 만질 수 있게 되고, 그러면 갈림길을 파일로 흩어 놓은 것이 된다.
//
// 새 카드가 여기 없는 것을 필요로 하면 그때 늘린다. 안 늘리고 카드만 느는 것이 통과다
// (규칙 24).
// 연출을 만들 때 필요한 그리는 장비다.
//
// 연출마다 받는 것이 다르다 — 어떤 것은 장면만, 어떤 것은 그리는 기계와 카메라와 돌리는
// 고리까지 받는다. 카드 파일이 그것을 다 알아야 하면 화면의 장비를 카드가 아는 셈이 된다.
// 그래서 만드는 일을 창구에 맡기고 카드는 [무엇을] 만들지만 말한다.
export interface EffectFactory<T> {
    (scene: THREE.Scene, gear: EffectGear): T;
}

export interface EffectGear {
    readonly renderer: THREE.WebGLRenderer;
    readonly camera: THREE.Camera;
    // 그리는 방법을 잠깐 가로채는 곳. 화면을 찍어 두고 일그러뜨리는 연출이 쓴다.
    readonly animationLoop: {
        setRenderOverride: (
            fn: ((
                scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer,
            ) => void) | null,
        ) => void;
    };
}

export interface CardPresentationContext {
    readonly scene: THREE.Scene;
    // 연출 하나를 만든다. 만드는 데 필요한 장비는 창구가 안다.
    createEffect<T>(make: EffectFactory<T>): T;
    // 사용자가 한 일 하나를 보내고 무슨 일이 있었는지 받는다.
    readonly send: (command: BattleCommand) => BattleEvent[];
    // 화면에 보여 줄 것만 추린 창구.
    readonly view: BattleReadModel;
    // 카드에 적혀 있는 것.
    readonly catalog: CardCatalog;
    readonly hand: HandPresentation;
    readonly opponentField: OpponentFieldPresentation;
    readonly yourField: YourFieldPresentation;
    readonly picking: PickingPresentation;
    readonly opponentMaster: OpponentMasterPresentation;
    readonly opponentFieldEnergy: OpponentFieldEnergyPresentation;
    readonly fieldEnergy: FieldEnergyPresentation;
    readonly cardEnergy: CardEnergyPresentation;
    // 덱이 화면에서 있는 자리. 덱에서 무언가 꺼내는 연출이 거기서 출발한다.
    deckWorldPosition(): {x: number; y: number};
    // 연출이 화면 바깥 겹(DOM)을 흔들어야 할 때 쓴다.
    readonly canvasElement: HTMLElement;

    // 연출 하나를 도는 동안 창 크기에 따라가게 한다.
    //
    // 쓸 때마다 새로 만드는 연출은 도는 중에 창이 바뀌면 옛 크기로 남는다. 이것으로
    // 감싸면 도는 동안만 크기 조절 목록에 담기고 끝나면 빠진다 (R2-90).
    //
    // **연출을 돌릴 때는 이것으로 감싼다.** 안 감싸면 도는 중에 창을 바꿀 때 어긋난다.
    whileRunning(
        effect: {resize(viewportWidth: number, viewportHeight: number): void},
        run: () => Promise<void>,
    ): Promise<void>;
}

// 카드를 쓴 뒤 사용자가 대상을 눌러 고르는 동안, 사용자가 누른 것.
export type PickTarget =
    | {readonly kind: 'opponentUnit'; readonly entry: OpponentEntry}
    | {readonly kind: 'opponentMaster'};

// 카드를 쓴 뒤 사용자가 대상을 눌러 고르는 동안의 것이다.
//
// 이 동안 화면은 딴 일을 안 받는다. 손패를 집을 수 없고, 누른 것은 전부 이 고르기로 간다.
// 그래서 화면이 [지금 고르는 중인가] 를 알아야 하고, 무엇을 누를 수 있는지와 눌렀을 때
// 무슨 일이 일어나는지는 카드가 안다.
//
// 몇 개를 더 받아야 하는지는 전투가 안다 (R2-103). 카드는 전투에 보내고 남은 개수를
// 돌려받는다. 화면도 카드도 그 수를 따로 세지 않는다.
export interface CardPickSession {
    // 무엇을 누를 수 있나. 겨냥 테두리를 어디에 붙일지도 이것으로 정한다.
    readonly pickable: 'opponentUnitOrMaster';
    // 사용자가 하나 눌렀다.
    onPick(target: PickTarget): void;
    // 그만둔다 — 고르는 중에 턴이 넘어갔다. 아무 일도 안 일어난 것으로 둔다.
    onCancel(): void;
}

// 고르기를 열고 닫는 것.
export interface PickingPresentation {
    // 고르기를 시작한다. 이때부터 누른 것이 이 고르기로 간다.
    begin(session: CardPickSession): void;
    // 끝난다. 화면이 제 일로 돌아간다.
    end(): void;
    // 누를 수 있는 것에 붉은 테두리를 씌운다. 무엇을 고를 수 있는지 보여 준다.
    markPickable(): void;
    // 테두리를 걷는다.
    clearPickable(): void;
}

export interface CardPresentation {
    readonly cardId: number;
    // 어디에 떨어뜨려야 쓸 수 있나.
    readonly dropTarget: CardDropTarget;
    // 떨어뜨렸다. 썼으면 true, 못 썼으면 false — 못 쓰면 카드가 제자리로 돌아간다.
    onDrop(ctx: CardPresentationContext, dropped: DroppedCard, hit: DropHit): boolean;
}
