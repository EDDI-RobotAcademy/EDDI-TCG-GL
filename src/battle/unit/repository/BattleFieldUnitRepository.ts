import {BattleFieldUnit} from "../entity/BattleFieldUnit";

export class BattleFieldUnitRepository {
    private static instance: BattleFieldUnitRepository;

    private currentFieldUnitList: BattleFieldUnit[] = []
    private gapOfEachUnit: number = 200

    private unitAddedCallback: ((unit: BattleFieldUnit) => void) | null = null;

    private constructor() { }

    public static getInstance(): BattleFieldUnitRepository {
        if (!BattleFieldUnitRepository.instance) {
            BattleFieldUnitRepository.instance = new BattleFieldUnitRepository();
        }

        return BattleFieldUnitRepository.instance
    }

    public addBattleFieldUnit(unit: BattleFieldUnit): void {
        this.currentFieldUnitList.push(unit)
        if (this.unitAddedCallback) {
            this.unitAddedCallback(unit);
        }
    }

    public getBattleFieldUnitList(): BattleFieldUnit[] {
        return this.currentFieldUnitList
    }

    public setUnitAddedCallback(callback: (unit: BattleFieldUnit) => void): void {
        this.unitAddedCallback = callback;
    }
}