import {Battle} from "../battle/Battle";
import {TurnOwner} from "../battle/TurnOwner";

// 화면에 보여 줄 것만 추린 것이다.
//
// 화면은 전투 안을 직접 안 본다. 여기를 본다. 그래서 전투가 속을 어떻게 바꾸든
// 화면이 같이 깨지지 않는다. 전에는 화면 한 곳에서 전투 안을 쉰아홉 군데 들여다봤다.
//
// 여기서 나가는 것은 전부 그대로 읽을 수 있는 값이다. 규칙 물건을 그대로 넘기지
// 않는다. 넘기면 화면이 그 물건의 속을 다시 뒤지게 되고, 창구를 둔 뜻이 없어진다.
//
// 사용자가 아는 말로 묶었다 — 내 필드, 상대 필드, 무덤, 내 턴. 전투 안의 이름이
// 아니다.

// 필드에 선 유닛 하나를 화면이 볼 때의 모습이다.
export interface UnitOnField {
    readonly battleCardId: number;
    readonly cardId: number;
    readonly hp: number;
    readonly energyCount: number;
    // 얼어 있다. 이번 턴에 못 움직인다
    readonly frozen: boolean;
    // 암흑 화염이 붙었다. 턴마다 깎인다
    readonly darkFlame: boolean;
    // 지금 움직일 수 있는가. 나온 턴이거나 얼어 있으면 못 움직인다
    readonly canAct: boolean;
}

export class BattleReadModel {
    constructor(private readonly battle: Battle) {}

    /* ── 턴 ── */

    whoseTurn(): TurnOwner {
        return this.battle.getTurnOwner();
    }

    isYourTurn(): boolean {
        return this.battle.getTurnOwner() === 'your';
    }

    turnNumber(): number {
        return this.battle.getTurnNumber();
    }

    /* ── 필드 에너지 ── */

    yourFieldEnergy(): number {
        return this.battle.getFieldEnergy();
    }

    opponentFieldEnergy(): number {
        return this.battle.getOpponentFieldEnergy();
    }

    /* ── 본체 ── */

    opponentMasterHp(): number {
        return this.battle.getOpponentMasterHp();
    }

    isOpponentMasterAlive(): boolean {
        return this.battle.getOpponentMasterHp() > 0;
    }

    /* ── 내 필드 ── */

    yourUnit(battleCardId: number): UnitOnField | null {
        const card = this.battle.findOnYourField(battleCardId);
        if (!card) return null;
        return {
            battleCardId,
            cardId: card.getCardId(),
            hp: card.getHp(),
            energyCount: card.getEnergyCount(),
            frozen: card.isFrozen(),
            darkFlame: card.hasDarkFlame(),
            canAct: this.battle.canYourUnitAct(battleCardId),
        };
    }

    canYourUnitAct(battleCardId: number): boolean {
        return this.battle.canYourUnitAct(battleCardId);
    }

    yourUnitEnergyCount(battleCardId: number): number {
        return this.battle.findOnYourField(battleCardId)?.getEnergyCount() ?? 0;
    }

    /* ── 상대 필드 ── */

    opponentUnit(battleCardId: number): UnitOnField | null {
        const card = this.battle.findOnOpponentField(battleCardId);
        if (!card) return null;
        return {
            battleCardId,
            cardId: card.getCardId(),
            hp: card.getHp(),
            energyCount: card.getEnergyCount(),
            frozen: card.isFrozen(),
            darkFlame: card.hasDarkFlame(),
            canAct: this.battle.canOpponentUnitAct(battleCardId),
        };
    }

    // 살아 있는 상대 유닛의 차례다. 상대 필드 카드가 어느 자리에 서는지도 이 차례로 정해진다.
    opponentAliveIds(): number[] {
        return this.battle.getOpponentFieldCards().map((it) => it.getBattleCardId());
    }

    isOpponentAlive(battleCardId: number): boolean {
        return this.battle.findOnOpponentField(battleCardId) !== null;
    }

    opponentUnitEnergyCount(battleCardId: number): number {
        return this.battle.findOnOpponentField(battleCardId)?.getEnergyCount() ?? 0;
    }

    isOpponentUnitFrozen(battleCardId: number): boolean {
        return this.battle.findOnOpponentField(battleCardId)?.isFrozen() ?? false;
    }

    opponentAliveCount(): number {
        return this.battle.getOpponentFieldCount();
    }

    /* ── 덱 ── */

    yourDeckCards(): readonly number[] {
        return this.battle.getYourDeckCards();
    }

    yourDeckRemainingCount(): number {
        return this.battle.getYourDeckRemainingCount();
    }

    opponentDeckRemainingCount(): number {
        return this.battle.getOpponentDeckRemainingCount();
    }

    /* ── 무덤과 로스트 존 ── */

    yourTombCards(): readonly number[] {
        return this.battle.getYourTombCards();
    }

    opponentTombCards(): readonly number[] {
        return this.battle.getOpponentTombCards();
    }

    yourLostZoneCards(): readonly number[] {
        return this.battle.getYourLostZoneCards();
    }

    opponentLostZoneCards(): readonly number[] {
        return this.battle.getOpponentLostZoneCards();
    }
}
