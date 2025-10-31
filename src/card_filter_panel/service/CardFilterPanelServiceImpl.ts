import * as THREE from 'three';
import {CardFilterPanelService} from './CardFilterPanelService';
import {CardFilterPanel} from "../entity/CardFilterPanel";
import {CardFilterPanelRepositoryImpl} from "../repository/CardFilterPanelRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class CardFilterPanelServiceImpl implements CardFilterPanelService {
    private static instance: CardFilterPanelServiceImpl;
    private cardFilterPanelRepository: CardFilterPanelRepositoryImpl;

    private constructor(scene: THREE.Scene) {
        this.cardFilterPanelRepository = CardFilterPanelRepositoryImpl.getInstance(scene);
    }

    public static getInstance(scene: THREE.Scene): CardFilterPanelServiceImpl {
        if (!CardFilterPanelServiceImpl.instance) {
            CardFilterPanelServiceImpl.instance = new CardFilterPanelServiceImpl(scene);
        }
        return CardFilterPanelServiceImpl.instance;
    }

    public async createCardFilterPanel(): Promise<void> {
        try {
            await this.cardFilterPanelRepository.createPanel();

        } catch (error) {
            console.error('Error creating Card Filter Panel:', error);
        }
    }

    public adjustCardFilterPanelPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const panel = this.getCardFilterPanel();
        if (panel == null) return;

        const panelMesh = panel.getMesh();
        const initialPosition = panel.position;

        const panelWidth = 0.127 * windowWidth;
        const panelHeight = panelWidth * (332/244);

        const newPositionX = initialPosition.getX() * windowWidth;
        const newPositionY = initialPosition.getY() * windowHeight;

        panelMesh.geometry.dispose();
        panelMesh.geometry = new THREE.PlaneGeometry(panelWidth, panelHeight);

        panelMesh.position.set(newPositionX, newPositionY, 0);

    }

    public getCardFilterPanel(): CardFilterPanel | null {
        return this.cardFilterPanelRepository.findPanel();
    }

    public deleteCardFilterPanel(): void {
        this.cardFilterPanelRepository.deletePanel();
    }

}
