import {BattleRepositoryImpl} from "../../../battle/repository/BattleRepositoryImpl";
import {BattleFieldCardAttributeMarkStore} from "../../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStore";
import {BattleFieldCardAttributeMarkSceneCache} from "../../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCache";
import {BattleFieldCardAttributeMarkStoreImpl} from "../../../battle/card/attribute_mark/store/BattleFieldCardAttributeMarkStoreImpl";
import {BattleFieldCardAttributeMarkSceneCacheImpl} from "../../../battle/card/attribute_mark_scene/cache/BattleFieldCardAttributeMarkSceneCacheImpl";
import {BattleFieldCardAttributeMark} from "../../../battle/card/attribute_mark/entity/BattleFieldCardAttributeMark";
import {BattleFieldCardAttributeMarkScene} from "../../../battle/card/attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";

export class YourFieldAttributeMarkManager {
    private static instance: YourFieldAttributeMarkManager;
    private battleFieldCardAttributeMarkStore: BattleFieldCardAttributeMarkStore
    private battleFieldCardAttributeMarkSceneCache: BattleFieldCardAttributeMarkSceneCache

    private constructor() {
        this.battleFieldCardAttributeMarkStore = BattleFieldCardAttributeMarkStoreImpl.getInstance()
        this.battleFieldCardAttributeMarkSceneCache = BattleFieldCardAttributeMarkSceneCacheImpl.getInstance()
    } // 외부에서 인스턴스 생성 방지

    public static getInstance(): YourFieldAttributeMarkManager {
        if (!YourFieldAttributeMarkManager.instance) {
            YourFieldAttributeMarkManager.instance = new YourFieldAttributeMarkManager();
        }
        return YourFieldAttributeMarkManager.instance;
    }

    // 속성 마크 ID 목록 가져오기
    public getAttributeMarkIdList(cardSceneId: number): number[] {
        const result = BattleRepositoryImpl.getInstance().getCurrentOrThrow().findOnYourField(cardSceneId)?.getAttributeMarkIds() ?? null;
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
