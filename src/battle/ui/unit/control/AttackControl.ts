import * as THREE from "three";

import {AttackChoice, BattleCommand} from "../../../domain/flow/BattleCommand";
import {BattleEvent} from "../../../domain/flow/BattleEvent";
import {BattleReadModel} from "../../../domain/read/BattleReadModel";
import {SkillType} from "../../../../card/SkillType";
import {RACE_LABEL} from "../../../../card/race";
import {CardFace} from "../../hand/entity/CardFace";
import {HandCardFrame} from "../../hand/frame/HandCardFrame";
import {HandEntry} from "../../hand/renderer/BattleFieldHandRendererV2";
import {PointerRouter} from "../../input/PointerRouter";
import {ViewportResize} from "../../resize/ViewportResize";
import {
    ActivePanelButtonSpec,
    ActivePanelFrame,
    createDefaultActivePanelFrame,
} from "../../active_panel/frame/ActivePanelFrame";
import {ActivePanelRendererV2} from "../../active_panel/renderer/ActivePanelRendererV2";

// 내 유닛으로 때리는 일을 다루는 곳이다.
//
// 사용자가 하는 순서가 정해져 있다.
//
//   내 유닛을 집는다 → 오른쪽 단추로 액티브 패널을 연다 → 일반 공격이나 스킬을 고른다
//     → 광역기면 바로 나간다
//     → 단일기면 상대에게 붉은 테두리가 켜지고, 그중 하나나 본체를 누른다
//
// 이 순서가 곧 상태 넷이다. 전에는 상태 넷과 그 사이를 옮기는 곳이 화면 안 열두 군데에
// 흩어져 있었고, 한 줄짜리 누름 처리기 하나가 267줄이었다. 어느 상태에서 무엇을 누를 수
// 있는지 알려면 그 267줄을 위아래로 읽어야 했다.
//
// 때린 결과를 화면에 옮기는 것은 여기가 하지 않는다. 붉게 번쩍이고 흔들고 쓰러진 것을
// 감추는 일은 상대 필드가 이미 내놓고 있는 것을 부른다 — 전에는 이 안에 같은 코드가 두 벌
// 있었다.

// 상대 유닛 하나가 화면에서 어떻게 보이는가.
export interface OpponentUnitOnScreen {
    readonly card: CardFace;
    readonly cardIndex: number;
    readonly group: THREE.Group;
}

// 사용자가 지금 어디까지 왔나.
//
//   idle          아무것도 고르지 않았다
//   cardSelected  내 유닛 하나를 집었다. 오른쪽 단추로 패널을 열 수 있다
//   panelVisible  패널이 열려 있다. 단추를 고를 수 있다
//   attackMode    단일기를 골랐다. 상대를 누르면 때린다
type InteractionState = 'idle' | 'cardSelected' | 'panelVisible' | 'attackMode';

// 때리기가 바깥에 기대는 것.
export interface AttackDeps {
    readonly scene: THREE.Scene;
    readonly pointerRouter: PointerRouter;
    readonly onResize: ViewportResize;
    readonly canvasElement: HTMLElement;
    listen(target: HTMLElement, type: string, handler: (event: never) => void): void;
    // 사용자가 한 일 하나를 보내고 무슨 일이 있었는지 받는다.
    readonly send: (command: BattleCommand) => BattleEvent[];
    // 화면에 보여 줄 것만 추린 창구.
    readonly view: BattleReadModel;
    // 패널이 선 자리를 카드 크기에 대한 비율로 적어 두는 데 쓴다.
    readonly handCardFrame: HandCardFrame;
    // 이 카드의 스킬 그림. 몇 장인지가 스킬 단추 수를 정한다.
    skillImages(cardId: number): readonly string[];
    // 이 유닛이 필드에 나와 있는가. 손에 든 카드로는 패널을 열지 않는다.
    isDeployed(entry: HandEntry): boolean;
    // 공용 광선을 누른 자리로 맞춘다. 아래의 찾는 것들이 그 광선을 쓴다.
    aimAt(event: MouseEvent): void;
    // 누른 자리가 화면의 어디인가. 못 맞히면 null.
    pointerWorld(event: MouseEvent): {x: number; y: number} | null;
    // 이 덩어리 안에서 방금 누른 것이 어느 단추인가. 단추가 아니면 null.
    hitButtonIn(group: THREE.Object3D): string | null;
    // 맞춰 둔 광선에 상대 유닛이 걸리는가. 쓰러져 안 보이는 것은 안 잡는다.
    hitOpponentUnitAt(): OpponentUnitOnScreen | null;
    // 맞춰 둔 광선에 상대 본체가 걸리는가.
    hitOpponentMasterAt(): boolean;
    // 화면 가운데에 잠깐 띄우는 안내.
    announce(message: string): void;
    // 누를 수 있는 상대에게 붉은 테두리를 씌우고 걷는다.
    markTargets(): void;
    clearTargets(): void;
    // 집은 내 유닛에 둘렀던 테두리.
    hasSelectionBorder(): boolean;
    clearSelectionBorder(): void;
    // 맞은 것을 화면에 옮기는 일.
    //
    // 붉게 번쩍이는 것과 흔드는 것은 상대 필드가 이미 내놓고 있다. 흔들지 여부만 여기서
    // 정한다 — 광역기는 흔들고 단일기는 안 흔든다.
    flashUnit(group: THREE.Group, shake: boolean): void;
    hideUnit(battleCardId: number): void;
    reflowOpponentField(): void;
    setMasterHp(hp: number): void;
    hideMaster(): void;
    // 이 유닛과 본체가 화면에서 든 덩어리. 번쩍이게 하고 때리는 움직임의 목표로 쓴다.
    opponentUnitGroup(battleCardId: number): THREE.Group | null;
    opponentMasterGroup(): THREE.Group;
    // 따라붙은 것을 그린다. 붙이는 것은 전투가 이미 했다.
    showCarriedStatus(events: readonly BattleEvent[]): void;
    // 때리는 움직임. 나갔다 돌아오는 것까지 부르는 쪽이 감싼다.
    playAttack(attacker: THREE.Group, target: THREE.Group, kind: string): Promise<void>;
    // 광역기 움직임. 어느 카드가 어떤 연출을 쓰는지는 부르는 쪽이 안다.
    playAoESkill(cardId: number, group: THREE.Group): Promise<void>;
    // 이 일이 끝날 때까지 턴 넘김을 미룬다.
    whileResolving<T>(work: () => Promise<T>): Promise<T>;
}

export class AttackControl {
    private state: InteractionState = 'idle';
    // 지금 집은 내 유닛. 손패에 같은 카드가 여럿 있을 수 있어 번호로는 가릴 수 없다.
    private attacker: HandEntry | null = null;
    private panelGroup: THREE.Group | null = null;

    // 패널이 열린 자리를 [그 카드의 가운데에서 얼마나 떨어져 있는가] 로 적어 둔다.
    // 카드 크기에 대한 비율이라, 창이 커지거나 작아져도 카드에 대해 같은 자리에 선다.
    // 패널은 누른 자리에 뜨는데, 창이 바뀌면 카드가 다른 자리로 가기 때문에 누른 자리를
    // 그대로 기억하면 패널만 엉뚱한 데 남는다.
    private panelAnchor: {entry: HandEntry; xRatio: number; yRatio: number} | null = null;

    // 고른 것. 단일기는 대상을 누를 때까지 들고 있어야 한다.
    private chosenAttack: AttackChoice = 'general';
    // 어느 단추로 골랐나. 연출을 가리는 데 쓴다.
    private chosenButton = 'general';

    private constructor(
        private readonly deps: AttackDeps,
        private readonly panelFrame: ActivePanelFrame,
        private readonly panelRenderer: ActivePanelRendererV2,
    ) {}

    public static async build(deps: AttackDeps): Promise<AttackControl> {
        const control = new AttackControl(
            deps, createDefaultActivePanelFrame(), new ActivePanelRendererV2(),
        );

        // 왼쪽 단추 — 패널 단추, 본체, 상대 유닛. 이 셋이 한 처리기다.
        //
        // 처리기 전체를 한 단위로 묶어 [고르기 완료 → 동작 실행 → 뒷정리] 가 중간에
        // 끊기지 않게 한다. 끝나기 전에는 보류된 턴 넘김이 실행되지 않는다.
        deps.pointerRouter.add('target', (event: MouseEvent) => {
            if (event.button !== 0) return;
            void deps.whileResolving(() => control.handleLeftClick(event));
        });

        // 오른쪽 단추. 왼쪽과 겨루지 않지만 누름 순서를 한 자리에서 보게 같이 둔다.
        deps.listen(deps.canvasElement, 'contextmenu', (event: never) => {
            (event as unknown as Event).preventDefault();
        });
        deps.pointerRouter.add('target', (event: MouseEvent) => {
            if (event.button !== 2) return;
            void control.handleRightClick(event);
        });

        // 패널은 카드를 따라간다. 카드가 새 자리로 간 뒤여야 하므로 맨 마지막이다.
        deps.onResize.add('last', (width) => control.reanchorPanel(width));

        return control;
    }

    // ── 바깥에서 상태를 옮기는 자리 ─────────────────────────────────────────────

    // 손패에서 내 유닛을 집었다.
    public select(entry: HandEntry | null): void {
        this.attacker = entry;
        this.state = 'cardSelected';
    }

    // 집은 것을 놓았다. 아무것도 고르지 않은 상태로 돌아간다.
    public goIdle(): void {
        this.attacker = null;
        this.state = 'idle';
    }

    // 패널만 닫는다. 집은 테두리가 남아 있으면 집은 상태로 돌아간다.
    public closePanel(): void {
        if (this.panelGroup) {
            this.panelRenderer.dispose(this.panelGroup);
            this.panelGroup = null;
        }
        this.panelAnchor = null;
        this.deps.clearTargets();
        if (this.state === 'panelVisible' || this.state === 'attackMode') {
            this.state = this.deps.hasSelectionBorder() ? 'cardSelected' : 'idle';
        }
    }

    // 고르던 것을 전부 치운다.
    public clearAll(): void {
        this.closePanel();
        this.deps.clearSelectionBorder();
        this.goIdle();
    }

    // ── 오른쪽 단추 — 패널 열기와 닫기 ──────────────────────────────────────────

    private async handleRightClick(event: MouseEvent): Promise<void> {
        event.preventDefault();

        if (this.state === 'panelVisible' || this.state === 'attackMode') {
            this.closePanel();
            return;
        }
        if (this.state !== 'cardSelected') return;

        const entry = this.attacker;
        if (!entry || !this.deps.isDeployed(entry)) return;

        // 출격 멀미 — 이번 턴에 나온 유닛은 공격도 스킬도 쓸 수 없으므로 패널 자체를
        // 열지 않는다. 이유를 알 수 없으면 무반응처럼 보이므로 안내로 알린다.
        if (!this.deps.view.canYourUnitAct(entry.cardIndex)) {
            this.deps.announce('이번 턴에 출격한 유닛으로 공격할 수 없습니다.');
            console.log(
                `[summoning-sickness] cardId=${entry.card.cardId}` +
                ` deployed on TURN ${this.deps.view.turnNumber()} — panel blocked`,
            );
            return;
        }

        const at = this.deps.pointerWorld(event);
        if (!at) return;

        // 단추 차례 — 일반 공격, 스킬 하나씩, 자세히.
        const specs: ActivePanelButtonSpec[] = [this.panelFrame.generalButton];
        const skills = this.deps.skillImages(entry.card.cardId);
        for (let i = 0; i < skills.length; i++) {
            specs.push({type: `skill${i + 1}`, imageSrc: skills[i]});
        }
        specs.push(this.panelFrame.detailsButton);

        const cardWidth = this.deps.handCardFrame.cardWidthRatio * window.innerWidth;
        const cardHeight = cardWidth * this.deps.handCardFrame.cardAspect;
        this.panelAnchor = {
            entry,
            xRatio: (at.x - entry.group.position.x) / cardWidth,
            yRatio: (at.y - entry.group.position.y) / cardHeight,
        };

        this.panelGroup = await this.panelRenderer.build(this.panelFrame, at, specs);
        this.deps.scene.add(this.panelGroup);
        this.state = 'panelVisible';
    }

    private reanchorPanel(width: number): void {
        if (!this.panelGroup || !this.panelAnchor) return;
        const cardWidth = this.deps.handCardFrame.cardWidthRatio * width;
        const cardHeight = cardWidth * this.deps.handCardFrame.cardAspect;
        const cardPos = this.panelAnchor.entry.group.position;
        this.panelRenderer.resize(
            this.panelFrame,
            this.panelGroup,
            {
                x: cardPos.x + this.panelAnchor.xRatio * cardWidth,
                y: cardPos.y + this.panelAnchor.yRatio * cardHeight,
            },
            width,
        );
    }

    // ── 왼쪽 단추 — 패널 단추, 본체, 상대 유닛 ──────────────────────────────────

    private async handleLeftClick(event: MouseEvent): Promise<void> {
        // 광선은 한 번만 맞춘다. 아래 셋이 같은 광선을 쓴다.
        this.deps.aimAt(event);
        if (await this.handlePanelButton(event)) return;
        if (await this.handleMaster(event)) return;
        await this.handleOpponentUnit(event);
    }

    private async handlePanelButton(event: MouseEvent): Promise<boolean> {
        if (!this.panelGroup || this.state !== 'panelVisible') return false;
        const button = this.deps.hitButtonIn(this.panelGroup);
        if (button === null) return false;

        event.stopImmediatePropagation();

        if (button === 'details') {
            console.log('Details clicked — not implemented in pilot');
            this.closePanel();
            return true;
        }
        if (button !== 'general' && !button.startsWith('skill')) return true;

        const entry = this.attacker;
        const cardId = entry?.card.cardId ?? null;
        const slot: 1 | 2 | null = button === 'skill1' ? 1 : button === 'skill2' ? 2 : null;

        // 누구를 치는지만 묻는다. 대상을 골라야 하는 공격인지 여기서 갈리기 때문이다.
        // 얼마나 아픈지는 안 묻는다. 전투가 명령을 받고 정한다.
        const range = cardId != null
            ? this.deps.view.attackRange(cardId, slot)
            : SkillType.Single;

        if (!this.checkSkillEnergy(button, entry, cardId, slot)) return true;

        if (range === SkillType.EveryUnitField || range === SkillType.EveryField) {
            await this.attackEveryOpponent(button, entry, slot);
        } else {
            this.enterAttackMode(button, slot);
        }
        return true;
    }

    // 스킬이 요구하는 에너지를 갖췄나.
    //
    // 카드 자료의 [스킬N {종족}필요에너지] 세 열이 그 스킬의 종족별 비용이고, 카드에 붙은
    // 에너지도 종족별로 보관하므로 종족을 하나씩 대조한다. 일반 공격은 비용이 없다.
    private checkSkillEnergy(
        button: string, entry: HandEntry | null, cardId: number | null, slot: 1 | 2 | null,
    ): boolean {
        if (slot === null || cardId == null || !entry) return true;

        const missing = this.deps.view.missingSkillEnergy(entry.cardIndex, cardId, slot);
        if (missing) {
            this.deps.announce('에너지가 부족하여 스킬을 사용할 수 없습니다.');
            console.log(
                `[skill-energy] ${button} blocked — cardId=${cardId}` +
                ` ${RACE_LABEL[missing.race] ?? missing.race} 보유 ${missing.have}` +
                ` < 필요 ${missing.need}`,
            );
            this.closePanel();
            return false;
        }

        const cost = this.deps.view.skillCost(cardId, slot);
        const costText = cost.size === 0
            ? '비용 없음'
            : [...cost].map(([race, n]) => `${RACE_LABEL[race] ?? race} ${n}`).join(', ');
        console.log(`[skill-energy] ${button} ok — cardId=${cardId} (${costText})`);
        return true;
    }

    // 광역기 — 값을 다 바꾸고 나서 연출을 기다린다. 기다리는 동안 화면이 닫혀도 체력만 0
    // 이고 필드에 남아 있는 어중간한 상태가 안 생긴다.
    //
    // 본체까지 갈지는 카드에 적힌 범위가 정한다. 전투가 판단한다.
    private async attackEveryOpponent(
        button: string, entry: HandEntry | null, slot: 1 | 2 | null,
    ): Promise<void> {
        console.log(`${button} (AoE) → hitting all opponents`);

        const events = this.deps.send({
            type: 'attackEveryOpponent',
            attackerBattleCardId: entry?.cardIndex ?? -1,
            attack: slot ?? 'general',
        });

        if (entry) {
            this.clearAll();
            await this.deps.playAoESkill(entry.card.cardId, entry.group);
        }

        // 따라붙은 것은 전투가 이미 붙였다. 여기서는 그린다.
        this.deps.showCarriedStatus(events);
        this.reflectDamage(events, `${button} (AoE)`, AOE_LOOK);
        this.clearAll();
    }

    // 단일기 — 대상을 고르는 상태로 들어간다. 누를 수 있는 상대에게 테두리가 켜진다.
    private enterAttackMode(button: string, slot: 1 | 2 | null): void {
        this.state = 'attackMode';
        this.chosenAttack = slot ?? 'general';
        this.chosenButton = button;
        this.deps.markTargets();
        console.log(`${button} (Single) — choose opponent target or master`);
    }

    private async handleMaster(event: MouseEvent): Promise<boolean> {
        if (this.state !== 'attackMode' || !this.deps.view.isOpponentMasterAlive()) return false;
        if (!this.deps.hitOpponentMasterAt()) return false;

        event.stopImmediatePropagation();
        const attacker = this.attacker;
        const button = this.chosenButton;
        this.clearAll();

        // 때리는 것은 전투가 한다. 연출을 기다리기 전에 값을 다 바꾼다.
        const events = this.deps.send({
            type: 'attackOpponentMaster',
            attackerBattleCardId: attacker?.cardIndex ?? -1,
            attack: this.chosenAttack,
        });

        if (attacker) {
            await this.deps.playAttack(
                attacker.group, this.deps.opponentMasterGroup(), button,
            );
        }
        this.reflectDamage(events, `attack on MASTER (${button})`, SINGLE_LOOK);
        return true;
    }

    private async handleOpponentUnit(event: MouseEvent): Promise<void> {
        if (this.state !== 'attackMode') return;
        const target = this.deps.hitOpponentUnitAt();
        if (!target) return;

        event.stopImmediatePropagation();
        const attacker = this.attacker;
        const attackerId = attacker?.card.cardId ?? null;
        const button = this.chosenButton;
        this.clearAll();

        // 때리는 것과 쓰러뜨리는 것은 전투가 한다. 연출을 기다리기 전에 값을 다 바꾼다.
        const events = this.deps.send({
            type: 'attackUnit',
            attackerBattleCardId: attacker?.cardIndex ?? -1,
            targetBattleCardId: target.cardIndex,
            attack: this.chosenAttack,
        });

        if (attacker) {
            await this.deps.playAttack(attacker.group, target.group, button);
        }

        // 따라붙은 것은 전투가 이미 붙였다. 여기서는 그린다.
        this.deps.showCarriedStatus(events);
        console.log(
            `Single-target attack: attacker=${attackerId} (${button})` +
            ` → opponent idx=${target.cardIndex} cardId=${target.card.cardId}`,
        );
        this.reflectDamage(events, `attack (${button})`, SINGLE_LOOK);
    }

    // ── 맞은 것을 화면에 옮긴다 ─────────────────────────────────────────────────

    // 값은 이미 다 바뀌었다. 여기서는 그 결과를 보여 준다.
    //
    // 전에는 이 일이 광역기 쪽과 단일기 쪽에 같은 코드로 두 벌 있었다. 붉게 번쩍이고
    // 흔드는 것도, 쓰러진 것을 감추는 것도 상대 필드가 이미 내놓고 있는 것이다.
    private reflectDamage(
        events: readonly BattleEvent[], label: string, look: DamageLook,
    ): void {
        let anyDefeated = false;
        for (const ev of events) {
            if (ev.type === 'damaged' && ev.target.kind === 'unit') {
                const id = ev.target.battleCardId;
                const group = this.deps.opponentUnitGroup(id);
                if (group) this.deps.flashUnit(group, look.shake);
                console.log(
                    `  opponent idx=${id} HP: ${ev.hpBefore} → ${ev.hpAfter}` +
                    `${ev.hpAfter <= 0 ? ' (defeated)' : ''}`,
                );
            } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
                const id = ev.target.battleCardId;
                // 무덤에 넣는 것은 전투가 이미 했다. 화면 정리만 늦춘다 — 맞는 표시가
                // 다 보이고 나서 사라져야 무엇이 쓰러졌는지 보인다.
                anyDefeated = true;
                setTimeout(() => {
                    this.deps.hideUnit(id);
                    this.deps.reflowOpponentField();
                }, look.hideDelayMs);
            } else if (ev.type === 'damaged' && ev.target.kind === 'opponentMaster') {
                this.deps.setMasterHp(ev.hpAfter);
                console.log(`[opponent-master-hp] ${label} → ${ev.hpBefore} → ${ev.hpAfter}`);
            } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
                setTimeout(() => {
                    this.deps.hideMaster();
                    console.log('Opponent MASTER defeated!');
                }, MASTER_HIDE_DELAY_MS);
            }
        }
        if (anyDefeated) {
            console.log(`Remaining opponents: ${this.deps.view.opponentAliveCount()}`);
        }
    }
}

// 맞은 것이 어떻게 보이는가. 광역기와 단일기가 다르다.
//
// **둘을 하나로 맞추지 않았다.** 단일기는 때리는 카드가 날아와 부딪히는 움직임이 이미
// 충격을 말해 주므로 카드를 흔들지 않는다. 광역기는 그 움직임이 없어 흔들어야 맞은 것이
// 보인다. 사라지기까지 기다리는 시간도 흔드는 쪽이 더 길다 — 흔들기가 끝나야 사라진다.
interface DamageLook {
    // 맞은 카드를 흔드나.
    readonly shake: boolean;
    // 쓰러진 카드가 사라지기까지 기다리는 시간.
    readonly hideDelayMs: number;
}

const AOE_LOOK: DamageLook = {shake: true, hideDelayMs: 450};
const SINGLE_LOOK: DamageLook = {shake: false, hideDelayMs: 300};
const MASTER_HIDE_DELAY_MS = 300;
