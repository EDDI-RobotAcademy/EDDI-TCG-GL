import {Battle} from "../battle/Battle";
import {TurnOwner} from "../battle/TurnOwner";
import {CardCatalog} from "../ability/CardCatalog";
import {ChoicePick} from "../battle/PendingChoice";
import {CardRace} from "../../../card/race";
import {SkillType} from "../../../card/SkillType";
import {findCardRule} from "../card/CardRegistry";

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
    constructor(
        private readonly battle: Battle,
        private readonly catalog: CardCatalog,
    ) {}

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

    /* ── 내가 지금 무엇을 할 수 있나 ── */

    // 이 공격이 누구를 치는가. 대상을 골라야 하는 공격인지가 여기서 갈린다.
    //
    // 얼마나 아픈지는 안 알려 준다. 그것은 명령을 받은 전투가 정한다 (R2-99).
    attackRange(cardId: number, slot: 1 | 2 | null): SkillType {
        if (slot === null) return SkillType.Single;
        return this.catalog.getSkill(cardId, slot)?.range ?? SkillType.Single;
    }

    // 이 스킬이 얼마를 요구하는가. 화면이 안내 문구에 쓴다.
    skillCost(cardId: number, slot: 1 | 2): ReadonlyMap<CardRace, number> {
        return this.catalog.getSkill(cardId, slot)?.cost ?? new Map();
    }

    // 이 스킬을 쓸 만큼 에너지가 붙어 있는가. 모자란 종족 하나를 돌려준다.
    //
    // 총량으로 보면 [언데드 둘 필요 / 휴먼 둘 보유] 가 통과되므로 종족별로 대조한다.
    missingSkillEnergy(
        battleCardId: number, cardId: number, slot: 1 | 2,
    ): {race: CardRace; need: number; have: number} | null {
        const cost = this.catalog.getSkill(cardId, slot)?.cost;
        if (!cost) return null;
        const unit = this.battle.findOnYourField(battleCardId);
        for (const [race, need] of cost) {
            const have = unit?.getEnergyOfRace(race) ?? 0;
            if (have < need) return {race, need, have};
        }
        return null;
    }

    // 지금 기다리는 고르기에서 이것을 고르면 쓰러지는가.
    //
    // 연출을 시작하기 전에 알아야 한다. 죽는 일격이면 갈라진 카드를 안 되돌려서, 조각이
    // 흩어진 자리가 그대로 사망이 된다. 연출 뒤에 알면 카드가 깜빡인다 (R2-105).
    wouldDefeat(pick: ChoicePick): boolean {
        const choice = this.battle.getPendingChoice();
        if (!choice || pick.kind !== 'opponentUnit') return false;

        const unit = this.battle.findOnOpponentField(pick.battleCardId);
        if (!unit) return false;

        const rule = findCardRule(choice.cardId);
        if (!rule?.choiceDamage) return false;
        const damage = rule.choiceDamage(
            {battle: this.battle, catalog: this.catalog}, choice, pick,
        );
        return unit.getHp() - damage <= 0;
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
