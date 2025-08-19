import {GeneralAttackUnitParams} from "./parameter/GeneralAttackUnitParams";

export class GeneralAttackUnitHandler {
    private static instance: GeneralAttackUnitHandler;

    private constructor() {}

    public static getInstance(): GeneralAttackUnitHandler {
        if (!GeneralAttackUnitHandler.instance) {
            GeneralAttackUnitHandler.instance = new GeneralAttackUnitHandler();
        }
        return GeneralAttackUnitHandler.instance;
    }

    public async handle(params: GeneralAttackUnitParams): Promise<void> {
        const { selectedYourFieldCard, opponentFieldCardScene, weaponScene, scene } = params;

        console.log("GENERAL_ATTACK_UNIT 시작");
        console.log("선택한 내 카드:", selectedYourFieldCard);
        console.log("공격 대상 상대 카드:", opponentFieldCardScene);
        console.log("사용 무기:", weaponScene);
    }

    // public async handle(): Promise<void> {
    //     console.log("GENERAL_ATTACK_UNIT 처리");

        // // OPPONENT_FIELD 영역 클릭 감지
        // const opponentFieldSceneList = this.opponentFieldCardSceneRepository.findAll();
        // const clickedOpponentFieldCardScene = this.leftClickHandDetectRepository.isYourHandAreaClicked(
        //     { x, y },
        //     opponentFieldSceneList,
        //     this.camera
        // );
        //
        // if (clickedOpponentFieldCardScene === null) {
        //     console.log('클릭한 요소 찾지 못함');
        //     return;
        // }
        //
        // const clickedOpponentFieldCardSceneId = clickedOpponentFieldCardScene.getId();
        //
        // if (this.activePanelAreaRepository.exists()) {
        //     console.log(`공격 대상 Scene: ${JSON.stringify(clickedOpponentFieldCardScene, null, 2)}`);
        //
        //     // OpponentField 엔티티 조회
        //     const opponentFieldEntity = this.opponentFieldRepository.findByCardSceneId(clickedOpponentFieldCardSceneId);
        //     if (!opponentFieldEntity) return;
        //
        //     const targetCardId = opponentFieldEntity.cardId;
        //     console.log(`공격 대상 카드 id: ${targetCardId}`);
        //
        //     const targetAttributeMarkIdList = opponentFieldEntity.getAttributeMarkIdList();
        //
        //     const targetAttributeMarkList = await Promise.all(
        //         targetAttributeMarkIdList.map(id => this.battleFieldCardAttributeMarkRepository.findById(id))
        //     );
        //
        //     const validTargetMarkList = targetAttributeMarkList.filter((mark): mark is BattleFieldCardAttributeMark => mark !== null);
        //     console.log(`validTargetMarkList: ${validTargetMarkList}`)
        //
        //     const opponentFieldCardScene = this.opponentFieldCardSceneRepository.findById(clickedOpponentFieldCardSceneId)
        //     if (opponentFieldCardScene == null) return;
        //
        //     const opponentCardGroup = new THREE.Group();
        //     this.scene.remove(opponentFieldCardScene.getMesh());
        //     opponentCardGroup.add(opponentFieldCardScene.getMesh());
        //
        //     for (const id of targetAttributeMarkIdList) {
        //         const mark = await this.opponentFieldCardAttributeMarkRepository.findById(id);
        //         if (!mark) continue;
        //
        //         const markScene = await this.opponentFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
        //         if (!markScene) continue;
        //
        //         this.scene.remove(markScene.getMesh());
        //         opponentCardGroup.add(markScene.getMesh());
        //     }
        //
        //     this.scene.add(opponentCardGroup);
        //
        //     const selectedYourFieldCard = this.dragMoveRepository.getSelectedObject() as unknown as YourFieldCardScene;
        //     const yourFieldCardId = selectedYourFieldCard.getId()
        //     console.log(`yourFieldCardId: ${yourFieldCardId}`)
        //
        //     const yourFieldCard = this.yourFieldRepository.findById(yourFieldCardId);
        //     if (yourFieldCard == null) return;
        //
        //     const cardId = yourFieldCard.getCardId()
        //     if (cardId == null) return;
        //     console.log(`공격 진행자 cardId: ${cardId}`)
        //
        //     const attributeMarkIdList = yourFieldCard.getAttributeMarkIdList();
        //
        //     const attributeMarkList = await Promise.all(
        //         attributeMarkIdList.map(id => this.battleFieldCardAttributeMarkRepository.findById(id))
        //     );
        //
        //     const validMarkList = attributeMarkList.filter((mark): mark is BattleFieldCardAttributeMark => mark !== null);
        //     console.log(`validMarkList: ${validMarkList}`)
        //
        //     let weaponScene: BattleFieldCardAttributeMarkScene | null = null;
        //
        //     const cardSceneId = yourFieldCard.getCardSceneId()
        //     if (cardSceneId == null) return;
        //
        //     const yourFieldCardScene = this.yourFieldCardSceneRepository.findById(cardSceneId)
        //     if (yourFieldCardScene == null) return;
        //
        //     const cardGroup = new THREE.Group();
        //     this.scene.remove(yourFieldCardScene.getMesh());
        //     cardGroup.add(yourFieldCardScene.getMesh());
        //
        //     for (const id of attributeMarkIdList) {
        //         const mark = await this.battleFieldCardAttributeMarkRepository.findById(id);
        //         if (!mark) continue;
        //
        //         const markScene = await this.battleFieldCardAttributeMarkSceneRepository.findById(mark.attributeMarkSceneId);
        //         if (!markScene) continue;
        //
        //         if (markScene.getMarkSceneType() === MarkSceneType.SWORD ||
        //             markScene.getMarkSceneType() === MarkSceneType.STAFF) {
        //             weaponScene = markScene;
        //             continue
        //         }
        //
        //         this.scene.remove(markScene.getMesh());
        //         cardGroup.add(markScene.getMesh());
        //     }
        //
        //     this.scene.add(cardGroup);
        //
        //     console.log(`weaponScene: ${weaponScene}`)
        //     if (!weaponScene) return;
        //
        //     this.activePanelAreaRepository.delete()
        //     this.deactivateExistNeonBorder(selectedYourFieldCard)
        //     this.deactivateEveryExistOpponentNeonBorder()
        //     this.deactivateOpponentMasterNeonBorder()
        //
        //     await this.attackWithWeapon(weaponScene, cardGroup, opponentCardGroup, clickedOpponentFieldCardScene);
        // }
    // }
}
