import * as THREE from 'three';
import {DeleteDeckPopupButtonService} from './DeleteDeckPopupButtonService';
import {DeleteDeckPopupButton} from "../entity/DeleteDeckPopupButton";
import {DeleteDeckPopupButtonRepositoryImpl} from "../repository/DeleteDeckPopupButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class DeleteDeckPopupButtonServiceImpl implements DeleteDeckPopupButtonService {
    private static instance: DeleteDeckPopupButtonServiceImpl;
    private deleteDeckPopupButtonRepository: DeleteDeckPopupButtonRepositoryImpl;

    private constructor() {
        this.deleteDeckPopupButtonRepository = DeleteDeckPopupButtonRepositoryImpl.getInstance();
    }

    public static getInstance(): DeleteDeckPopupButtonServiceImpl {
        if (!DeleteDeckPopupButtonServiceImpl.instance) {
            DeleteDeckPopupButtonServiceImpl.instance = new DeleteDeckPopupButtonServiceImpl();
        }
        return DeleteDeckPopupButtonServiceImpl.instance;
    }

    public async createDeleteDeckPopupButton(type: number, position: Vector2d): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.deleteDeckPopupButtonRepository.createDeleteDeckPopupButton(type, position);
            const buttonMesh = button.getMesh();
            buttonGroup.add(buttonMesh);

        } catch (error) {
            console.error('Error creating Delete Deck Popup Button:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustDeleteDeckPopupButtonPosition(): void {
        const buttonList = this.getAllButton();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) => {
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = (150 / 1920) * windowWidth;
            const buttonHeight = buttonWidth * (80/360);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getButtonById(id: number): DeleteDeckPopupButton | null {
        return this.deleteDeckPopupButtonRepository.findButtonById(id);
    }

    public getAllButton(): DeleteDeckPopupButton[] {
        return this.deleteDeckPopupButtonRepository.findAllButton();
    }

    public deleteAllButton(): void {
        this.deleteDeckPopupButtonRepository.deleteAll();
    }

    public getButtonsVisibleState(): boolean[] {
        const buttons = this.getAllButton();
        return buttons.map((button) => button.getVisibility());
    }

}
