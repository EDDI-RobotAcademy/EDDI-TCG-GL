import * as THREE from 'three';
import {MyDeckChosenOutOfTotalSlashService} from './MyDeckChosenOutOfTotalSlashService';
import {MyDeckChosenOutOfTotalSlash} from "../entity/MyDeckChosenOutOfTotalSlash";
import {MyDeckChosenOutOfTotalSlashRepositoryImpl} from "../repository/MyDeckChosenOutOfTotalSlashRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckChosenOutOfTotalSlashServiceImpl implements MyDeckChosenOutOfTotalSlashService {
    private static instance: MyDeckChosenOutOfTotalSlashServiceImpl;
    private myDeckChosenOutOfTotalSlashRepository: MyDeckChosenOutOfTotalSlashRepositoryImpl;

    private constructor() {
        this.myDeckChosenOutOfTotalSlashRepository = MyDeckChosenOutOfTotalSlashRepositoryImpl.getInstance();
    }

    public static getInstance(): MyDeckChosenOutOfTotalSlashServiceImpl {
        if (!MyDeckChosenOutOfTotalSlashServiceImpl.instance) {
            MyDeckChosenOutOfTotalSlashServiceImpl.instance = new MyDeckChosenOutOfTotalSlashServiceImpl();
        }
        return MyDeckChosenOutOfTotalSlashServiceImpl.instance;
    }

    public async createSlash(): Promise<THREE.Group | null> {
        const slashGroup = new THREE.Group();
        try {
            const slash = await this.myDeckChosenOutOfTotalSlashRepository.createSlash();
            const slashMesh = slash.getMesh();
            slashGroup.add(slashMesh);

        } catch (error) {
            console.error('Error creating Slash:', error);
            return null;
        }
        return slashGroup;
    }

    public adjustSlashPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const slash = this.getSlash();

        if (slash !== null) {
            const slashMesh = slash.getMesh();
            const initialPosition = slash.position;

            const slashWidth = 0.014 * windowWidth;
            const slashHeight = slashWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            slashMesh.geometry.dispose();
            slashMesh.geometry = new THREE.PlaneGeometry(slashWidth, slashHeight);
            slashMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

    public getSlash(): MyDeckChosenOutOfTotalSlash | null {
        return this.myDeckChosenOutOfTotalSlashRepository.findSlash();
    }

}
