import {Vector2d} from "../../common/math/Vector2d";
import {ExtraUsefulEffectInfo} from "./ExtraUsefulEffectInfo";
import {HarmfulEffectInfo} from "./HarmfulEffectInfo";
import {AttachedEnergyInfo} from "./AttachedEnergyInfo";
import {BattleFieldUnitSnapshot} from "./BattleFieldUnitSnapshot";

export class BattleFieldUnit {
    private static nextId: number = 1;
    private id: number;

    private extraUsefulEffectInfo: ExtraUsefulEffectInfo | null = null
    private harmfulEffectInfo: HarmfulEffectInfo | null = null

    private attachedEnergyInfo: AttachedEnergyInfo | null = null

    private cardId: number | null = null
    private weaponId: number | null = null
    private hpId: number | null = null
    private energyId: number | null = null
    private raceId: number | null = null

    private localTranslationPosition: Vector2d | null = null

    private ERROR: number = -1

    constructor(
        cardId: number,
        weaponId: number,
        hpId: number,
        energyId: number = 0,
        raceId: number,
        localTranslationPosition: Vector2d | null = null,
        extraUsefulEffectInfo: ExtraUsefulEffectInfo | null = null,
        harmfulEffectInfo: HarmfulEffectInfo | null = null,
        attachedEnergyInfo: AttachedEnergyInfo | null = null,
    ) {
        this.id = BattleFieldUnit.nextId++;

        this.cardId = cardId
        this.weaponId = weaponId
        this.hpId = hpId
        this.energyId = energyId
        this.raceId = raceId

        this.localTranslationPosition = localTranslationPosition

        this.extraUsefulEffectInfo = extraUsefulEffectInfo
        this.harmfulEffectInfo = harmfulEffectInfo
        this.attachedEnergyInfo = attachedEnergyInfo
    }

    // 적어 둔 것으로 되돌린다. 번호를 그대로 살려야 재접속 뒤에도 같은 유닛을 가리킨다.
    public static restore(snapshot: BattleFieldUnitSnapshot): BattleFieldUnit {
        const unit = new BattleFieldUnit(
            snapshot.cardId,
            snapshot.weaponId,
            snapshot.hpId,
            snapshot.energyId,
            snapshot.raceId,
            new Vector2d(snapshot.x, snapshot.y),
        );
        unit.id = snapshot.id;
        if (BattleFieldUnit.nextId <= snapshot.id) {
            BattleFieldUnit.nextId = snapshot.id + 1;
        }
        return unit;
    }

    public getId(): number {
        return this.id;
    }

    // 지금 상태를 적는다.
    public toSnapshot(): BattleFieldUnitSnapshot {
        const position = this.getLocalTranslationPosition();
        return {
            id: this.id,
            cardId: this.getCardId(),
            weaponId: this.getWeaponId(),
            hpId: this.getHpId(),
            energyId: this.getEnergyId(),
            raceId: this.getRaceId(),
            x: position.getX(),
            y: position.getY(),
        };
    }

    public getLocalTranslationPosition(): Vector2d {
        if (!this.localTranslationPosition) { return new Vector2d(0, 0) }

        return this.localTranslationPosition
    }

    public getCardId(): number {
        if (!this.cardId) { return this.ERROR }

        return this.cardId
    }

    public getWeaponId(): number {
        if (!this.weaponId) { return this.ERROR }

        return this.weaponId
    }

    public getHpId(): number {
        if (!this.hpId) { return this.ERROR }

        return this.hpId
    }

    public getEnergyId(): number {
        if (!this.energyId) { return this.ERROR }

        return this.energyId
    }

    public getRaceId(): number {
        if (!this.raceId) { return this.ERROR }

        return this.raceId
    }

    public getExtraUsefulEffectInfo(): ExtraUsefulEffectInfo | null {
        if (!this.extraUsefulEffectInfo) { return null }

        return this.extraUsefulEffectInfo
    }

    public getHarmfulEffectInfo(): HarmfulEffectInfo | null {
        if (!this.harmfulEffectInfo) { return null }

        return this.harmfulEffectInfo
    }

    public getAttachedEnergyInfo(): AttachedEnergyInfo | null {
        if (!this.attachedEnergyInfo) { return null }

        return this.attachedEnergyInfo
    }
}