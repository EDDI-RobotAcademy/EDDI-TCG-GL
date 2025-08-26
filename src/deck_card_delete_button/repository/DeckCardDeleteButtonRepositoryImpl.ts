import * as THREE from 'three';
import {DeckCardDeleteButtonRepository} from './DeckCardDeleteButtonRepository';
import {DeckCardDeleteButton} from "../entity/DeckCardDeleteButton";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";
import {MeshDestroyer} from "../../mesh/destroyer"

export class DeckCardDeleteButtonRepositoryImpl implements DeckCardDeleteButtonRepository {
    private static instance: DeckCardDeleteButtonRepositoryImpl;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private buttonMap: Map<number, { cardId: number, buttonMesh: DeckCardDeleteButton }> = new Map(); // button unique id: {card id: button mesh}
    private deckMap: Map<number, number[]> = new Map(); // deckId: button Unique ID List
    private buttonGroupMap: Map<number, THREE.Group> = new Map(); // deckId -> Group

    private originalButtonMap: Map<number, { cardId: number, buttonMesh: DeckCardDeleteButton }> = new Map();
    private originalDeckMap: Map<number, number[]> = new Map();

    private readonly BUTTON_WIDTH: number = 0.0295

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): DeckCardDeleteButtonRepositoryImpl {
        if (!DeckCardDeleteButtonRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            DeckCardDeleteButtonRepositoryImpl.instance = new DeckCardDeleteButtonRepositoryImpl(textureManager, scene);
        }
        return DeckCardDeleteButtonRepositoryImpl.instance;
    }

    public async createDeckCardDeleteButton(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardDeleteButton> {
        const texture = await this.textureManager.getTexture('deck_edit_remove_button', 2);
        if (!texture) {
            throw new Error(`Texture for Deck Card Delete Button(Deck ID: ${deckId}, Card ID: ${cardId}) not found`);
        }

        const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
        const buttonHeight = buttonWidth;

        const buttonPositionX = position.getX() * window.innerWidth;
        const buttonPositionY = position.getY() * window.innerHeight;

        const buttonMesh = MeshGenerator.createMesh(texture, buttonWidth, buttonHeight, position);
        buttonMesh.position.set(buttonPositionX, buttonPositionY, 0);

        const newButton = new DeckCardDeleteButton(buttonMesh, position);
        this.buttonMap.set(newButton.id, { cardId, buttonMesh: newButton });

        if (!this.deckMap.has(deckId)) {
            this.deckMap.set(deckId, []);
        }
        const buttonIdList = this.deckMap.get(deckId)!;
        buttonIdList.push(newButton.id);
        this.deckMap.set(deckId, buttonIdList);

        return newButton;
    }

    public findButtonByCardId(cardId: number): DeckCardDeleteButton | null {
        for (const { cardId: storedCardId, buttonMesh } of this.buttonMap.values()) {
            if (storedCardId === cardId) {
                return buttonMesh;
            }
        }
        return null;
    }

    public findButtonByButtonUniqueId(buttonUniqueId: number): DeckCardDeleteButton | null {
        return this.buttonMap.get(buttonUniqueId)?.buttonMesh ?? null;
    }

    public findCardIdByButtonUniqueId(buttonUniqueId: number): number | null {
        return this.buttonMap.get(buttonUniqueId)?.cardId ?? null;
    }

    public findCardIdByButtonMesh(targetButtonMesh: DeckCardDeleteButton): number | null {
        for (const { cardId, buttonMesh } of this.buttonMap.values()) {
            if (buttonMesh === targetButtonMesh) {
                return cardId;
            }
        }
        return null;
    }

    public findButtonByDeckIdAndCardId(deckId: number, cardId: number): DeckCardDeleteButton | null {
        const buttonIdList = this.deckMap.get(deckId);
        if (!buttonIdList) {
            return null;
        }

        for (const buttonId of buttonIdList) {
            const button = this.buttonMap.get(buttonId);
            if (button && button.cardId === cardId) {
                return button.buttonMesh;
            }
        }
        return null;
    }

    public findButtonIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const buttonIdList = this.deckMap.get(deckId);
        if (!buttonIdList) {
            return null;
        }

        for (const buttonId of buttonIdList) {
            const button = this.buttonMap.get(buttonId);
            if (button && button.cardId === cardId) {
                return buttonId;
            }
        }
        return null;
    }

    public findButtonListByDeckId(deckId: number): DeckCardDeleteButton[] | null {
        const buttonIdList = this.deckMap.get(deckId);
        if (buttonIdList === undefined) {
            return null;
        }

        const buttonMeshList: DeckCardDeleteButton[] = [];
        buttonIdList.forEach((buttonId) => {
            const buttonMesh = this.findButtonByButtonUniqueId(buttonId);
            if (buttonMesh) {
                buttonMeshList.push(buttonMesh);
            } else {
                console.warn(`[WARN] Button with Unique ID ${buttonId} not found in buttonMap`);
            }
        });

        return buttonMeshList;
    }

    public findButtonIdListByDeckId(deckId: number): number[] {
        return this.deckMap.get(deckId) || [];
    }

    public findDeckIdList(): number[] {
        return Array.from(this.deckMap.keys());
    }

    public findButtonCountByDeckId(deckId: number): number {
        const buttonIdList = this.deckMap.get(deckId);
        return buttonIdList ? buttonIdList.length : 0;
    }

    public saveButtonGroupByDeckId(deckId: number): void {
        const buttonIdList = this.deckMap.get(deckId);
        if (!buttonIdList) {
            throw new Error(`Deck with ID ${deckId} not found`);
        }

        const buttonGroup = new THREE.Group();
        buttonIdList.forEach(buttonId => {
            const button = this.buttonMap.get(buttonId);
            if (button) {
                buttonGroup.add(button.buttonMesh.getMesh());
            } else {
                console.warn(`[WARN] Button with Unique ID ${buttonId} not found in buttonMap`);
            }
        });

        this.buttonGroupMap.set(deckId, buttonGroup);
    }

    public findButtonGroupByDeckId(deckId: number): THREE.Group {
        const buttonGroup = this.buttonGroupMap.get(deckId);
        if (!buttonGroup) {
            throw new Error(`Button Group with Deck ID ${deckId} not found`);
        }
        return buttonGroup;
    }

    public resetButtonGroup(): void {
        this.buttonGroupMap.clear();
    }

    // 특정 덱의 특정 버튼 삭제
    public deleteButtonByDeckIdAndButtonId(deckId: number, buttonUniqueId: number): void {
        const buttonInfo = this.buttonMap.get(buttonUniqueId);
        if (buttonInfo) {
            this.meshDestroyer.destroyMesh(buttonInfo.buttonMesh.getMesh());

            const group = this.buttonGroupMap.get(deckId);
            if (group) {
                group.remove(buttonInfo.buttonMesh.getMesh());
            }

            this.buttonMap.delete(buttonUniqueId);
        }

        const buttonIdList = this.deckMap.get(deckId);
        if (buttonIdList) {
            const updatedList = buttonIdList.filter(id => id !== buttonUniqueId);
            this.deckMap.set(deckId, updatedList);

//             if (updatedList.length === 0) {
//                 this.deckMap.delete(deckId);
//             }
        }
    }

    // 모든 정보 삭제(덱, 블록 모두)
    public deleteAllButton(): void {
        this.deckMap.clear();
        this.buttonMap.clear();
    }

    // 특정 덱 삭제
    public deleteDeckByDeckId(deckId: number): void {
        const group = this.buttonGroupMap.get(deckId);
        if (group) {
            this.meshDestroyer.destroyGroup(group);
            this.buttonGroupMap.delete(deckId);
        }

        const buttonIdList = this.findButtonIdListByDeckId(deckId);
        if (buttonIdList) {
            buttonIdList.forEach((buttonId) => {
                this.buttonMap.delete(buttonId);
            });
        }
        this.deckMap.delete(deckId);

        // 확인용 (후에 주석 처리 or 지우기)
        const deckIdList = this.findDeckIdList();
        console.log(`%c삭제 후 남은 덱 id 리스트는? ${deckIdList}`, 'color: #FE2EF7; font-weight: bold;');
    }

    // 원본 데이터 복제
    public saveClonedOriginalDeckState(deckId: number): void {
        this.originalButtonMap.clear();
        this.originalDeckMap.set(deckId, [...(this.deckMap.get(deckId) || [])]);

        const buttonIdList = this.deckMap.get(deckId);
        if (!buttonIdList) {
            console.warn(`[WARN] No buttonIdList for deck ${deckId}`);
            return;
        }

        buttonIdList.forEach(buttonId => {
            const entry = this.buttonMap.get(buttonId);
            if (entry) {
                const originalMesh = entry.buttonMesh.getMesh();
                const clonedMesh = originalMesh.clone(true);
                const clonedPosition = entry.buttonMesh.position.clone ? entry.buttonMesh.position.clone() : entry.buttonMesh.position;
                const clonedWrapper = new DeckCardDeleteButton(clonedMesh, clonedPosition);

                this.originalButtonMap.set(buttonId, {
                    cardId: entry.cardId,
                    buttonMesh: clonedWrapper
                });

            } else {
                console.warn(`[WARN] buttonId ${buttonId} not found in buttonMap`);
            }
        });

        // To-do: 확인 후 삭제하기
        console.log(
            `%c[INFO] Original deck state cloned and stored for deckId ${deckId}`, 'color: #2E9AFE; font-weight: bold;');
        console.log(
            'original Deck Card Delete Button Map:',
            Array.from(this.originalButtonMap.entries()).map(([id, data]) => ({
                buttonId: id,
                cardId: data.cardId
            }))
        );
    }

    public restoreOriginalDeckState(deckId: number): void {
        const originalButtonIdList = this.originalDeckMap.get(deckId);
        if (originalButtonIdList) {
            this.deckMap.set(deckId, [...originalButtonIdList]);
        }

        const buttonIdList = this.deckMap.get(deckId);
        if (!buttonIdList) return;

        buttonIdList.forEach(buttonId => {
            const originalButtonInfo = this.originalButtonMap.get(buttonId);
            if (originalButtonInfo) {
                const currentButtonInfo = this.buttonMap.get(buttonId);
                if (currentButtonInfo) {
                    this.meshDestroyer.destroyMesh(currentButtonInfo.buttonMesh.getMesh());
                }

                this.buttonMap.set(buttonId, {
                    cardId: originalButtonInfo.cardId,
                    buttonMesh: originalButtonInfo.buttonMesh
                });

                const group = this.buttonGroupMap.get(deckId);
                if (group) {
                    originalButtonInfo.buttonMesh.setVisibility(false);
                    group.add(originalButtonInfo.buttonMesh.getMesh());
                }
            }
        });

        // To-do: 확인 후 없애야 함
        const restoredData = buttonIdList.map(buttonId => {
            const data = this.buttonMap.get(buttonId);
            return data ? {
                buttonId,
                cardId: data.cardId,
                buttonMesh: data.buttonMesh
            } : { buttonId, cardId: null, buttonMesh: null };
        });

        console.log(
            `%c[덱 편집 중단 후 다른 덱 버튼을 눌렀을 때] Deck ${deckId} restored.`,
            'color: #2E9AFE; font-weight: bold;'
        );
        console.log('복원된 mesh 데이터:', restoredData);

    }

}
