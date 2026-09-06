import { BattleFieldCardAttributeMark } from "../../../battle/card/attribute_mark/entity/BattleFieldCardAttributeMark";
import { BattleFieldCardAttributeMarkScene } from "../../../battle/card/attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {BattleFieldHandRepository} from "../../../battle/hand/repository/BattleFieldHandRepository";
import {BattleFieldCardAttributeMarkStore} from "../../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStore";
import {BattleFieldCardAttributeMarkSceneCache} from "../../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCache";
import {BattleFieldHandRepositoryImpl} from "../../../battle/hand/repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardAttributeMarkStoreImpl} from "../../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStoreImpl";
import {BattleFieldCardAttributeMarkSceneCacheImpl} from "../../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCacheImpl";

export class YourHandAttributeMarkManager {
    private static instance: YourHandAttributeMarkManager;

    private battleFieldHandRepository: BattleFieldHandRepository
    private battleFieldCardAttributeMarkStore: BattleFieldCardAttributeMarkStore
    private battleFieldCardAttributeMarkSceneCache: BattleFieldCardAttributeMarkSceneCache

    private constructor() {
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkStore = BattleFieldCardAttributeMarkStoreImpl.getInstance()
        this.battleFieldCardAttributeMarkSceneCache = BattleFieldCardAttributeMarkSceneCacheImpl.getInstance()
    } // 외부에서 인스턴스 생성 방지

    public static getInstance(): YourHandAttributeMarkManager {
        if (!YourHandAttributeMarkManager.instance) {
            YourHandAttributeMarkManager.instance = new YourHandAttributeMarkManager();
        }
        return YourHandAttributeMarkManager.instance;
    }

    // 속성 마크 ID 목록 가져오기
    public getAttributeMarkIdList(cardSceneId: number): number[] {
        const result = this.battleFieldHandRepository.findAttributeMarkIdListByCardSceneId(cardSceneId);
        return result || []; // null인 경우 빈 배열 반환
    }

    // 속성 마크 객체 목록 가져오기
    public async getAttributeMarkList(attributeMarkIdList: number[]): Promise<BattleFieldCardAttributeMark[]> {
        const attributeMarkPromises = attributeMarkIdList.map(id =>
            this.battleFieldCardAttributeMarkStore.findById(id)
        );

        const attributeMarkResults = await Promise.all(attributeMarkPromises);

        // null 값을 제외한 속성 마크 반환
        return attributeMarkResults.filter(
            (attributeMark): attributeMark is BattleFieldCardAttributeMark => attributeMark !== null
        );
    }

    // 유효한 속성 마크 장면 가져오기
    public async getValidAttributeScenes(attributeMarkList: BattleFieldCardAttributeMark[]): Promise<BattleFieldCardAttributeMarkScene[]> {
        const scenePromises = attributeMarkList.map(attributeMark =>
            this.battleFieldCardAttributeMarkSceneCache.findById(attributeMark.attributeMarkSceneId)
        );

        const sceneResults = await Promise.all(scenePromises);

        // null 값을 제외한 장면 반환
        return sceneResults.filter(
            (scene): scene is BattleFieldCardAttributeMarkScene => scene !== null
        );
    }
}
