import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {TransparentBackgroundRepository} from './TransparentBackgroundRepository';
import {TransparentBackground} from "../entity/TransparentBackground";
import {TransparentRectangle} from "../../shape/TransparentRectangle";

export class TransparentBackgroundRepositoryImpl implements TransparentBackgroundRepository {
    private static instance: TransparentBackgroundRepositoryImpl;
    private background: TransparentBackground | null;

    private constructor() {
        this.background = null;
    }

    public static getInstance(): TransparentBackgroundRepositoryImpl {
        if (!TransparentBackgroundRepositoryImpl.instance) {
            TransparentBackgroundRepositoryImpl.instance = new TransparentBackgroundRepositoryImpl();
        }
        return TransparentBackgroundRepositoryImpl.instance;
    }

    public async createTransparentBackground(
        id: string,
    ): Promise<TransparentBackground> {

        const backgroundWidth = window.innerWidth;
        const backgroundHeight = window.innerHeight;
        const position = new THREE.Vector2(0, 0);

        const transparentBackground = new TransparentRectangle(position, backgroundWidth, backgroundHeight, 0x000000, 0.85, id);
        const transparentBackgroundMesh = transparentBackground.getMesh();

        const newTransparentBackground = new TransparentBackground(transparentBackgroundMesh, backgroundWidth, backgroundHeight, position);
        this.background = newTransparentBackground;

        return newTransparentBackground;
    }

    public findTransparentBackground(): TransparentBackground | null {
        return this.background;
    }

    public deleteTransparentBackground(): void {
        this.background = null;
    }

}
