import * as THREE from "three";

import {CardRace, RACE_LABEL} from "../../../../card/race";
import {HandCardFrame} from "../../hand/frame/HandCardFrame";
import {HandEntry} from "../../hand/renderer/BattleFieldHandRendererV2";
import {CardEnergyBadgeRenderer} from "../../card_energy/renderer/CardEnergyBadgeRenderer";
import {OverflowMoraleEffect} from "../../animation/card/support/002_overflow_morale/OverflowMoraleEffect";
import {PointerRouter} from "../../input/PointerRouter";
import {ViewportResize} from "../../../../core/resize/ViewportResize";
import {
    FieldEnergyHudFrame,
    createDefaultFieldEnergyHudFrame,
} from "../your/frame/FieldEnergyHudFrame";
import {
    FieldEnergyRaceHudFrame,
    createDefaultFieldEnergyRaceHudFrame,
} from "../your/frame/FieldEnergyRaceHudFrame";
import {
    FieldEnergyCountHudFrame,
    createDefaultFieldEnergyCountHudFrame,
} from "../your/frame/FieldEnergyCountHudFrame";
import {FieldEnergyHudRendererV2} from "../your/renderer/FieldEnergyHudRendererV2";
import {FieldEnergyRaceHudRendererV2} from "../your/renderer/FieldEnergyRaceHudRendererV2";
import {FieldEnergyCountHudRendererV2} from "../your/renderer/FieldEnergyCountHudRendererV2";
import {
    OpponentFieldEnergyAreaFrame,
    OpponentFieldEnergyBounds,
    computeOpponentFieldEnergyBounds,
    createDefaultOpponentFieldEnergyAreaFrame,
} from "../opponent/frame/OpponentFieldEnergyAreaFrame";
import {OpponentFieldEnergyAreaRendererV2} from "../opponent/renderer/OpponentFieldEnergyAreaRendererV2";
import {OpponentFieldEnergyHudRendererV2} from "../opponent/renderer/OpponentFieldEnergyHudRendererV2";

// 필드 에너지를 다루는 곳이다.
//
// 화면 오른쪽 아래에 표기 셋이 모여 있다 — 남은 에너지, 붙일 종족, 붙일 개수. 셋은 따로
// 켜고 끄는 것이 아니라 한 덩어리로 움직인다. 하나에 손을 얹으면 셋이 같이 밝아지고,
// 누르면 셋이 같이 초록 테두리를 두른다. 그 상태에서 필드에 나와 있는 아군 유닛을 누르면
// 그 유닛에 에너지가 붙는다.
//
// 전에는 이 한 덩어리가 전투 화면 안에 네 군데로 흩어져 있었다 — 만드는 곳, 누름을
// 가로채는 곳, 화면에 넘겨 주는 창구, 창 크기 조절. 켜짐 여부 하나를 고치려면 네 군데를
// 다 찾아야 했다. 여기로 모은다.
//
// 상대 쪽 표기도 여기가 든다. 내 표기를 화면 한가운데를 기준으로 뒤집은 자리에 있고,
// 죽음의 대지가 부수는 대상이 바로 그 판이다.

const MAX_RACE_ID = 3;

// 필드 에너지가 바깥에 기대는 것.
export interface FieldEnergyDeps {
    readonly scene: THREE.Scene;
    // 화면 위에 얹는 조각을 몸통에 붙인다. 화면을 떠날 때 같이 치우려고 화면이 든다.
    appendToBody(element: HTMLElement): void;
    readonly pointerRouter: PointerRouter;
    readonly onResize: ViewportResize;
    // 카드에 붙이는 에너지 표기가 카드 어디에 놓이는지.
    readonly handCardFrame: HandCardFrame;
    yourFieldEnergy(): number;
    opponentFieldEnergy(): number;
    // 유닛에 에너지 하나를 붙인다. 쓸 수 있는지 보고 깎고 붙이는 것은 전투가 한다.
    // 붙은 뒤의 총합을 돌려준다. 못 붙이면 null.
    chargeUnit(entry: HandEntry, race: CardRace): number | null;
    // 누른 자리에 필드에 나와 있는 아군 유닛이 있는가.
    hitDeployedUnitAt(event: MouseEvent): HandEntry | null;
    // 도는 동안 창 크기가 바뀌면 연출에도 알려 준다.
    whileRunning(
        effect: {resize(viewportWidth: number, viewportHeight: number): void},
        run: () => Promise<void>,
    ): Promise<void>;
}

export class FieldEnergyPanels {
    // 켜져 있는가. 켜져 있을 때만 카드 누름을 가로챈다.
    private active = false;
    // 지금 고른 종족. 에너지를 붙이면 이 값이 그대로 기록된다.
    private raceId: CardRace = CardRace.HUMAN;
    // 붙일 개수 고르개. 표기만 움직인다.
    private chargeCount = 1;
    // 카드에 이미 그려 둔 숫자. 겹친 연출이 뒤로 되돌리는 것을 막는 데 쓴다.
    private readonly shownCardEnergy = new Map<HandEntry, number>();

    private constructor(
        private readonly deps: FieldEnergyDeps,
        private readonly energyFrame: FieldEnergyHudFrame,
        private readonly energyRenderer: FieldEnergyHudRendererV2,
        private readonly energyElement: HTMLElement,
        // 종족 그림은 고른 종족이 바뀌면 같이 바뀐다. 그래서 이것만 다시 담는다 —
        // 처음 것을 들고 있으면 창 크기를 바꿀 때 그림이 첫 종족으로 돌아간다.
        private raceFrame: FieldEnergyRaceHudFrame,
        private readonly raceRenderer: FieldEnergyRaceHudRendererV2,
        private readonly raceElement: HTMLElement,
        private readonly countFrame: FieldEnergyCountHudFrame,
        private readonly countRenderer: FieldEnergyCountHudRendererV2,
        private readonly countElement: HTMLElement,
        private readonly areaFrame: OpponentFieldEnergyAreaFrame,
        private readonly areaRenderer: OpponentFieldEnergyAreaRendererV2,
        private readonly areaGroup: THREE.Group,
        private readonly opponentRenderer: OpponentFieldEnergyHudRendererV2,
        private readonly opponentGroup: THREE.Group,
        private readonly cardBadge: CardEnergyBadgeRenderer,
        private readonly arrowZones: readonly HTMLElement[],
    ) {}

    public static async build(deps: FieldEnergyDeps): Promise<FieldEnergyPanels> {
        const energyFrame = createDefaultFieldEnergyHudFrame();
        const energyRenderer = new FieldEnergyHudRendererV2(deps.yourFieldEnergy());
        const energyElement = await energyRenderer.build(energyFrame);
        deps.appendToBody(energyElement);

        const raceFrame = createDefaultFieldEnergyRaceHudFrame(CardRace.HUMAN);
        const raceRenderer = new FieldEnergyRaceHudRendererV2();
        const raceElement = await raceRenderer.build(raceFrame);
        deps.appendToBody(raceElement);

        const countFrame = createDefaultFieldEnergyCountHudFrame();
        const countRenderer = new FieldEnergyCountHudRendererV2(1);
        const countElement = await countRenderer.build(countFrame);
        deps.appendToBody(countElement);

        // 상대 쪽 판과 숫자는 캔버스 안에 그린다. 화면 위에 얹는 조각으로 두면 죽음의
        // 대지 연출이 그 뒤에서 돌아 무엇이 부서지는지 보이지 않는다.
        // 자리와 크기는 판 프레임이 이미 재고 있어 숫자도 그대로 쓴다.
        const areaFrame = createDefaultOpponentFieldEnergyAreaFrame();
        const areaRenderer = new OpponentFieldEnergyAreaRendererV2();
        const areaGroup = await areaRenderer.build(areaFrame);
        deps.scene.add(areaGroup);

        const opponentRenderer = new OpponentFieldEnergyHudRendererV2(deps.opponentFieldEnergy());
        const opponentGroup = await opponentRenderer.build(areaFrame);
        deps.scene.add(opponentGroup);

        const panels = new FieldEnergyPanels(
            deps,
            energyFrame, energyRenderer, energyElement,
            raceFrame, raceRenderer, raceElement,
            countFrame, countRenderer, countElement,
            areaFrame, areaRenderer, areaGroup,
            opponentRenderer, opponentGroup,
            new CardEnergyBadgeRenderer(),
            panelsArrowZones(),
        );

        panels.buildArrowZones();
        panels.installNeonStyle();
        panels.installHover();
        panels.installIntercept();

        deps.onResize.add('layout', (width, height) => {
            energyRenderer.update(energyFrame, energyElement, width, height);
            raceRenderer.update(panels.raceFrame, raceElement, width, height);
            countRenderer.update(countFrame, countElement, width, height);
            opponentRenderer.resize(areaFrame, opponentGroup, width, height);
            areaRenderer.resize(areaFrame, areaGroup, width, height);
        });

        return panels;
    }

    // ── 내 에너지 표기 ──────────────────────────────────────────────────────────

    // 표기가 오른쪽 아래에 있다. 모래시계가 있는 오른쪽 위가 아니다.
    public worldPosition(): {x: number; y: number} {
        return {
            x: (0.940 - 0.5) * window.innerWidth,
            y: (0.5 - 0.89) * window.innerHeight,
        };
    }

    public setEnergy(count: number): void {
        this.energyRenderer.setEnergy(count);
        this.energyRenderer.update(
            this.energyFrame, this.energyElement, window.innerWidth, window.innerHeight,
        );
    }

    // 전투가 든 값으로 맞춘다. 연출이 끝난 뒤에 부른다.
    public syncToTruth(): void {
        this.setEnergy(this.deps.yourFieldEnergy());
    }

    // ── 카드에 붙은 에너지 ──────────────────────────────────────────────────────

    // 카드 한 장에 그려 둔 에너지 숫자를 갱신한다.
    //
    // 연출 둘이 겹칠 수 있다. 넘쳐흐르는 사기가 알갱이를 날리는 중에 죽음의 에너지를
    // 바로 붙이면, 뒤늦게 도착한 알갱이가 자기가 들고 있던 옛 숫자로 되돌려 쓴다.
    //
    // 아군 유닛의 에너지는 줄어드는 자리가 없다. 그래서 올라가는 쪽만 그린다.
    // 줄어드는 카드가 생기면 이 규칙을 다시 봐야 한다.
    public async showCardEnergy(entry: HandEntry, newCount: number): Promise<void> {
        const shown = this.shownCardEnergy.get(entry) ?? 0;
        if (newCount < shown) return;
        this.shownCardEnergy.set(entry, newCount);

        // 저장은 전투가 한다 — 여기서는 숫자 표기와 개수 표기만 갱신.
        this.countRenderer.setCount(newCount);
        this.countRenderer.update(
            this.countFrame, this.countElement, window.innerWidth, window.innerHeight,
        );

        await this.cardBadge.draw(entry.group, newCount, this.deps.handCardFrame);
    }

    // ── 상대 에너지 표기 ────────────────────────────────────────────────────────

    public opponentBounds(): OpponentFieldEnergyBounds {
        return computeOpponentFieldEnergyBounds(
            this.areaFrame, window.innerWidth, window.innerHeight,
        );
    }

    public setOpponentEnergy(count: number): void {
        this.opponentRenderer.setEnergy(count);
        this.opponentRenderer.refresh(
            this.areaFrame, this.opponentGroup, window.innerWidth, window.innerHeight,
        );
    }

    // 죽음의 대지가 부서지는 대상에게 주는 되먹임.
    public setOpponentOffset(dx: number, dy: number): void {
        this.opponentRenderer.setOffset(this.opponentGroup, dx, dy);
    }

    public setOpponentDamageLevel(level: 0 | 1 | 2): void {
        this.opponentRenderer.setDamageLevel(this.opponentGroup, level);
    }

    // ── 켜고 끄기 ───────────────────────────────────────────────────────────────

    // 셋에 손을 얹으면 셋이 같이 밝아진다. 켜져 있을 때는 이미 테두리가 있어 안 바꾼다.
    private setHover(on: boolean): void {
        if (this.active) return;
        for (const el of this.elements()) {
            if (on) el.classList.add('field-energy-hover');
            else el.classList.remove('field-energy-hover');
        }
    }

    private setNeon(on: boolean): void {
        this.active = on;
        for (const el of this.elements()) {
            el.classList.remove(
                'field-energy-hover', 'field-energy-neon', 'field-energy-neon-shift-up',
            );
            if (on) {
                el.classList.add(
                    el === this.countElement ? 'field-energy-neon-shift-up' : 'field-energy-neon',
                );
            }
        }
        for (const arrow of this.arrowZones) {
            if (on) arrow.classList.add('field-energy-arrow-active');
            else arrow.classList.remove('field-energy-arrow-active');
        }
    }

    private elements(): readonly HTMLElement[] {
        return [this.energyElement, this.raceElement, this.countElement];
    }

    // ── 유닛에 붙이기 ───────────────────────────────────────────────────────────

    // 에너지 하나가 표기에서 떠나 유닛에 가서 붙는다.
    //
    // 붙는 것은 이미 참이다 — 전투가 먼저 정하고, 연출은 그것을 시간에 걸쳐 보여 준다.
    // 그래서 표기의 남은 개수는 **떠나는 순간에** 줄고, 카드의 숫자는 **닿는 순간에** 오른다.
    //
    // 기다리지 않는다. 빠르게 여러 번 누르면 알갱이 여럿이 동시에 날아간다. 뒤늦게 닿은
    // 것이 옛 숫자로 되돌려 쓰는 일은 카드 숫자 쪽에서 막는다 (규칙 28).
    private attachTo(entry: HandEntry): void {
        // 붙는 에너지의 종족 = 지금 고른 종족.
        const total = this.deps.chargeUnit(entry, this.raceId);
        if (total === null) return;

        this.syncToTruth();
        this.setNeon(false);

        const from = this.worldPosition();
        const source = new THREE.Vector3(from.x, from.y, 5);
        const target = new THREE.Vector3(entry.group.position.x, entry.group.position.y, 5);

        // 연출은 넘쳐 흐르는 사기의 [모여서 날아가 부딪힌다] 를 그대로 쓴다. 한 번에 하나가
        // 붙으므로 알갱이도 하나다.
        const effect = new OverflowMoraleEffect(this.deps.scene);
        void this.deps.whileRunning(effect, () => effect.play(source, target, 1, () => {
            // 카드에 그려지는 숫자는 전 종족 합계다. 종족별 개수가 아니다.
            void this.showCardEnergy(entry, total);
            console.log(
                `Energy attached to card ${entry.card.cardId}: ${RACE_LABEL[this.raceId]} +1` +
                ` → ${total} total. Available: ${this.deps.yourFieldEnergy()}`,
            );
        }));
    }

    // ── 세우기 ──────────────────────────────────────────────────────────────────

    // 켜져 있을 때 카드 누름을 가로챈다. 손패를 집는 것보다 먼저 받아야 한다.
    private installIntercept(): void {
        this.deps.pointerRouter.add('intercept', (event: MouseEvent) => {
            if (event.button !== 0 || !this.active) return;
            const entry = this.deps.hitDeployedUnitAt(event);
            if (!entry) return;
            event.stopImmediatePropagation();
            this.attachTo(entry);
        });
    }

    private installHover(): void {
        // 셋 다 손을 얹는 것을 받는다. 누름은 에너지 표기만 받는다 — 종족과 개수는
        // 그 위에 얹힌 화살표 자리가 받는다.
        for (const el of this.elements()) {
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'pointer';
            el.addEventListener('mouseenter', () => this.setHover(true));
            el.addEventListener('mouseleave', () => this.setHover(false));
        }
        this.energyElement.addEventListener('click', (event: Event) => {
            event.stopPropagation();
            this.setNeon(!this.active);
        });
    }

    private buildArrowZones(): void {
        const [countPrev, countNext, racePrev, raceNext] = this.arrowZones;

        wireZone(countPrev, () => {
            if (this.chargeCount <= 0) return;
            this.chargeCount--;
            this.redrawCount();
        });
        wireZone(countNext, () => {
            if (this.chargeCount >= this.deps.yourFieldEnergy()) return;
            this.chargeCount++;
            this.redrawCount();
        });
        wireZone(racePrev, () => {
            this.raceId = (((this.raceId - 2 + MAX_RACE_ID) % MAX_RACE_ID) + 1) as CardRace;
            this.redrawRace();
        });
        wireZone(raceNext, () => {
            this.raceId = ((this.raceId % MAX_RACE_ID) + 1) as CardRace;
            this.redrawRace();
        });

        for (const zone of this.arrowZones) this.deps.appendToBody(zone);
    }

    private redrawCount(): void {
        this.countRenderer.setCount(this.chargeCount);
        this.countRenderer.update(
            this.countFrame, this.countElement, window.innerWidth, window.innerHeight,
        );
    }

    private redrawRace(): void {
        this.raceFrame = createDefaultFieldEnergyRaceHudFrame(this.raceId);
        this.raceRenderer.update(
            this.raceFrame, this.raceElement, window.innerWidth, window.innerHeight,
        );
    }

    private installNeonStyle(): void {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes greenNeonPulse {
                0%, 100% { box-shadow: 0 0 6px #00ff88, 0 0 12px #00ff88; filter: brightness(1.1); }
                50% { box-shadow: 0 0 14px #00ff88, 0 0 28px #00ff88, 0 0 42px #00ff88; filter: brightness(1.3); }
            }
            @keyframes greenNeonPulseShiftUp {
                0%, 100% { box-shadow: 0 -6px 6px #00ff88, 0 -6px 12px #00ff88; filter: brightness(1.1); }
                50% { box-shadow: 0 -6px 14px #00ff88, 0 -6px 28px #00ff88, 0 -6px 42px #00ff88; filter: brightness(1.3); }
            }
            @keyframes arrowNeonPulse {
                0%, 100% { text-shadow: 0 0 4px #00ff88, 0 0 8px #00ff88; opacity: 0.6; }
                50% { text-shadow: 0 0 8px #00ff88, 0 0 16px #00ff88, 0 0 24px #00ff88; opacity: 1; }
            }
            .field-energy-hover { filter: brightness(1.2); transition: filter 0.15s; }
            .field-energy-neon { animation: greenNeonPulse 1.4s ease-in-out infinite; border-radius: 6px; }
            .field-energy-neon-shift-up { animation: greenNeonPulseShiftUp 1.4s ease-in-out infinite; border-radius: 6px; }
            .field-energy-arrow { opacity: 0; pointer-events: none; transition: opacity 0.15s; }
            .field-energy-arrow-active { opacity: 1; pointer-events: auto; animation: arrowNeonPulse 1.4s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
    }
}

// 화살표 넷의 자리. 옛 MouseCursorDetectAreaMap 이 쓰던 창 비율 그대로다.
//
// 종족 화살표는 개수 화살표와 같은 너비와 높이로, 종족 그림 한가운데(위에서 72.1%)에
// 맞춰 둔다.
function panelsArrowZones(): HTMLElement[] {
    const zoneHeight = 0.68030 - 0.62863;
    const raceY1 = 0.721 + 0.005;
    const raceY2 = 0.721 + zoneHeight + 0.005;
    return [
        createClickZone(0.88203, 0.62863, 0.90530, 0.68030, '◁'),
        createClickZone(0.97348, 0.62863, 0.995, 0.68030, '▷'),
        createClickZone(0.88203, raceY1, 0.90530, raceY2, '◁'),
        createClickZone(0.97348, raceY1, 0.995, raceY2, '▷'),
    ];
}

// 안 보이는 누름 자리 하나. 켜져 있을 때만 화살표가 보인다.
function createClickZone(
    x1Pct: number, y1Pct: number, x2Pct: number, y2Pct: number, arrow: '◁' | '▷',
): HTMLElement {
    const zone = document.createElement('div');
    zone.style.position = 'fixed';
    zone.style.left = `${x1Pct * 100}%`;
    zone.style.top = `${y1Pct * 100}%`;
    zone.style.width = `${(x2Pct - x1Pct) * 100}%`;
    zone.style.height = `${(y2Pct - y1Pct) * 100}%`;
    zone.style.zIndex = '1001';
    zone.style.pointerEvents = 'auto';
    zone.style.cursor = 'pointer';
    zone.style.display = 'flex';
    zone.style.alignItems = 'center';
    zone.style.justifyContent = 'center';
    zone.style.color = '#00ff88';
    zone.style.fontSize = `${(y2Pct - y1Pct) * 122}vh`;
    zone.style.lineHeight = '1';
    zone.style.userSelect = 'none';
    zone.style.paddingTop = '0.3vh';
    zone.classList.add('field-energy-arrow');
    zone.innerText = arrow;
    return zone;
}

function wireZone(zone: HTMLElement, onClick: () => void): void {
    zone.addEventListener('click', (event) => {
        event.stopPropagation();
        onClick();
    });
}
