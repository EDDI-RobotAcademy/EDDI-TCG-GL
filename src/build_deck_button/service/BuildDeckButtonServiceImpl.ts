import * as THREE from 'three';
import {BuildDeckButtonService} from './BuildDeckButtonService';
import {BuildDeckButton} from "../entity/BuildDeckButton";
import {BuildDeckButtonRepositoryImpl} from "../repository/BuildDeckButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";
import {BuildDeckButtonStateManager} from "../../build_deck_button_manager/BuildDeckButtonStateManager";

export class BuildDeckButtonServiceImpl implements BuildDeckButtonService {
    private static instance: BuildDeckButtonServiceImpl;
    private buildDeckButtonRepository: BuildDeckButtonRepositoryImpl;
    private buildDeckButtonStateManager: BuildDeckButtonStateManager;

    private constructor() {
        this.buildDeckButtonRepository = BuildDeckButtonRepositoryImpl.getInstance();
        this.buildDeckButtonStateManager = BuildDeckButtonStateManager.getInstance();
    }

    public static getInstance(): BuildDeckButtonServiceImpl {
        if (!BuildDeckButtonServiceImpl.instance) {
            BuildDeckButtonServiceImpl.instance = new BuildDeckButtonServiceImpl();
        }
        return BuildDeckButtonServiceImpl.instance;
    }

    public async createBuildDeckButton(type: number, position: Vector2d): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.buildDeckButtonRepository.createBuildDeckButton(type, position);
            const buttonMesh = button.getMesh();
            buttonGroup.add(buttonMesh);

        } catch (error) {
            console.error('Error creating Build Deck Button:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustBuildDeckButtonPosition(): void {
        const buttonList = this.getAllBuildDeckButton();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) => {
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = 0.257 * windowWidth;
            const buttonHeight = buttonWidth * 0.3;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getBuildDeckButtonById(id: number): BuildDeckButton | null {
        return this.buildDeckButtonRepository.findButtonById(id);
    }

    public deleteBuildDeckButtonById(id: number): void {
        this.buildDeckButtonRepository.deleteById(id);
    }

    public getAllBuildDeckButton(): BuildDeckButton[] {
        return this.buildDeckButtonRepository.findAllButton();
    }

    public deleteAllBuildDeckButtons(): void {
        this.buildDeckButtonRepository.deleteAll();
    }

    public initializeRaceButtonVisible(): void {
        this.buildDeckButtonStateManager.initializeButtonVisibility();
    }

}
