import * as THREE from "three";

import {BattleCommand} from "../../../domain/flow/BattleCommand";
import {BattleEvent} from "../../../domain/flow/BattleEvent";
import {HandEntry} from "../renderer/BattleFieldHandRendererV2";
import {HandInteractionBridge} from "../interaction/HandInteractionBridge";

// 손패의 카드를 집어 끌어다 놓는 일을 다루는 곳이다.
//
// 카드 열둘이 전부 여기를 지난다. 어떤 카드든 손에서 나가는 길은 하나다 — 집고, 끌고,
// 놓는다. 놓인 뒤에 무슨 일이 일어나는지만 카드마다 다르다.
//
// 놓을 때 가는 길이 셋이다.
//
//   떨어뜨려 쓰는 카드   그 카드의 제 파일이 받는다 (아이템·서포트·에너지)
//   유닛 카드            내 필드 안에 떨어졌으면 필드에 낸다
//   그 밖                제자리로 돌아간다
//
// 여기가 드는 것은 **차례** 다 — 무엇을 언제 끄고, 어느 길로 보내고, 어느 줄에서 빼고
// 넣는지. 무엇에 테두리를 씌우는지와 카드가 놓인 뒤에 무엇을 하는지는 그것을 아는 쪽이
// 한다. 아래 기대는 것들이 그 자리다.

// 손패 끌어다 놓기가 바깥에 기대는 것.
export interface HandDragDeps {
    readonly canvasElement: HTMLElement;
    readonly camera: THREE.Camera;
    readonly scene: THREE.Scene;
    // 사용자가 한 일 하나를 보내고 무슨 일이 있었는지 받는다.
    readonly send: (command: BattleCommand) => BattleEvent[];
    isYourTurn(): boolean;
    // 카드가 대상을 고르라고 기다리는 중인가.
    isPicking(): boolean;
    // 이 덩어리가 손패의 어느 카드인가.
    entryOf(group: THREE.Group): HandEntry | null;
    handIndexOf(entry: HandEntry): number;
    isUnitCard(entry: HandEntry): boolean;
    // 집은 카드를 어디에 놓을 수 있는지 테두리로 알린다. 어디인지는 카드가 정한다.
    markDropTargetsFor(cardId: number): void;
    clearDropTargetMarks(): void;
    // 집은 그 카드에 두르는 테두리.
    attachPickedBorder(entityId: number, group: THREE.Group): void;
    clearPickedBorder(): void;
    // 떨어뜨린 카드를 그 카드의 제 파일에 넘긴다. 떨어뜨려 쓰는 카드가 아니면 false.
    playDroppedCard(entry: HandEntry, dropX: number, dropY: number): boolean;
    // 내 필드 안에 떨어졌나. 화면에서만 알 수 있는 일이라 전투가 판단할 수 없다.
    isInsideYourField(worldX: number, worldY: number): boolean;
    // 손패 줄에서 빼고 필드 줄에 넣는다.
    moveToFieldLineup(entry: HandEntry, handIndex: number): void;
    // 낼 때 도는 것이 있으면 돌린다. 기다리지 않는다.
    runDeployPassive(entry: HandEntry): void;
    // 손패와 필드를 다시 줄 세운다.
    reflow(): void;
    // 때리기 쪽 상태를 옮긴다.
    closeAttackPanel(): void;
    selectAttacker(entry: HandEntry | null): void;
    attackerIdle(): void;
}

export class HandDragControl {
    private readonly bridge: HandInteractionBridge;

    private constructor(private readonly deps: HandDragDeps) {
        this.bridge = new HandInteractionBridge(
            deps.canvasElement, deps.camera, deps.scene,
            {
                canPickup: () => this.canPickup(),
                onPickup: (entityId, group) => this.onPickup(entityId, group),
                onDrop: (_entityId, group, worldX, worldY) =>
                    this.onDrop(group, worldX, worldY),
            },
        );
    }

    // 세우고 바로 듣기 시작한다.
    public static build(deps: HandDragDeps): HandDragControl {
        const control = new HandDragControl(deps);
        control.bridge.attach();
        return control;
    }

    // ── 집기 ────────────────────────────────────────────────────────────────────

    // 상대 차례에는 손패에서 카드가 나갈 수 없다. 카드가 대상을 고르라고 기다리는 중에도
    // 못 집는다 — 시체 폭발이나 네더 블레이드의 고르기가 다른 손패 동작에 끊기면 안 된다.
    //
    // false 를 주면 끌기가 시작되기 전에 끝난다. 카드가 들리는 모습조차 안 보인다.
    private canPickup(): boolean {
        return this.deps.isYourTurn() && !this.deps.isPicking();
    }

    private onPickup(entityId: number, group: THREE.Group): void {
        this.deps.closeAttackPanel();
        // 집은 카드는 다른 카드 위로 올라온다.
        group.renderOrder = 100;
        group.position.z = 1;

        this.deps.clearPickedBorder();
        this.deps.attachPickedBorder(entityId, group);

        const entry = this.deps.entryOf(group);
        this.deps.selectAttacker(entry);

        // 집은 카드를 어디에 놓을 수 있는지 테두리로 알린다.
        //
        // 어디에 놓을 수 있는지는 카드가 정한다. 전에는 카드 번호로 다섯 갈래를 갈라 봤고,
        // 카드가 늘 때마다 그 다섯을 고쳐야 했다.
        if (entry) this.deps.markDropTargetsFor(entry.card.cardId);
    }

    // ── 놓기 ────────────────────────────────────────────────────────────────────

    private onDrop(group: THREE.Group, worldX: number, worldY: number): void {
        group.renderOrder = 0;
        group.position.z = 0;

        const entry = this.deps.entryOf(group);
        // 떨어뜨린 그 자리에서 센다. 아래에서 줄이 바뀌기 전이라 번호가 아직 맞다.
        const handIndex = entry ? this.deps.handIndexOf(entry) : -1;

        // 놓는 순간 [여기에 놓을 수 있다] 고 알리던 테두리는 어느 경우에도 걷는다.
        this.deps.clearDropTargetMarks();

        if (!entry || handIndex < 0) {
            this.deps.reflow();
            return;
        }

        // 떨어뜨려 쓰는 카드는 그 카드의 제 파일이 받는다.
        //
        // 카드 종류를 보기 **전에** 묻는다. 전에는 아이템 안에서만 물었더니 에너지인 죽음의
        // 에너지와 서포트인 넘쳐 흐르는 사기가 아무 데도 안 걸렸다.
        if (this.deps.playDroppedCard(entry, group.position.x, group.position.y)) {
            this.finishDrop(true);
            return;
        }

        // 여기 오는 것은 필드에 놓는 유닛 카드와, 아직 못 쓰는 카드다.
        // 못 쓰는 카드는 전투가 거절하고 제자리로 돌아간다.
        if (!this.deps.isUnitCard(entry)) {
            this.finishDrop(false);
            return;
        }

        // 필드 안에 떨어졌는지는 화면이 본다. 낼 수 있는 카드인지와 손패에서 빼고 필드에
        // 놓는 것은 전투가 한다.
        const events = this.deps.isInsideYourField(worldX, worldY)
            ? this.deps.send({type: 'playCardToField', battleCardId: entry.cardIndex})
            : [];
        const played = events.some(
            (ev) => ev.type === 'cardMoved' && ev.to === 'yourField',
        );
        if (played) {
            this.deps.moveToFieldLineup(entry, handIndex);
            // 나온 턴은 전투가 적어 둔다. 이번 턴에는 공격·스킬 패널이 안 열린다.
            this.deps.runDeployPassive(entry);
        }
        this.finishDrop(false);
    }

    // 놓은 뒤의 뒷정리. 세 길이 모두 여기로 모인다.
    //
    // 집은 카드에 둘렀던 테두리는 어느 경우에도 끈다. 카드가 손에서 떠났다.
    //
    // 놓을 곳을 알리던 테두리는 한 경우에만 남긴다 — 방금 그 카드가 고르기를 시작했으면,
    // 그 테두리는 [이제 무엇을 누를 수 있는지] 알리려고 카드가 다시 켠 것이다. 여기서
    // 끄면 안내가 사라진다.
    private finishDrop(cardMayHaveMarked: boolean): void {
        this.deps.clearPickedBorder();
        if (cardMayHaveMarked && !this.deps.isPicking()) {
            this.deps.clearDropTargetMarks();
        }
        this.deps.attackerIdle();
        this.deps.reflow();
    }
}
