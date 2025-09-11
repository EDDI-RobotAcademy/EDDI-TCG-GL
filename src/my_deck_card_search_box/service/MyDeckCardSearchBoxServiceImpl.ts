import * as THREE from 'three';
import {MyDeckCardSearchBoxService} from './MyDeckCardSearchBoxService';
import {MyDeckCardSearchBox} from "../entity/MyDeckCardSearchBox";
import {MyDeckCardSearchBoxRepositoryImpl} from "../repository/MyDeckCardSearchBoxRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckCardSearchBoxServiceImpl implements MyDeckCardSearchBoxService {
    private static instance: MyDeckCardSearchBoxServiceImpl;
    private myDeckCardSearchBoxRepository: MyDeckCardSearchBoxRepositoryImpl;

    private constructor() {
        this.myDeckCardSearchBoxRepository = MyDeckCardSearchBoxRepositoryImpl.getInstance();
    }

    public static getInstance(): MyDeckCardSearchBoxServiceImpl {
        if (!MyDeckCardSearchBoxServiceImpl.instance) {
            MyDeckCardSearchBoxServiceImpl.instance = new MyDeckCardSearchBoxServiceImpl();
        }
        return MyDeckCardSearchBoxServiceImpl.instance;
    }

    public async createMyDeckCardSearchBox(): Promise<void> {
        try {
            await this.myDeckCardSearchBoxRepository.createSearchBox();

        } catch (error) {
            console.error('Error Creating My Deck Card Search Box:', error);
        }
    }

    public adjustMyDeckCardSearchBoxPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const box = this.getSearchBox();

        if (box !== null) {
            const boxMesh = box.getMesh();
            const initialPosition = box.position;

            const boxWidth = 0.3 * windowWidth;
            const boxHeight = boxWidth * (100/1500);

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            boxMesh.geometry.dispose();
            boxMesh.geometry = new THREE.PlaneGeometry(boxWidth, boxHeight);
            boxMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

    public getSearchBox(): MyDeckCardSearchBox | null {
        return this.myDeckCardSearchBoxRepository.findSearchBox();
    }

}
