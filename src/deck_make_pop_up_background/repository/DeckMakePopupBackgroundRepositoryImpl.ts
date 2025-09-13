import * as THREE from 'three';
import {DeckMakePopupBackgroundRepository} from './DeckMakePopupBackgroundRepository';
import {DeckMakePopupBackground} from "../entity/DeckMakePopupBackground";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeckMakePopupBackgroundRepositoryImpl implements DeckMakePopupBackgroundRepository {
    private static instance: DeckMakePopupBackgroundRepositoryImpl;
    private background: DeckMakePopupBackground | null;
    private textureManager: TextureManager;

    private readonly BACKGROUND_WIDTH: number = 0.425
    private readonly BACKGROUND_HEIGHT: number = 0.422

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
        this.background = null;
    }

    public static getInstance(): DeckMakePopupBackgroundRepositoryImpl {
        if (!DeckMakePopupBackgroundRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeckMakePopupBackgroundRepositoryImpl.instance = new DeckMakePopupBackgroundRepositoryImpl(textureManager);
        }
        return DeckMakePopupBackgroundRepositoryImpl.instance;
    }

    public async createDeckMakePopupBackground(): Promise<DeckMakePopupBackground> {
        const texture = await this.textureManager.getTexture('deck_making_pop_up_background', 1);
        if (!texture) {
            throw new Error(`Deck Make Pop-up Background Texture not found`);
        }

        const backgroundWidth = this.BACKGROUND_WIDTH * window.innerWidth;
        const backgroundHeight = backgroundWidth * (440/1000);
        const backgroundPosition = new Vector2d(0, 0);

        const backgroundMesh = MeshGenerator.createMesh(texture, backgroundWidth, backgroundHeight, backgroundPosition);
        const newBackground = new DeckMakePopupBackground(backgroundMesh, backgroundWidth, backgroundHeight, backgroundPosition);
        this.background = newBackground;

        return newBackground;
    }

    public findDeckMakePopupBackground(): DeckMakePopupBackground | null {
        return this.background;
    }

    public deleteDeckMakePopupBackground(): void {
        this.background = null;
    }

}
