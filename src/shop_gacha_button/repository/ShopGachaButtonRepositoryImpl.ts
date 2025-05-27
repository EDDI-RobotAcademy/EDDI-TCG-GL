import { Vector2d } from "../../common/math/Vector2d";
import { ShopGachaButton } from "../entity/ShopGachaButton";
import { ShopGachaButtonRepository } from "./ShopGachaButtonRepository";
import { TextureManager } from "../../texture_manager/TextureManager";
import { ShopGachaButtonPosition } from "../../shop_gacha_button_position/entity/ShopGachaButtonPosition";
import { ShopGachaButtonPositionRepositoryImpl } from "../../shop_gacha_button_position/repository/ShopGachaButtonPositionRepositoryImpl";
import * as THREE from 'three';

export class ShopGachaButtonRepositoryImpl implements ShopGachaButtonRepository {
    private static instance: ShopGachaButtonRepositoryImpl | null = null;
    private buttons: Map<number, ShopGachaButton> = new Map();
    private textureManager: TextureManager;
    private positionRepository: ShopGachaButtonPositionRepositoryImpl;

    private readonly BUTTON_WIDTH: number = 0.22;
    private readonly BUTTON_HEIGHT: number =1;
    private readonly ASPECT_RATIO: number = 1.55;  // BUTTON_HEIGHT/BUTTON_WIDTH

    private constructor() {
        this.textureManager = TextureManager.getInstance();
        this.positionRepository = ShopGachaButtonPositionRepositoryImpl.getInstance();
    }

    public static getInstance(): ShopGachaButtonRepositoryImpl {
        if (!ShopGachaButtonRepositoryImpl.instance) {
            ShopGachaButtonRepositoryImpl.instance = new ShopGachaButtonRepositoryImpl();
        }
        return ShopGachaButtonRepositoryImpl.instance;
    }

    async createButton(id: number, race: string, index: number, textureId: number): Promise<ShopGachaButton> {
        try {
            const texture = await this.textureManager.getTexture('shop_gacha_button', textureId);
            if (!texture) {
                throw new Error(`Failed to load texture for gacha button ID: ${id}`);
            }

            const position = this.positionRepository.createGachaButtonPosition(id, index);
            const button = new ShopGachaButton(id, race, position);

            const buttonWidth = this.BUTTON_WIDTH * window.innerWidth;
            const buttonHeight = buttonWidth * this.ASPECT_RATIO;

            const geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthTest: false,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            button.setMesh(mesh);

            this.buttons.set(id, button);
            return button;
        } catch (error) {
            console.error(`Failed to create button ${id}:`, error);
            throw error;
        }
    }

    getButton(id: number): ShopGachaButton | undefined {
        return this.buttons.get(id);
    }

    getAllButtons(): ShopGachaButton[] {
        return Array.from(this.buttons.values());
    }

    clearButtons(): void {
        this.buttons.clear();
    }

    updateButtonPositions(): void {
        this.buttons.forEach(button => button.adjustPosition());
    }
} 