import * as THREE from 'three';
import {DeleteDeckPopupWindowRepository} from './DeleteDeckPopupWindowRepository';
import {DeleteDeckPopupWindow} from "../entity/DeleteDeckPopupWindow";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class DeleteDeckPopupWindowRepositoryImpl implements DeleteDeckPopupWindowRepository {
    private static instance: DeleteDeckPopupWindowRepositoryImpl;
    private popupWindow: DeleteDeckPopupWindow | null;
    private textureManager: TextureManager;

    private readonly POPUP_WINDOW_WIDTH: number = 0.425

    private constructor(textureManager: TextureManager) {
        this.textureManager = textureManager;
        this.popupWindow = null;
    }

    public static getInstance(): DeleteDeckPopupWindowRepositoryImpl {
        if (!DeleteDeckPopupWindowRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            DeleteDeckPopupWindowRepositoryImpl.instance = new DeleteDeckPopupWindowRepositoryImpl(textureManager);
        }
        return DeleteDeckPopupWindowRepositoryImpl.instance;
    }

    public async createDeleteDeckPopupWindow(): Promise<DeleteDeckPopupWindow> {
        const texture = await this.textureManager.getTexture('delete_deck_popup_window', 1);
        if (!texture) {
            throw new Error(`Delete Deck Popup Window Texture not found`);
        }

        const popupWindowWidth = this.POPUP_WINDOW_WIDTH * window.innerWidth;
        const popupWindowHeight = popupWindowWidth * (440/1000);
        const popupWindowPosition = new Vector2d(0, 0);

        const popupWindowMesh = MeshGenerator.createMesh(texture, popupWindowWidth, popupWindowHeight, popupWindowPosition);
        const newPopupWindow = new DeleteDeckPopupWindow(popupWindowMesh, popupWindowPosition);
        this.popupWindow = newPopupWindow;

        return newPopupWindow;
    }

    public findPopupWindow(): DeleteDeckPopupWindow | null {
        return this.popupWindow;
    }

    public deletePopupWindow(): void {
        this.popupWindow = null;
    }

}
