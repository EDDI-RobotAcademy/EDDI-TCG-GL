import * as THREE from "three";
import {NonBackgroundImage} from "../shape/image/NonBackgroundImage";
import {CardState} from "../card/state";
import {BattleFieldUnit} from "../battle/unit/entity/BattleFieldUnit";
import {BattleFieldUnitRepository} from "../battle/unit/repository/BattleFieldUnitRepository";
import {getCardById} from "../card/utility";
import {Vector2d} from "../common/math/Vector2d";
import {UnitCardGenerator} from "../card/unit/generate";
import {BufferGeometry, Material, Mesh} from "three";
import {CardStateManager} from "../card/CardStateManager";

export class LegacyDragAndDropManager {
    private static instance: LegacyDragAndDropManager;
    private selectedObject: THREE.Object3D | null = null;
    private offset = new THREE.Vector3();
    private lastPosition = new THREE.Vector3();
    private selectedGroup: THREE.Object3D[] = [];
    private isDragging = false;
    private raycaster = new THREE.Raycaster();
    private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    private background: NonBackgroundImage | null = null; // 배경 객체를 설정할 변수

    private targetShape: THREE.Object3D | null = null;
    private targetInsideState: CardState | null = null;

    private originalPositionMap: Map<THREE.Object3D, THREE.Vector3> = new Map();

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {}

    public static getInstance(camera: THREE.Camera, scene: THREE.Scene): LegacyDragAndDropManager {
        if (!LegacyDragAndDropManager.instance) {
            LegacyDragAndDropManager.instance = new LegacyDragAndDropManager(camera, scene);
        }
        return LegacyDragAndDropManager.instance;
    }

    public static getExistingInstance(): LegacyDragAndDropManager | null {
        return LegacyDragAndDropManager.instance || null; // 존재하지 않으면 null 반환
    }

    // 배경을 설정하는 메소드
    public setBackground(backgroundObject: NonBackgroundImage | null): void {
        this.background = backgroundObject;
    }

    public setTargetShape(targetShape: THREE.Object3D | null, cardState: CardState | null): void {
        this.targetShape = targetShape;
        this.targetInsideState = cardState;
    }

    public getTargetShape(): THREE.Object3D | null {
        return this.targetShape;
    }

    public onMouseDown(event: MouseEvent): void {
        const mouse = this.getNormalizedMouseCoords(event);
        this.raycaster.setFromCamera(mouse, this.camera);

        console.log('this.background?.getMesh():', this.background?.getMesh());
        const intersects = this.raycaster.intersectObjects(
            this.scene.children.filter(child => child !== this.background?.getMesh())
        );

        console.log('intersects:', intersects)

        if (intersects.length > 0) {
            this.selectedObject = intersects[0].object;
            console.log('Selected Object:', this.selectedObject);

            if (this.selectedObject.userData.cardNumber !== undefined) {
                console.log("Selected Card Number:", this.selectedObject.userData.cardNumber);
            }

            // 저장: 선택된 객체와 관련된 모든 객체의 위치 저장
            this.lastPosition.copy(this.selectedObject.position);
            this.selectedGroup = this.getAssociatedObjects(this.selectedObject);

            console.log('Selected Group:', this.selectedGroup);

            // 선택된 객체의 위치와 그룹 내 모든 객체들의 위치 저장
            this.originalPositionMap.set(this.selectedObject, this.lastPosition.clone());
            this.selectedGroup.forEach((obj) => {
                this.originalPositionMap.set(obj, obj.position.clone());
            });

            this.offset.copy(intersects[0].point).sub(this.lastPosition);
            this.isDragging = true;

            console.log('Offset:', this.offset);
        } else {
            console.log('No object selected at mouse down');
        }
    }

    public onMouseMove(event: MouseEvent): void {
        if (this.isDragging && this.selectedObject) {
            const mouse = this.getNormalizedMouseCoords(event);

            this.raycaster.setFromCamera(mouse, this.camera);
            const intersection = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.plane, intersection);

            console.log('Mouse move intersection:', intersection);

            const newPosition = intersection.sub(this.offset);
            console.log('New Position:', newPosition);

            this.selectedObject.position.copy(newPosition);

            const movement = newPosition.clone().sub(this.lastPosition);
            console.log('Movement vector:', movement);

            this.selectedGroup.forEach((obj) => {
                obj.position.add(movement.clone());
                console.log('Object moved:', obj);
            });

            this.lastPosition.copy(newPosition);
        }
    }

    public onMouseUp(): void {
        this.isDragging = false;

        // 드래그된 객체가 타겟 객체 안에 있는지 체크
        if (this.selectedObject && this.targetShape) {
            const intersects = this.raycaster.intersectObject(this.targetShape);
            console.log('Raycast intersects with targetShape:', intersects);

            if (intersects.length > 0) {
                console.log("Dropped inside the target shape");

                const cardMesh = this.selectedObject;
                const cardNumber = this.selectedObject.userData.cardNumber;
                if (cardNumber !== undefined) {
                    const repository = BattleFieldUnitRepository.getInstance();
                    const currentUnitCount = repository.getBattleFieldUnitList().length

                    console.log(`Valid card detected with number: ${cardNumber}, currentUnitCount: ${currentUnitCount}`);

                    const card = getCardById(cardNumber);
                    const weaponId = card?.공격력 ?? 0;  // 기본값 0
                    const hpId = card?.체력 ?? 0;  // 기본값 0
                    const energyId = 0;  // 에너지 ID (기본값 0)
                    const raceId = parseInt(card?.종족 ?? '0')
                    console.log('종족: ', card?.종족)
                    console.log('종족 타입: ', typeof card?.종족)

                    const targetData = this.targetShape.userData;
                    const targetLeft = -targetData.width / 2 + 0.044056 * window.innerWidth + 0.094696 * window.innerWidth * currentUnitCount;  // 사각형의 왼쪽 끝 X 좌표
                    const targetCenterY = targetData.yPos;  // 사각형의 세로 중앙 위치

                    // 드래그된 객체 크기 (예: 카드 크기)
                    const cardWidth = this.selectedObject.userData.width ?? 1;  // 카드의 가로 크기 (기본값 1)
                    const cardHeight = this.selectedObject.userData.height ?? 1;  // 카드의 세로 크기 (기본값 1)

                    // 카드가 타겟 영역의 왼쪽 끝에 맞춰지도록 계산
                    const xPosition = targetLeft;  // 사각형의 왼쪽 끝에 맞추기
                    const yPosition = targetCenterY - cardHeight / 2;  // 세로 중앙에 맞추기 (카드 높이의 반만큼 올려서 중앙 맞춤)

                    // 이동된 거리 계산
                    const deltaX = xPosition - this.selectedObject.position.x;
                    const deltaY = yPosition - this.selectedObject.position.y;
                    console.log('deltaX:', deltaX, ', deltaY:', deltaY)

                    // selectedObject를 Vector2d로 계산된 위치에 배치
                    this.selectedObject.position.set(xPosition, yPosition, 0);

                    // BattleFieldUnit 생성 (타겟 위치에 맞춰서)
                    const unit = new BattleFieldUnit(
                        cardNumber,
                        weaponId,
                        hpId,
                        energyId,
                        raceId,
                        new Vector2d(xPosition, yPosition) // Vector2d 사용
                    );

                    repository.addBattleFieldUnit(unit);

                    console.log("BattleFieldUnit added to deprecated_repository:", unit);

                    // const cardInitialInfoMap = UnitCardGenerator.getCardInitialInfoMap()
                    const handCardInitialInfoMap = CardStateManager.getAllHandCards()
                    const cardIndex = CardStateManager.getNextFieldIndex()

                    handCardInitialInfoMap.forEach((value, key) => {
                        if (value.cardMesh === cardMesh) {
                            CardStateManager.removeCardFromHand(value.cardMesh as Mesh<BufferGeometry, Material>, cardIndex);
                            console.log(`Card with mesh ${cardMesh} removed from cardInitialInfoMap.`);
                        }
                    });

                    if (this.selectedGroup && this.selectedGroup.length > 0) {
                        this.selectedGroup.forEach((obj) => {
                            const meshObj = obj as Mesh<BufferGeometry, Material>;

                            if (meshObj.position) {
                                meshObj.position.x += deltaX;
                                meshObj.position.y += deltaY;
                                console.log(`Object in group moved by delta: { x: ${deltaX}, y: ${deltaY} }`);
                            }

                            // CardStateManager.removeCardFromHand(meshObj, cardIndex);
                            console.log(`Object in group removed from hand.`);
                        });
                    } else {
                        console.log("No objects in selectedGroup to move.");
                    }

                    if (this.targetInsideState !== null) {
                        this.selectedObject.userData.state = this.targetInsideState;
                        console.log(
                            `Updated selectedObject state to: ${this.targetInsideState}`
                        );
                    }
                }
            } else {
                console.log("Dropped outside the target shape");

                // 원래 위치로 복원
                const originalPosition = this.originalPositionMap.get(this.selectedObject);
                if (originalPosition) {
                    this.selectedObject.position.copy(originalPosition); // 원래 위치로 되돌리기
                    console.log("Object returned to original position:", originalPosition);

                    // 그룹에 속한 객체들도 원래 위치로 되돌리기
                    this.selectedGroup.forEach((obj) => {
                        const originalObjPosition = this.originalPositionMap.get(obj);
                        if (originalObjPosition) {
                            obj.position.copy(originalObjPosition); // 원래 위치로 되돌리기
                            console.log("Group object returned to original position:", originalObjPosition);
                        } else {
                            console.log("No original position stored for group object:", obj);
                        }
                    });
                } else {
                    console.log("No original position found for selectedObject");
                }
            }
        }

        // 선택된 객체와 그룹 초기화
        this.selectedObject = null;
        this.selectedGroup = [];
        this.lastPosition.set(0, 0, 0);

        console.log('Selection cleared. selectedObject:', this.selectedObject, 'selectedGroup:', this.selectedGroup);
    }

    private getAssociatedObjects(object: THREE.Object3D): THREE.Object3D[] {
        const associatedObjects: THREE.Object3D[] = [];
        if (object.parent) {
            object.parent.children.forEach(child => {
                if (child !== object) {
                    associatedObjects.push(child);
                }
            });
        }
        return associatedObjects;
    }

    private getNormalizedMouseCoords(event: MouseEvent): THREE.Vector2 {
        return new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
    }
}
