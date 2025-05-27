import * as THREE from 'three';
import { TextureManager } from "../../texture_manager/TextureManager";
import { ShopGachaButton } from "../entity/ShopGachaButton";
import { ShopGachaButtonRepository } from "../repository/ShopGachaButtonRepository";
import { ShopGachaButtonService } from "./ShopGachaButtonService";

export class ShopGachaButtonServiceImpl implements ShopGachaButtonService {
    private static instance: ShopGachaButtonServiceImpl | null = null;
    private textureManager: TextureManager;
    private readonly buttonData = [
        { id: 1, race: 'all', index: 0 },
        { id: 2, race: 'human', index: 1 },
        { id: 3, race: 'undead', index: 2 },
        { id: 4, race: 'trent', index: 3 },
    ];

    private constructor(
        private readonly repository: ShopGachaButtonRepository
    ) {
        this.textureManager = TextureManager.getInstance();
    }

    public static getInstance(repository: ShopGachaButtonRepository): ShopGachaButtonServiceImpl {
        if (!ShopGachaButtonServiceImpl.instance) {
            ShopGachaButtonServiceImpl.instance = new ShopGachaButtonServiceImpl(repository);
        }
        return ShopGachaButtonServiceImpl.instance;
    }

    async initializeButtons(): Promise<void> {
        try {
            await Promise.all(
                this.buttonData.map(async data => {
                    try {
                        await this.repository.createButton(data.id, data.race, data.index, data.id - 1);
                    } catch (error) {
                        console.error(`Failed to create button ${data.id} (${data.race}):`, error);
                        throw error;
                    }
                })
            );
        } catch (error) {
            console.error('Failed to initialize buttons:', error);
            throw error;
        }
    }

    getButton(id: number): ShopGachaButton | undefined {
        return this.repository.getButton(id);
    }

    getAllButtons(): ShopGachaButton[] {
        return this.repository.getAllButtons();
    }

    adjustButtonPositions(): void {
        this.getAllButtons().forEach(button => button.adjustPosition());
    }

    clearButtons(): void {
        this.repository.clearButtons();
    }

    public async createGachaButton(id: number, width: number, height: number): Promise<THREE.Mesh | null> {
        try {
            const textureId = id - 1;
            const texture = await this.textureManager.getTexture('shop_gacha_button', textureId);
            if (!texture) {
                console.error(`Failed to load texture for gacha button ID: ${id}`);
                return null;
            }

            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthTest: false,
                depthWrite: false
            });

            return new THREE.Mesh(geometry, material);
        } catch (error) {
            console.error('Failed to create gacha button:', error);
            return null;
        }
    }
} 