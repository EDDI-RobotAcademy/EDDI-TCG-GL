import {Battle} from "../domain/battle/Battle";
import {BattleSnapshot} from "../domain/battle/BattleSnapshot";
import {BattleSession} from "./BattleSession";
import {BattleCommand} from "../domain/flow/BattleCommand";
import {BattleEvent} from "../domain/flow/BattleEvent";
import {BattleCommandHandler} from "../domain/flow/BattleCommandHandler";
import {CardCatalog} from "../domain/ability/CardCatalog";
import {BattleReadModel} from "../domain/read/BattleReadModel";

export class BattleSessionImpl implements BattleSession {
    private static instance: BattleSessionImpl | null = null;

    private current: Battle | null = null;
    // 이 판의 규칙을 구동하는 것. 판과 함께 생기고 판과 함께 사라진다.
    private handler: BattleCommandHandler | null = null;
    private readModel: BattleReadModel | null = null;

    private constructor() {}

    static getInstance(): BattleSessionImpl {
        if (!BattleSessionImpl.instance) {
            BattleSessionImpl.instance = new BattleSessionImpl();
        }
        return BattleSessionImpl.instance;
    }

    restore(snapshot: BattleSnapshot, catalog: CardCatalog): void {
        const battle = Battle.restore(snapshot);
        this.current = battle;
        this.handler = new BattleCommandHandler(catalog);
        this.readModel = new BattleReadModel(battle, catalog);
    }

    // 사용자가 한 일 하나를 규칙에 걸고, 무슨 일이 있었는지 돌려준다.
    //
    // 부르는 쪽은 규칙이 어디서 도는지 모른다. 지금은 이 안에서 돌고, 네트워크가 붙으면
    // 서버에서 돈다. 바뀌는 곳은 이 함수 안이다.
    send(command: BattleCommand): BattleEvent[] {
        if (!this.current || !this.handler) {
            throw new Error("진행 중인 전투가 없습니다.");
        }
        return this.handler.handle(this.current, command);
    }

    read(): BattleReadModel {
        if (!this.readModel) {
            throw new Error("진행 중인 전투가 없습니다.");
        }
        return this.readModel;
    }

    end(): void {
        this.current = null;
        this.handler = null;
        this.readModel = null;
    }
}
