import { BattleFieldCardAttributeMark } from "../../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import { BattleFieldCardAttributeMarkScene } from "../../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";
import {BattleFieldHandRepository} from "../../../battle/hand/repository/BattleFieldHandRepository";
import {BattleFieldCardAttributeMarkRepository} from "../../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {BattleFieldHandRepositoryImpl} from "../../../battle/hand/repository/BattleFieldHandRepositoryImpl";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";

export class YourHandAttributeMarkManager {
    private static instance: YourHandAttributeMarkManager;

    private battleFieldHandRepository: BattleFieldHandRepository
    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository

    private constructor() {
        this.battleFieldHandRepository = BattleFieldHandRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance()
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
            this.battleFieldCardAttributeMarkRepository.findById(id)
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
            this.battleFieldCardAttributeMarkSceneRepository.findById(attributeMark.attributeMarkSceneId)
        );

        const sceneResults = await Promise.all(scenePromises);

        // null 값을 제외한 장면 반환
        return sceneResults.filter(
            (scene): scene is BattleFieldCardAttributeMarkScene => scene !== null
        );
    }
}
