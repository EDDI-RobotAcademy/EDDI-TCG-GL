import * as THREE from 'three';

import { BackgroundServiceImpl } from "../../background/service/BackgroundServiceImpl";
import { NonBackgroundImage } from "../../shape/image/NonBackgroundImage";

export class MyDeckController {
    private background: NonBackgroundImage | null = null;

    constructor(
        private scene: THREE.Scene,
        private backgroundService: BackgroundServiceImpl,
    ) {}

    public async initialize(): Promise<void> {
        await this.addBackground();
    }

    private async addBackground(): Promise<void> {
        try {
            const background = await this.backgroundService.createBackground(
                'my_deck_background',
                1,
                window.innerWidth,
                window.innerHeight
            );

            this.background = background;

            if (this.background instanceof NonBackgroundImage) {
                this.background.draw(this.scene);
            }
        } catch (error) {
            console.error('Failed to add background:', error);
        }
    }

    public handleResize(width: number, height: number): void {
        // Background resize
        if (this.background) {
            const scaleX = width / this.background.getWidth();
            const scaleY = height / this.background.getHeight();
            this.background.setScale(scaleX, scaleY);
        }
    }
}