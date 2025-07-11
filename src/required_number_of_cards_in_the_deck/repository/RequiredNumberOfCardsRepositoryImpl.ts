import * as THREE from 'three';
import {RequiredNumberOfCardsRepository} from './RequiredNumberOfCardsRepository';
import {RequiredNumberOfCards} from "../entity/RequiredNumberOfCards";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer"

export class RequiredNumberOfCardsRepositoryImpl implements RequiredNumberOfCardsRepository {
    private static instance: RequiredNumberOfCardsRepositoryImpl;
    private requiredNumberOfCards: RequiredNumberOfCards | null = null;
    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly NUMBER_WIDTH: number = 0.013
    private readonly NUMBER_POSITION_X: number = 0.465
    private readonly NUMBER_POSITION_Y: number = 0.308

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): RequiredNumberOfCardsRepositoryImpl {
        if (!RequiredNumberOfCardsRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance();
            RequiredNumberOfCardsRepositoryImpl.instance = new RequiredNumberOfCardsRepositoryImpl(textureManager, scene);
        }
        return RequiredNumberOfCardsRepositoryImpl.instance;
    }

    public async createRequiredNumberOfCards(): Promise<RequiredNumberOfCards> {
        const texture = await this.textureManager.getTexture('card_count', 40);
        if (!texture) {
            throw new Error(`[My Deck Edit] Required Number Of Cards texture not found`);
        }

        const numberWidth = this.NUMBER_WIDTH * window.innerWidth;
        const numberHeight = numberWidth;

        const position = new Vector2d(this.NUMBER_POSITION_X, this.NUMBER_POSITION_Y);

        const numberPositionX = position.getX() * window.innerWidth;
        const numberPositionY = position.getY() * window.innerHeight;

        const numberMesh = MeshGenerator.createMesh(texture, numberWidth, numberHeight, position);
        numberMesh.position.set(numberPositionX, numberPositionY, 0);

        const newNumber = new RequiredNumberOfCards(numberMesh, position);
        this.requiredNumberOfCards = newNumber;

        return newNumber;
    }

    public findNumber(): RequiredNumberOfCards | null {
        return this.requiredNumberOfCards ?? null;
    }

    public deleteNumber(): void {
        const numberMesh = this.requiredNumberOfCards;
        if (numberMesh == null) return;

        this.meshDestroyer.destroyMesh(numberMesh.getMesh());
        this.requiredNumberOfCards = null;
    }

}
