import * as THREE from 'three';
import {MyDeckCardSearchCancelButtonService} from './MyDeckCardSearchCancelButtonService';
import {MyDeckCardSearchCancelButton} from "../entity/MyDeckCardSearchCancelButton";
import {MyDeckCardSearchCancelButtonRepositoryImpl} from "../repository/MyDeckCardSearchCancelButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckCardSearchCancelButtonServiceImpl implements MyDeckCardSearchCancelButtonService {
    private static instance: MyDeckCardSearchCancelButtonServiceImpl;
    private myDeckCardSearchCancelButtonRepository: MyDeckCardSearchCancelButtonRepositoryImpl;

    private constructor() {
        this.myDeckCardSearchCancelButtonRepository = MyDeckCardSearchCancelButtonRepositoryImpl.getInstance();
    }

    public static getInstance(): MyDeckCardSearchCancelButtonServiceImpl {
        if (!MyDeckCardSearchCancelButtonServiceImpl.instance) {
            MyDeckCardSearchCancelButtonServiceImpl.instance = new MyDeckCardSearchCancelButtonServiceImpl();
        }
        return MyDeckCardSearchCancelButtonServiceImpl.instance;
    }

    public async createMyDeckCardSearchCancelButton(): Promise<void> {
        try {
            await this.myDeckCardSearchCancelButtonRepository.createButton();

        } catch (error) {
            console.error('Error Creating My Deck Card Search Cancel Button:', error);
        }
    }

    public adjustMyDeckCardSearchCancelButtonPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const button = this.getButton();

        if (button !== null) {
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = 0.009 * windowWidth;
            const buttonHeight = buttonWidth;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
            buttonMesh.position.set(newPositionX, newPositionY, 0);
        }
    }

    public getButton(): MyDeckCardSearchCancelButton | null {
        return this.myDeckCardSearchCancelButtonRepository.findButton();
    }

}
