import * as THREE from "three";

import {RightClickDetectService} from "./RightClickDetectService";
import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";
import {MouseCursorDetectArea} from "../../mouse_cursor_detect/entity/MouseCursorDetectArea";
import {DragMoveRepository} from "../../drag_move/repository/DragMoveRepository";
import {DragMoveRepositoryImpl} from "../../drag_move/repository/DragMoveRepositoryImpl";
import {MouseCursorDetectRepositoryImpl} from "../../mouse_cursor_detect/repository/MouseCursorDetectRepositoryImpl";
import {MouseCursorDetectRepository} from "../../mouse_cursor_detect/repository/MouseCursorDetectRepository";
import {LeftClickedArea} from "../../left_click_detect/entity/LeftClickedArea";
import {ActivePanelAreaRepository} from "../../battle/active_panel/repository/ActivePanelAreaRepository";
import {ActivePanelAreaRepositoryImpl} from "../../battle/active_panel/repository/ActivePanelAreaRepositoryImpl";
import {BattleFieldCardScene} from "../../battle_field_card_scene/entity/BattleFieldCardScene";
import {getCardById} from "../../card/utility";
import {YourFieldRepository} from "../../battle/field/your/repository/YourFieldRepository";
import {YourFieldRepositoryImpl} from "../../battle/field/your/repository/YourFieldRepositoryImpl";
import {YourFieldMapRepository} from "../../battle/field/your/map/repository/YourFieldMapRepository";
import {YourFieldMapRepositoryImpl} from "../../battle/field/your/map/repository/YourFieldMapRepositoryImpl";
import {
    YourFieldCardSceneCacheImpl
} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCacheImpl";
import {YourFieldCardSceneCache} from "../../battle/field/your/card_scene/cache/YourFieldCardSceneCache";

export class RightClickDetectServiceImpl implements RightClickDetectService {
    private static instance: RightClickDetectServiceImpl | null = null;

    private cameraRepository: CameraRepository
    private dragMoveRepository: DragMoveRepository
    private mouseCursorDetectRepository: MouseCursorDetectRepository
    private activePanelAreaRepository: ActivePanelAreaRepository;
    private yourFieldRepository: YourFieldRepository;
    private yourFieldCardSceneCache: YourFieldCardSceneCache;

    private rightMouseDown: boolean = false;

    private constructor(private camera: THREE.Camera, scene: THREE.Scene) {
        this.cameraRepository = CameraRepositoryImpl.getInstance()
        this.dragMoveRepository = DragMoveRepositoryImpl.getInstance()
        this.yourFieldRepository = YourFieldRepositoryImpl.getInstance()
        this.yourFieldCardSceneCache = YourFieldCardSceneCacheImpl.getInstance()
        this.mouseCursorDetectRepository = MouseCursorDetectRepositoryImpl.getInstance()
        this.activePanelAreaRepository = ActivePanelAreaRepositoryImpl.getInstance(camera, scene);
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): RightClickDetectServiceImpl {
        if (!RightClickDetectServiceImpl.instance) {
            RightClickDetectServiceImpl.instance = new RightClickDetectServiceImpl(camera, scene);
        }
        return RightClickDetectServiceImpl.instance;
    }

    async handleRightClick(clickPoint: { x: number; y: number }): Promise<any> {
        // console.log(`handleRightClick: (${clickPoint})`)

        const selectedArea = this.dragMoveRepository.getSelectedArea()
        if (selectedArea !== LeftClickedArea.YOUR_FIELD) {
            console.log("현재 필드 유닛이 선택되지 않았습니다.");
            return;
        }

        const detectedArea = this.mouseCursorDetectRepository.detectArea(clickPoint.x, clickPoint.y);
        if (detectedArea !== MouseCursorDetectArea.YOUR_FIELD) {
            console.log("현재 필드 유닛이 선택되지 않았습니다.");
            return; // YOUR_FIELD가 아니면 즉시 종료
        }

        // console.log('Active Panel 생성 준비')

        if (this.activePanelAreaRepository.exists()) {
            console.log("기존 Active Panel 삭제");
            this.activePanelAreaRepository.delete();
            return;
        }

        const selectedObject = this.dragMoveRepository.getSelectedObject()
        if (!selectedObject) return;

        const cardScene = selectedObject as unknown as BattleFieldCardScene;
        // const mesh = cardScene.getMesh();
        // if (!mesh) return;
        //
        // const meshId = mesh.id;
        // console.log(`meshId: ${meshId}`);

        // const yourFieldCardScene = this.yourFieldCardSceneCache.findIndexByCardMeshId(meshId)

        const yourFieldCard = this.yourFieldRepository.findByCardSceneId(cardScene.getId())
        // console.log(`yourFieldCard: ${JSON.stringify(yourFieldCard, null, 2)}`);

        if (!yourFieldCard) return;

        const cardId = yourFieldCard.getCardId()

        // 새 패널 생성
        // console.log("새로운 Active Panel 생성");
        await this.activePanelAreaRepository.create(clickPoint.x, clickPoint.y, cardId);
    }

    setRightMouseDown(state: boolean): void {
        this.rightMouseDown = state;
    }

    isRightMouseDown(): boolean {
        return this.rightMouseDown;
    }
}
