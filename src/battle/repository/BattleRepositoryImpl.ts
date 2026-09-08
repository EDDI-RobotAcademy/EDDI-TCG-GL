import {Battle} from "../domain/Battle";
import {BattleSnapshot} from "../domain/BattleSnapshot";
import {BattleRepository} from "./BattleRepository";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class BattleRepositoryImpl implements BattleRepository {
    private static instance: BattleRepositoryImpl | null = null;

    private current: Battle | null = null;

    private constructor() {}

    static getInstance(): BattleRepositoryImpl {
        if (!BattleRepositoryImpl.instance) {
            BattleRepositoryImpl.instance = new BattleRepositoryImpl();
        }
        return BattleRepositoryImpl.instance;
    }

    start(): Battle {
        this.current = Battle.start(IdGenerator.generateId("Battle"));
        return this.current;
    }

    restore(snapshot: BattleSnapshot): Battle {
        this.current = Battle.restore(snapshot);
        return this.current;
    }

    getCurrent(): Battle | null {
        return this.current;
    }

    getCurrentOrThrow(): Battle {
        if (!this.current) {
            throw new Error("진행 중인 전투가 없습니다.");
        }
        return this.current;
    }

    end(): void {
        this.current = null;
    }
}
