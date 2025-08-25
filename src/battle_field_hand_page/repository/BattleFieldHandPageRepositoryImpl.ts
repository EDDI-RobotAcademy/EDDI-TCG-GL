import * as THREE from 'three';
import {BattleFieldHandPageRepository} from "./BattleFieldHandPageRepository";
import {TextureManager} from "../../texture_manager/TextureManager";
import {BattleFieldConstants} from "../../common/BattleFieldConstants";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";

export class BattleFieldHandPageRepositoryImpl implements BattleFieldHandPageRepository {
    private static instance: BattleFieldHandPageRepositoryImpl | null = null;

    private readonly PREV_BUTTON_START_X: number = 0.26992708 - BattleFieldConstants.HALF;
    private readonly PREV_BUTTON_START_Y: number = BattleFieldConstants.HALF - 0.948453608;

    private readonly PREV_BUTTON_END_X: number = 0.30561979 - BattleFieldConstants.HALF;
    private readonly PREV_BUTTON_END_Y: number = BattleFieldConstants.HALF - 0.896907216;

    private textureManager: TextureManager;

    constructor() {
        this.textureManager = TextureManager.getInstance();
    }

    public static getInstance(): BattleFieldHandPageRepositoryImpl {
        if (!this.instance) {
            this.instance = new BattleFieldHandPageRepositoryImpl();
        }
        return this.instance;
    }

    async createPrevButton(): Promise<THREE.Mesh> {
        const cardTexture = await this.textureManager.getTexture('hand_page_movement_button', 1);
        if (!cardTexture) {
            throw new Error(`Texture not found`);
        }

        const buttonStartX = this.PREV_BUTTON_START_X * window.innerWidth;
        const buttonStartY = this.PREV_BUTTON_START_Y * window.innerHeight;

        const buttonEndX = this.PREV_BUTTON_END_X * window.innerWidth;
        const buttonEndY = this.PREV_BUTTON_END_Y * window.innerHeight;

        const prevButtonWidth = buttonStartX - buttonEndX;
        const prevButtonHeight = buttonStartY - buttonEndY;

        const position = new Vector2d((buttonStartX + buttonEndX) / 2, (buttonStartY + buttonEndY) / 2)

        console.log(`prevButtonWidth: ${prevButtonWidth}, prevButtonHeight: ${prevButtonHeight}`);
        console.log(`buttonStartX: ${buttonStartX}, buttonStartY: ${buttonStartY}`);
        console.log(`buttonEndX: ${buttonEndX}, buttonEndY: ${buttonEndY}`);

        const prevButtonMesh = MeshGenerator.createMesh(cardTexture, prevButtonWidth, prevButtonHeight, position);

        return prevButtonMesh;
    }
}