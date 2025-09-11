import * as THREE from 'three';

interface ImageInfo {
    relative_path: string;
    reference_path: string;
}

export class TextureManager {
    private static instance: TextureManager;
    private isTexturesPreloaded: boolean = false

    private renderer: THREE.WebGLRenderer | undefined;

    private battleFieldUnitCardTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitSwordPowerTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitStaffPowerTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitHpTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitEnergyTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitRaceTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldActivePanelSkillTextureList: { [unitId: number]: { [skillId: number]: THREE.Texture } } = {};

    private battleFieldActivePanelGeneralTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldActivePanelDetailsTextureList: { [id: number]: THREE.Texture } = {};

    private battleFieldHandPageButtonTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldEnergyButtonTextureList: { [id: number]: THREE.Texture } = {};

    private mainLobbyBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private mainLobbyButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private shopBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private shopButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private shopSelectScreenTextureList: { [id: number]: THREE.Texture } = {};
    private shopYesOrNoButtonTextureList: { [id: number]: THREE.Texture } = {};
    private selectCardScreenTextureList: { [id: number]: THREE.Texture } = {};
    private shopGachaButtonTextureList: { [id: number]: THREE.Texture } = {};
    private tryAgainScreenTextureList: { [id: number]: THREE.Texture } = {};
    private tryAgainButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private myCardBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private myCardPageMovementTextureList: { [id: number]: THREE.Texture } = {};
    private myDeckBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private myDeckButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private createNewDeckButtonTextureList: { [id: number]: THREE.Texture } = {};
    private myDeckPageMovementButtonTextureList: { [id: number]: THREE.Texture } = {};
    private deckPageMovementButtonsTextureList : { [id: number]: THREE.Texture } = {};
    private myDeckCardPageMovementButtonTextureList : { [id: number]: THREE.Texture } = {};
    private deckEditRemoveButtonTextureList: { [id: number]: THREE.Texture } = {};
    private deckEditDoneButtonTextureList: { [id: number]: THREE.Texture } = {};
    private deckEditButtonTextureList: { [id: number]: THREE.Texture } = {};
    private cardKindsTextureList: { [id: number]: THREE.Texture } = {};
    private deckMakingPopupBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private deckMakingPopupButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private deleteDeckPopupWindowTextureList: { [id: number]: THREE.Texture } = {};
    private deleteDeckPopupButtonTextureList: { [id: number]: THREE.Texture } = {};
    private makeDeckBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private ownedCardTextureList: { [id: number]: THREE.Texture } = {};
    private raceButtonTextureList: { [id: number]: THREE.Texture } = {};
    private raceButtonEffectTextureList: { [id: number]: THREE.Texture } = {};
    private makeDeckCardPageMovementButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private doneButtonTextureList: { [id: number]: THREE.Texture } = {};
    private selectedCardBlockTextureList: { [id: number]: THREE.Texture } = {};
    private numberOfSelectedCardsTextureList: { [id: number]: THREE.Texture } = {};
    private selectedCardBlockEffectTextureList: { [id: number]: THREE.Texture } = {};
    private blockAddDeleteButtonTextureList: { [id: number]: THREE.Texture } = {};
    private numberOfOwnedCardsTextureList: { [id: number]: THREE.Texture } = {};
    private ownedCardEffectTextureList: { [id: number]: THREE.Texture } = {};
    private myCardRaceButtonTextureList: { [id: number]: THREE.Texture } = {};
    private myCardRaceButtonEffectTextureList: { [id: number]: THREE.Texture } = {};
    private myCardCloseButtonTextureList: { [id: number]: THREE.Texture } = {};
    private myCardScrollBarTextureList: { [id: number]: THREE.Texture } = {};
    private globalNavigationBarTextureList: { [id: number]: THREE.Texture } = {};
    private globalNavigationBarEffectTextureList: { [id: number]: THREE.Texture } = {};
    private blockTextureList: { [id: number]: THREE.Texture } = {};
    private cardSelectionBlockerTextureList: { [id: number]: THREE.Texture } = {};
    private cardCountTextureList: { [id: number]: THREE.Texture } = {};
    private cardCountNotationTextureList: { [id: number]: THREE.Texture } = {};
    private searchCancelButtonTextureList: { [id: number]: THREE.Texture } = {};
    private searchBoxTextureList: { [id: number]: THREE.Texture } = {};

    private constructor(renderer?: THREE.WebGLRenderer) {
        if (renderer instanceof THREE.WebGLRenderer) {
            this.renderer = renderer;
        }
    }

    public static initialize(renderer: THREE.WebGLRenderer): TextureManager {
        if (!TextureManager.instance) {
            if (!renderer) {
                throw new Error("TextureManager is not initialized yet. Pass a renderer the first time.");
            }
            TextureManager.instance = new TextureManager(renderer);
        }
        return TextureManager.instance;
    }

    public static getInstance(): TextureManager {
        if (!TextureManager.instance) {
            TextureManager.instance = new TextureManager();
        }
        return TextureManager.instance;
    }

    public async preloadTextures(jsonUrl: string): Promise<void> {
        if (this.isTexturesPreloaded) {
            console.log('Textures already preloaded.');
            return;
        }

        try {
            const response = await fetch(jsonUrl);
            const imageData = await response.json();
            console.log('imageData:', imageData);

            await Promise.all([
                this.loadTextures(imageData.card, this.battleFieldUnitCardTextureList),
                this.loadTextures(imageData.sword_power, this.battleFieldUnitSwordPowerTextureList),
                this.loadTextures(imageData.staff_power, this.battleFieldUnitStaffPowerTextureList),
                this.loadTextures(imageData.hp, this.battleFieldUnitHpTextureList),
                this.loadTextures(imageData.energy, this.battleFieldUnitEnergyTextureList),
                this.loadTextures(imageData.race, this.battleFieldUnitRaceTextureList),
                this.loadTextures(imageData.active_panel_general, this.battleFieldActivePanelGeneralTextureList),
                this.loadTextures(imageData.active_panel_details, this.battleFieldActivePanelDetailsTextureList),
                this.loadSkillTextures(imageData.active_panel_skill, this.battleFieldActivePanelSkillTextureList),

                this.loadTextures(imageData.hand_page_movement_button, this.battleFieldHandPageButtonTextureList),
                this.loadTextures(imageData.field_energy_button, this.battleFieldEnergyButtonTextureList),

                this.loadTextures(imageData.main_lobby_background, this.mainLobbyBackgroundTextureList),
                this.loadTextures(imageData.main_lobby_buttons, this.mainLobbyButtonsTextureList),
                this.loadTextures(imageData.shop_background, this.shopBackgroundTextureList),
                this.loadTextures(imageData.shop_buttons, this.shopButtonsTextureList),
                this.loadTextures(imageData.shop_select_screens, this.shopSelectScreenTextureList),
                this.loadTextures(imageData.shop_yes_or_no_button, this.shopYesOrNoButtonTextureList),
                this.loadTextures(imageData.select_card_screen, this.selectCardScreenTextureList),
                this.loadTextures(imageData.shop_gacha_button, this.shopGachaButtonTextureList),
                this.loadTextures(imageData.try_again_screen, this.tryAgainScreenTextureList),
                this.loadTextures(imageData.try_again_buttons, this.tryAgainButtonsTextureList),
                this.loadTextures(imageData.battle_field_background, this.battleFieldBackgroundTextureList),
                this.loadTextures(imageData.my_card_background, this.myCardBackgroundTextureList),
                this.loadTextures(imageData.my_card_page_movement_button, this.myCardPageMovementTextureList),
                this.loadTextures(imageData.my_deck_background, this.myDeckBackgroundTextureList),
                this.loadTextures(imageData.my_deck_buttons, this.myDeckButtonsTextureList),
                this.loadTextures(imageData.create_new_deck_button, this.createNewDeckButtonTextureList),
                this.loadTextures(imageData.my_deck_page_movement_button, this.myDeckPageMovementButtonTextureList),
                this.loadTextures(imageData.deck_page_movement_buttons, this.deckPageMovementButtonsTextureList),
                this.loadTextures(imageData.deck_card_page_movement_buttons, this.myDeckCardPageMovementButtonTextureList),
                this.loadTextures(imageData.deck_edit_remove_button, this.deckEditRemoveButtonTextureList),
                this.loadTextures(imageData.deck_edit_done_button, this.deckEditDoneButtonTextureList),
                this.loadTextures(imageData.deck_edit_button, this.deckEditButtonTextureList),
                this.loadTextures(imageData.card_kinds, this.cardKindsTextureList),
                this.loadTextures(imageData.deck_making_pop_up_background, this.deckMakingPopupBackgroundTextureList),
                this.loadTextures(imageData.deck_making_pop_up_buttons, this.deckMakingPopupButtonsTextureList),
                this.loadTextures(imageData.delete_deck_popup_window, this.deleteDeckPopupWindowTextureList),
                this.loadTextures(imageData.delete_deck_popup_button, this.deleteDeckPopupButtonTextureList),
                this.loadTextures(imageData.make_deck_background, this.makeDeckBackgroundTextureList),
                this.loadTextures(imageData.owned_card, this.ownedCardTextureList),
                this.loadTextures(imageData.race_button, this.raceButtonTextureList),
                this.loadTextures(imageData.race_button_effect, this.raceButtonEffectTextureList),
                this.loadTextures(imageData.make_deck_card_page_movement_buttons, this.makeDeckCardPageMovementButtonsTextureList),
                this.loadTextures(imageData.done_button, this.doneButtonTextureList),
                this.loadTextures(imageData.selected_card_block, this.selectedCardBlockTextureList),
                this.loadTextures(imageData.number_of_selected_cards, this.numberOfSelectedCardsTextureList),
                this.loadTextures(imageData.selected_card_block_effect, this.selectedCardBlockEffectTextureList),
                this.loadTextures(imageData.block_add_delete_button, this.blockAddDeleteButtonTextureList),
                this.loadTextures(imageData.number_of_owned_cards, this.numberOfOwnedCardsTextureList),
                this.loadTextures(imageData.owned_card_effect, this.ownedCardEffectTextureList),
                this.loadTextures(imageData.my_card_race_button, this.myCardRaceButtonTextureList),
                this.loadTextures(imageData.my_card_race_button_effect, this.myCardRaceButtonEffectTextureList),
                this.loadTextures(imageData.my_card_close_button, this.myCardCloseButtonTextureList),
                this.loadTextures(imageData.my_card_scroll_bar, this.myCardScrollBarTextureList),
                this.loadTextures(imageData.global_navigation_bar, this.globalNavigationBarTextureList),
                this.loadTextures(imageData.global_navigation_bar_effect, this.globalNavigationBarEffectTextureList),
                this.loadTextures(imageData.block, this.blockTextureList),
                this.loadTextures(imageData.card_selection_blocker, this.cardSelectionBlockerTextureList),
                this.loadTextures(imageData.card_count, this.cardCountTextureList),
                this.loadTextures(imageData.card_count_notation, this.cardCountNotationTextureList),
                this.loadTextures(imageData.search_cancel_button, this.searchCancelButtonTextureList),
                this.loadTextures(imageData.search_box, this.searchBoxTextureList),
            ]);

            console.log('All textures preloaded from TextureManager.ts');
            console.log('mainLobbyBackgroundTextureList:', this.mainLobbyBackgroundTextureList);
            this.isTexturesPreloaded = true
        } catch (error) {
            console.error(`Failed to fetch or parse JSON from: ${jsonUrl}`, error);
        }
    }

    private getBasePath(): string {
        return window.location.origin; // 현재 작업 디렉토리 경로를 반환
    }

    private loadTextures(images: string[], textureList: { [id: number]: THREE.Texture | undefined }): Promise<void> {
        const textureIdMap: Map<number, string> = new Map(); // ID와 경로 매핑
        let currentIndex = 1;

        // 이미지 경로에서 ID를 추출하고 ID와 경로를 매핑합니다.
        images.forEach((imagePath) => {
            const id = this.extractIdFromPath(imagePath);
            if (id !== null) {
                textureIdMap.set(id, imagePath);
            } else {
                // 이름 기반 텍스처 처리
                if (this.isNameBasedTexture(imagePath)) {
                    textureIdMap.set(currentIndex, imagePath);
                    currentIndex++;
                }
            }
        });

        // 텍스처를 ID 순서에 맞게 로드합니다.
        const texturePromises = Array.from(textureIdMap.keys()).sort((a, b) => a - b).map((id) => {
            return new Promise<void>((resolve, reject) => {
                const textureLoader = new THREE.TextureLoader();
                const imagePath = textureIdMap.get(id)!;

                textureLoader.load(
                    imagePath,
                    (texture) => {
                        texture.colorSpace = THREE.LinearSRGBColorSpace;
                        // texture.magFilter = THREE.LinearFilter;
                        // texture.minFilter = THREE.LinearFilter;
                        // texture.generateMipmaps = false;
                        texture.minFilter = THREE.LinearMipMapLinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        texture.generateMipmaps = true;  // 이제 안전하게 사용 가능
                        if (this.renderer) {
                            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                        }
                        textureList[id] = texture;
                        resolve();
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture for path: ${imagePath}`, error);
                        reject(error);
                    }
                );
                // textureLoader.load(
                //     imagePath,
                //     (texture) => {
                //         // NPOT → POT 변환
                //         if (!THREE.MathUtils.isPowerOfTwo(texture.image.width) ||
                //             !THREE.MathUtils.isPowerOfTwo(texture.image.height)) {
                //             texture.image = this.makePowerOfTwoWithPadding(texture.image);
                //             texture.needsUpdate = true;
                //         }
                //
                //         // 텍스처 설정
                //         texture.colorSpace = THREE.SRGBColorSpace;
                //         texture.minFilter = THREE.LinearMipmapLinearFilter;
                //         texture.magFilter = THREE.LinearFilter;
                //         texture.generateMipmaps = true;
                //         if (this.renderer) {
                //             texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                //         }
                //
                //         textureList[id] = texture;
                //         resolve();
                //     },
                //     undefined,
                //     (error) => {
                //         console.error(`Error loading texture for path: ${imagePath}`, error);
                //         reject(error);
                //     }
                // );
            });
        });
        return Promise.all(texturePromises).then(() => {
            console.log(`Loaded textures: ${Object.keys(textureList).length}`);
        });
    }

    private isNameBasedTexture(path: string): boolean {
        // png, jpg, jpeg, webp 모두 허용
        return /\.(png|jpe?g|webp)$/i.test(path) && !this.extractIdFromPath(path);
    }

    private extractIdFromPath(path: string): number | null {
        // 확장자 상관없이 숫자 파일명(ID) 추출
        const match = path.match(/(\d+)\.(png|jpe?g|webp)$/i);
        return match ? parseInt(match[1], 10) : null;
    }

    public async getTexture(category: string, id: number): Promise<THREE.Texture | undefined> {
        if (!this.isTexturesPreloaded) {
            console.warn('Textures are not yet preloaded. Waiting for preload to complete...');
            await this.preloadTextures("image-paths.json"); // 텍스처가 로드될 때까지 대기
        }

        console.log('getTexture -> category:', category, ',id:', id)
        switch (category) {
            case 'card':
                return this.battleFieldUnitCardTextureList[id];
            case 'sword_power':
                return this.battleFieldUnitSwordPowerTextureList[id];
            case 'staff_power':
                return this.battleFieldUnitStaffPowerTextureList[id];
            case 'hp':
                return this.battleFieldUnitHpTextureList[id];
            case 'energy':
                return this.battleFieldUnitEnergyTextureList[id];
            case 'race':
                return this.battleFieldUnitRaceTextureList[id];
            case 'active_panel_general':
                return this.battleFieldActivePanelGeneralTextureList[id];
            case 'active_panel_details':
                return this.battleFieldActivePanelDetailsTextureList[id];
            case 'hand_page_movement_button':
                return this.battleFieldHandPageButtonTextureList[id];
            case 'field_energy_button':
                return this.battleFieldEnergyButtonTextureList[id];
            case 'main_lobby_background':
                return this.mainLobbyBackgroundTextureList[id];
            case 'main_lobby_buttons':
                return this.mainLobbyButtonsTextureList[id];
            case 'shop_background':
                return this.shopBackgroundTextureList[id]
            case 'shop_buttons':
                return this.shopButtonsTextureList[id]
            case 'shop_select_screens':
                return this.shopSelectScreenTextureList[id]
            case 'shop_yes_or_no_button':
                return this.shopYesOrNoButtonTextureList[id]
            case 'select_card_screen':
                return this.selectCardScreenTextureList[id]
            case 'shop_gacha_button':
                return this.shopGachaButtonTextureList[id]
            case 'try_again_screen':
                return this.tryAgainScreenTextureList[id]
            case 'try_again_buttons':
                return this.tryAgainButtonsTextureList[id]
            case 'battle_field_background':
                return this.battleFieldBackgroundTextureList[id]
            case 'my_card_background':
                return this.myCardBackgroundTextureList[id]
            case 'my_card_page_movement_button':
                return this.myCardPageMovementTextureList[id]
            case 'my_deck_background':
                return this.myDeckBackgroundTextureList[id]
            case 'my_deck_buttons':
                return this.myDeckButtonsTextureList[id]
            case 'create_new_deck_button':
                return this.createNewDeckButtonTextureList[id]
            case 'my_deck_page_movement_button':
                return this.myDeckPageMovementButtonTextureList[id]
            case 'deck_page_movement_buttons':
                return this.deckPageMovementButtonsTextureList[id]
            case 'deck_card_page_movement_buttons':
                return this.myDeckCardPageMovementButtonTextureList[id]
            case 'deck_edit_remove_button':
                return this.deckEditRemoveButtonTextureList[id]
            case 'deck_edit_done_button':
                return this.deckEditDoneButtonTextureList[id];
            case 'deck_edit_button':
                return this.deckEditButtonTextureList[id];
            case 'card_kinds':
                return this.cardKindsTextureList[id]
            case 'deck_making_pop_up_background':
                return this.deckMakingPopupBackgroundTextureList[id]
            case 'deck_making_pop_up_buttons':
                return this.deckMakingPopupButtonsTextureList[id]
            case 'delete_deck_popup_window':
                return this.deleteDeckPopupWindowTextureList[id]
            case 'delete_deck_popup_button':
                return this.deleteDeckPopupButtonTextureList[id]
            case 'make_deck_background':
                return this.makeDeckBackgroundTextureList[id];
            case 'owned_card':
                return this.ownedCardTextureList[id];
            case 'race_button':
                return this.raceButtonTextureList[id];
            case 'race_button_effect':
                return this.raceButtonEffectTextureList[id];
            case 'make_deck_card_page_movement_buttons':
                return this.makeDeckCardPageMovementButtonsTextureList[id];
            case 'done_button':
                return this.doneButtonTextureList[id];
            case 'selected_card_block':
                return this.selectedCardBlockTextureList[id];
            case 'number_of_selected_cards':
                return this.numberOfSelectedCardsTextureList[id];
            case 'selected_card_block_effect':
                return this.selectedCardBlockEffectTextureList[id];
            case 'block_add_delete_button':
                return this.blockAddDeleteButtonTextureList[id];
            case 'number_of_owned_cards':
                return this.numberOfOwnedCardsTextureList[id];
            case 'owned_card_effect':
                return this.ownedCardEffectTextureList[id];
            case 'my_card_race_button':
                return this.myCardRaceButtonTextureList[id];
            case 'my_card_race_button_effect':
                return this.myCardRaceButtonEffectTextureList[id];
            case 'my_card_close_button':
                return this.myCardCloseButtonTextureList[id];
            case 'my_card_scroll_bar':
                return this.myCardScrollBarTextureList[id];
            case 'global_navigation_bar':
                return this.globalNavigationBarTextureList[id];
            case 'global_navigation_bar_effect':
                return this.globalNavigationBarEffectTextureList[id];
            case 'block':
                return this.blockTextureList[id];
            case 'card_selection_blocker':
                return this.cardSelectionBlockerTextureList[id];
            case 'card_count':
                return this.cardCountTextureList[id];
            case 'card_count_notation':
                return this.cardCountNotationTextureList[id];
            case 'search_cancel_button':
                return this.searchCancelButtonTextureList[id];
            case 'search_box':
                return this.searchBoxTextureList[id];
            default:
                return undefined;
        }
    }

    private loadSkillTextures(skillImages: { [unitId: number]: string[] }, skillTextureList: { [unitId: number]: { [skillId: number]: THREE.Texture } }): Promise<void> {
        const texturePromises: Promise<void>[] = [];

        Object.entries(skillImages).forEach(([unitId, skillPaths]) => {
            if (!skillTextureList[+unitId]) {
                skillTextureList[+unitId] = {};
            }

            skillPaths.forEach((path, skillId) => {
                texturePromises.push(new Promise<void>((resolve, reject) => {
                    const textureLoader = new THREE.TextureLoader();

                    textureLoader.load(
                        path,
                        (texture) => {
                            texture.colorSpace = THREE.SRGBColorSpace;
                            texture.magFilter = THREE.LinearFilter;
                            texture.minFilter = THREE.LinearFilter;
                            texture.generateMipmaps = false;
                            skillTextureList[+unitId][skillId + 1] = texture;
                            resolve();
                        },
                        undefined,
                        (error) => {
                            console.error(`Error loading skill texture for path: ${path}`, error);
                            reject(error);
                        }
                    );
                }));
            });
        });

        return Promise.all(texturePromises).then(() => {
            console.log(`Loaded skill textures.`);
        });
    }

    public getSkillButtonTexture(unitId: number, skillId: number): THREE.Texture | undefined {
        return this.battleFieldActivePanelSkillTextureList[unitId]?.[skillId];
    }
}

// // 예제 사용법:
// const textureManager = LegacyTextureManager.getInstance();
// textureManager.preloadTextures('image-paths.json').then(() => {
//     console.log('All textures preloaded.');
// });
