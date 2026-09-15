import {Battle} from "../domain/battle/Battle";
import {BattleSnapshot} from "../domain/battle/BattleSnapshot";
import {BattleSession} from "./BattleSession";
import {IdGenerator} from "../../common/id_generator/IdGenerator";

export class BattleSessionImpl implements BattleSession {
    private static instance: BattleSessionImpl | null = null;

    private current: Battle | null = null;

    private constructor() {}

    static getInstance(): BattleSessionImpl {
        if (!BattleSessionImpl.instance) {
            BattleSessionImpl.instance = new BattleSessionImpl();
        }
        return BattleSessionImpl.instance;
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
