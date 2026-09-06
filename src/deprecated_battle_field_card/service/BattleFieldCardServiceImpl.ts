import {BattleFieldCard} from "../entity/BattleFieldCard";
import {CardStatus} from "../entity/CardStatus";
import {BattleFieldCardService} from "./BattleFieldCardService";
import {BattleFieldCardRepository} from "../repository/BattleFieldCardRepository";
import {BattleFieldCardRepositoryImpl} from "../repository/BattleFieldCardRepositoryImpl";
import {BattleFieldCardSceneCache} from "../../battle/card/scene/cache/BattleFieldCardSceneCache";
import {BattleFieldCardSceneCacheImpl} from "../../battle/card/scene/cache/BattleFieldCardSceneCacheImpl";
import {BattleFieldCardPositionStore} from "../../battle/card/position/store/BattleFieldCardPositionStore";
import {BattleFieldCardPositionStoreImpl} from "../../battle/card/position/store/BattleFieldCardPositionStoreImpl";
import {BattleFieldCardPosition} from "../../battle/card/position/entity/BattleFieldCardPosition";
import {Vector2d} from "../../common/math/Vector2d";

export class BattleFieldCardServiceImpl implements BattleFieldCardService {
    private static instance: BattleFieldCardServiceImpl;

    private battleFieldCardRepository: BattleFieldCardRepository;
    private battleFieldCardSceneCache: BattleFieldCardSceneCache;
    private battleFieldCardPositionStore: BattleFieldCardPositionStore;

    private readonly HALF: number = 0.5;
    private readonly GAP_OF_EACH_CARD: number = 0.094696
    private readonly HAND_X_CRITERIA: number = 0.311904
    private readonly HAND_Y_CRITERIA: number = 0.972107
    private readonly HAND_INITIAL_X: number = this.HAND_X_CRITERIA - this.HALF;
    private readonly HAND_INITIAL_Y: number = this.HALF - this.HAND_Y_CRITERIA;

    private readonly CARD_WIDTH: number = 0.06493506493
    private readonly CARD_HEIGHT: number = this.CARD_WIDTH * 1.615

    private constructor(repository: BattleFieldCardRepository,
                        sceneRepository: BattleFieldCardSceneCache,
                        handPositionRepository: BattleFieldCardPositionStore) {
        this.battleFieldCardRepository = repository;
        this.battleFieldCardSceneCache = sceneRepository;
        this.battleFieldCardPositionStore = handPositionRepository;
    }

    public static getInstance(repository: BattleFieldCardRepository = BattleFieldCardRepositoryImpl.getInstance(),
                              sceneRepository: BattleFieldCardSceneCache = BattleFieldCardSceneCacheImpl.getInstance(),
                              handPositionRepository: BattleFieldCardPositionStore = BattleFieldCardPositionStoreImpl.getInstance()): BattleFieldCardServiceImpl {
        if (!BattleFieldCardServiceImpl.instance) {
            BattleFieldCardServiceImpl.instance = new BattleFieldCardServiceImpl(
                repository, sceneRepository, handPositionRepository);
        }
        return BattleFieldCardServiceImpl.instance;
    }

    create(cardId: number, status: CardStatus = CardStatus.HAND): BattleFieldCard {
        const handPositionCount = this.battleFieldCardPositionStore.count()
        const handPositionX = (this.HAND_INITIAL_X + handPositionCount * this.GAP_OF_EACH_CARD) * window.innerWidth;
        const handPositionY = this.HAND_INITIAL_Y * window.innerHeight
            + (this.CARD_HEIGHT * this.HALF * window.innerWidth);
        const handPosition = new Vector2d(handPositionX, handPositionY);

        // BattleFieldCardPosition
        // this.battleFieldCardPositionRepository.save()
        // this.battleFieldCardSceneCache.create(cardId)
        // this.battleFieldCardRepository.save(cardSceneId, positionId, attributeMarkIdList, status);

        return this.battleFieldCardRepository.save(1, 1, [1], status);
    }
}
