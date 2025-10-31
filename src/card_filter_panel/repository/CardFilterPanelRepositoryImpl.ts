import * as THREE from 'three';
import {CardFilterPanelRepository} from './CardFilterPanelRepository';
import {CardFilterPanel} from "../entity/CardFilterPanel";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer"

export class CardFilterPanelRepositoryImpl implements CardFilterPanelRepository {
    private static instance: CardFilterPanelRepositoryImpl;
    private filterPanel: CardFilterPanel | null = null;

    private textureManager: TextureManager;
    private meshDestroyer: MeshDestroyer;

    private readonly PANEL_WIDTH: number = 0.127; // 가로:세로 = 244:332
    private readonly PANEL_POSITION_X: number = 0.018 // 0.137
    private readonly PANEL_POSITION_Y: number = 0.08 // 0.082

    private constructor(textureManager: TextureManager, scene: THREE.Scene) {
        this.textureManager = textureManager;
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterPanelRepositoryImpl {
        if (!CardFilterPanelRepositoryImpl.instance) {
            const textureManager = TextureManager.getInstance()
            CardFilterPanelRepositoryImpl.instance = new CardFilterPanelRepositoryImpl(textureManager, scene);
        }
        return CardFilterPanelRepositoryImpl.instance;
    }

    public async createPanel(): Promise<CardFilterPanel> {
        const texture = await this.textureManager.getTexture('filter_panel', 1);

        if (!texture) {
            throw new Error('Card Filter Panel texture not found.');
        }

        const panelWidth = this.PANEL_WIDTH * window.innerWidth;
        const panelHeight = panelWidth * (332/244);

        const panelPositionX = this.PANEL_POSITION_X * window.innerWidth;
        const panelPositionY = this.PANEL_POSITION_Y * window.innerHeight;
        const position = new Vector2d(this.PANEL_POSITION_X, this.PANEL_POSITION_Y);

        const panelMesh = MeshGenerator.createMesh(texture, panelWidth, panelHeight, position);
        panelMesh.position.set(panelPositionX, panelPositionY, 0);

        const newPanel = new CardFilterPanel(panelWidth, panelHeight, panelMesh, position);
        this.filterPanel = newPanel;

        return newPanel;
    }

    public findPanel(): CardFilterPanel | null {
        return this.filterPanel;
    }

    public deletePanel(): void {
        const panel = this.findPanel();
        if (panel == null) return;

        const panelMesh = panel.getMesh();
        this.meshDestroyer.destroyMesh(panelMesh);

        this.filterPanel = null;
    }

}
