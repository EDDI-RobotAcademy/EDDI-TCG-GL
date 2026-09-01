import {YourFieldRepository} from "../../../battle/field/your/repository/YourFieldRepository";
import {BattleFieldCardAttributeMarkRepository} from "../../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepository";
import {BattleFieldCardAttributeMarkSceneRepository} from "../../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepository";
import {YourFieldRepositoryImpl} from "../../../battle/field/your/repository/YourFieldRepositoryImpl";
import {BattleFieldCardAttributeMarkRepositoryImpl} from "../../../battle_field_card_attribute_mark/repository/BattleFieldCardAttributeMarkRepositoryImpl";
import {BattleFieldCardAttributeMarkSceneRepositoryImpl} from "../../../battle_field_card_attribute_mark_scene/repository/BattleFieldCardAttributeMarkSceneRepositoryImpl";
import {BattleFieldCardAttributeMark} from "../../../battle_field_card_attribute_mark/entity/BattleFieldCardAttributeMark";
import {BattleFieldCardAttributeMarkScene} from "../../../battle_field_card_attribute_mark_scene/entity/BattleFieldCardAttributeMarkScene";

export class YourFieldAttributeMarkManager {
    private static instance: YourFieldAttributeMarkManager;

    private yourFieldRepository: YourFieldRepository
    private battleFieldCardAttributeMarkRepository: BattleFieldCardAttributeMarkRepository
    private battleFieldCardAttributeMarkSceneRepository: BattleFieldCardAttributeMarkSceneRepository

    private constructor() {
        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkRepository = BattleFieldCardAttributeMarkRepositoryImpl.getInstance()
        this.battleFieldCardAttributeMarkSceneRepository = BattleFieldCardAttributeMarkSceneRepositoryImpl.getInstance()
    } // 외부에서 인스턴스 생성 방지

    public static getInstance(): YourFieldAttributeMarkManager {
        if (!YourFieldAttributeMarkManager.instance) {
            YourFieldAttributeMarkManager.instance = new YourFieldAttributeMarkManager();
        }
        return YourFieldAttributeMarkManager.instance;
    }

    // 속성 마크 ID 목록 가져오기
    public getAttributeMarkIdList(cardSceneId: number): number[] {
        const result = this.yourFieldRepository.findAttributeMarkIdListByCardSceneId(cardSceneId);
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
