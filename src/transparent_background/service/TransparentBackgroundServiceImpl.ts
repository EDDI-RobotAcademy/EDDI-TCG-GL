import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {TransparentBackgroundService} from './TransparentBackgroundService';
import {TransparentBackground} from "../entity/TransparentBackground";
import {TransparentBackgroundRepository} from "../repository/TransparentBackgroundRepository";
import {TransparentBackgroundRepositoryImpl} from "../repository/TransparentBackgroundRepositoryImpl";

export class TransparentBackgroundServiceImpl implements TransparentBackgroundService {
    private static instance: TransparentBackgroundServiceImpl;
    private transparentBackgroundRepository: TransparentBackgroundRepository;

    private constructor(transparentBackgroundRepository: TransparentBackgroundRepository) {
        this.transparentBackgroundRepository = transparentBackgroundRepository;
    }

    public static getInstance(): TransparentBackgroundServiceImpl {
        if (!TransparentBackgroundServiceImpl.instance) {
            const transparentBackgroundRepository = TransparentBackgroundRepositoryImpl.getInstance();
            TransparentBackgroundServiceImpl.instance = new TransparentBackgroundServiceImpl(transparentBackgroundRepository);
        }
        return TransparentBackgroundServiceImpl.instance;
    }

    public async createTransparentBackground(): Promise<THREE.Mesh | null> {
        const background = await this.transparentBackgroundRepository.createTransparentBackground('transparentBackground');
        const backgroundMesh = background.getMesh();

        return backgroundMesh;
    }

    public adjustTransparentBackgroundPosition(): void {
        const background = this.getTransparentBackground();
        if (!background) {
            console.error("TransparentBackground is null. Cannot adjust position.");
            return;
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const backgroundMesh = background.getMesh();

        const backgroundWidth = windowWidth;
        const backgroundHeight = windowHeight;

        const newPositionX = windowWidth / background.getWidth();
        const newPositionY = windowHeight / background.getHeight();

        backgroundMesh.geometry.dispose();
        backgroundMesh.geometry = new THREE.PlaneGeometry(backgroundWidth, backgroundHeight);

        backgroundMesh.position.set(newPositionX, newPositionY, 0);

    }

    public getTransparentBackground(): TransparentBackground | null {
        return this.transparentBackgroundRepository.findTransparentBackground();
    }

    public deleteTransparentBackground(): void {
        this.transparentBackgroundRepository.deleteTransparentBackground();
    }

}
