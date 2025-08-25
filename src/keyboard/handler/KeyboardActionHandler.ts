import { KeyboardAction } from "../entity/KeyboardAction";
import {BattleFieldHandMapRepository} from "../../battle_field_hand/repository/BattleFieldHandMapRepository";
import {BattleFieldHandMapRepositoryImpl} from "../../battle_field_hand/repository/BattleFieldHandMapRepositoryImpl";

export class KeyboardActionHandler {
    private static instance: KeyboardActionHandler | null = null;
    private actionTable: Map<KeyboardAction, () => void>;

    private battleFieldHandMapRepository: BattleFieldHandMapRepository;

    private constructor() {
        this.battleFieldHandMapRepository = BattleFieldHandMapRepositoryImpl.getInstance();

        this.actionTable = new Map<KeyboardAction, () => void>([
            [KeyboardAction.DEPLOY, () => {
                console.log("Handler: Deploying units...");
                // TODO: 실제 배치 로직
            }],
            [KeyboardAction.DRAW, () => {
                console.log("Handler: Drawing a card...");
                this.battleFieldHandMapRepository.addBattleFieldHand(27)

                const currentHand = this.battleFieldHandMapRepository.getBattleFieldHandList();
                if (currentHand.length >= 5) {
                    console.log("Handler: 페이지 생성 필요함.");

                }
            }],
        ]);
    }

    static getInstance(): KeyboardActionHandler {
        if (!KeyboardActionHandler.instance) {
            KeyboardActionHandler.instance = new KeyboardActionHandler();
        }
        return KeyboardActionHandler.instance;
    }

    execute(action: KeyboardAction): void {
        const handler = this.actionTable.get(action);
        if (handler) {
            handler();
        } else {
            console.warn(`Handler: No handler registered for action ${action}`);
        }
    }
}
