import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeleteDeckPopupWindowService} from './DeleteDeckPopupWindowService';
import {DeleteDeckPopupWindow} from "../entity/DeleteDeckPopupWindow";
import {DeleteDeckPopupWindowRepositoryImpl} from "../repository/DeleteDeckPopupWindowRepositoryImpl";

export class DeleteDeckPopupWindowServiceImpl implements DeleteDeckPopupWindowService {
    private static instance: DeleteDeckPopupWindowServiceImpl;
    private deleteDeckPopupWindowRepository: DeleteDeckPopupWindowRepositoryImpl;

    private constructor() {
        this.deleteDeckPopupWindowRepository = DeleteDeckPopupWindowRepositoryImpl.getInstance();
    }

    public static getInstance(): DeleteDeckPopupWindowServiceImpl {
        if (!DeleteDeckPopupWindowServiceImpl.instance) {
            DeleteDeckPopupWindowServiceImpl.instance = new DeleteDeckPopupWindowServiceImpl();
        }
        return DeleteDeckPopupWindowServiceImpl.instance;
    }

    public async createDeleteDeckPopupWindow(): Promise<THREE.Mesh | null> {
        const popupWindow = await this.deleteDeckPopupWindowRepository.createDeleteDeckPopupWindow();
        const popupWindowMesh = popupWindow.getMesh();

        return popupWindowMesh;
    }

    public adjustDeckMakePopupBackgroundPosition(): void {
        const popupWindow = this.getPopupWindow();
        if (!popupWindow) {
            console.error("Delete Deck Popup Window is null. Cannot adjust position.");
            return;
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const popupWindowMesh = popupWindow.getMesh();

        const popupWindowWidth = 0.425 * windowWidth;
        const popupWindowHeight = popupWindowWidth * (440/1000);

        const newPositionX = popupWindow.position.getX() * windowWidth;
        const newPositionY = popupWindow.position.getY() * windowHeight;

        popupWindowMesh.geometry.dispose();
        popupWindowMesh.geometry = new THREE.PlaneGeometry(popupWindowWidth, popupWindowHeight);
        popupWindowMesh.position.set(newPositionX, newPositionY, 0);

    }

    public getPopupWindow(): DeleteDeckPopupWindow | null {
        return this.deleteDeckPopupWindowRepository.findPopupWindow();
    }

    public deletePopupWindow(): void {
        this.deleteDeckPopupWindowRepository.deletePopupWindow();
    }

}
