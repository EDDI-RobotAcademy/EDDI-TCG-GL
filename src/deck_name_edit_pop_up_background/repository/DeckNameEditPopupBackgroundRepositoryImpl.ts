import * as THREE from 'three';
import {DeckNameEditPopupBackgroundRepository} from './DeckNameEditPopupBackgroundRepository';
import {DeckNameEditPopupBackground} from "../entity/DeckNameEditPopupBackground";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckNameEditPopupBackgroundRepositoryImpl implements DeckNameEditPopupBackgroundRepository {
    private static instance: DeckNameEditPopupBackgroundRepositoryImpl;
    private background: DeckNameEditPopupBackground | null;
    private textureManager: TextureManager;

    private readonly BACKGROUND_WIDTH: number = 0.425

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
        this.background = null;
    }

    public static getInstance(): DeckNameEditPopupBackgroundRepositoryImpl {
        if (!DeckNameEditPopupBackgroundRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckNameEditPopupBackgroundRepositoryImpl.instance = new DeckNameEditPopupBackgroundRepositoryImpl(textureManager);
        }
        return DeckNameEditPopupBackgroundRepositoryImpl.instance;
    }

    public async createPopupBackground(): Promise<DeckNameEditPopupBackground> {
        const texture = await this.textureManager.getTexture('deck_name_edit_pop_up_background', 1);
        if (!texture) {
            throw new Error(`Deck Make Pop-up Background Texture not found`);
        }

        const backgroundWidth = this.BACKGROUND_WIDTH * window.innerWidth;
        const backgroundHeight = backgroundWidth * (440/1000);
        const backgroundPosition = new Vector2d(0, 0);

        const backgroundMesh = MeshGenerator.createMesh(texture, backgroundWidth, backgroundHeight, backgroundPosition);
        const newBackground = new DeckNameEditPopupBackground(backgroundMesh, backgroundWidth, backgroundHeight, backgroundPosition);
        this.background = newBackground;

        return newBackground;
    }

    public findPopupBackground(): DeckNameEditPopupBackground | null {
        return this.background;
    }

    public deletePopupBackground(): void {
        this.background = null;
    }

}
