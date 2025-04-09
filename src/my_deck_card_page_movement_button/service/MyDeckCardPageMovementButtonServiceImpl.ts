import * as THREE from 'three';
import { MyDeckCardPageMovementButtonService } from './MyDeckCardPageMovementButtonService';
import {MyDeckCardPageMovementButtonType} from "../entity/MyDeckCardPageMovementButtonType";
import {MyDeckCardPageMovementButton} from "../entity/MyDeckCardPageMovementButton";
import {MyDeckCardPageMovementButtonRepository} from "../repository/MyDeckCardPageMovementButtonRepository";
import {MyDeckCardPageMovementButtonRepositoryImpl} from "../repository/MyDeckCardPageMovementButtonRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class MyDeckCardPageMovementButtonServiceImpl implements MyDeckCardPageMovementButtonService {
    private static instance: MyDeckCardPageMovementButtonServiceImpl;
    private myDeckCardPageMovementButtonRepository: MyDeckCardPageMovementButtonRepository;

    private constructor(myDeckCardPageMovementButtonRepository: MyDeckCardPageMovementButtonRepository) {
        this.myDeckCardPageMovementButtonRepository = myDeckCardPageMovementButtonRepository;
    }

    public static getInstance(): MyDeckCardPageMovementButtonServiceImpl {
        if (!MyDeckCardPageMovementButtonServiceImpl.instance) {
            const myDeckCardPageMovementButtonRepository = MyDeckCardPageMovementButtonRepositoryImpl.getInstance();
            MyDeckCardPageMovementButtonServiceImpl.instance = new MyDeckCardPageMovementButtonServiceImpl(myDeckCardPageMovementButtonRepository);
        }
        return MyDeckCardPageMovementButtonServiceImpl.instance;
    }

    public async createMyDeckCardPageMovementButton(
        type: MyDeckCardPageMovementButtonType,
        position: Vector2d
    ): Promise<THREE.Group | null> {
        const buttonGroup = new THREE.Group();
        try {
            const button = await this.myDeckCardPageMovementButtonRepository.createMyDeckCardPageMovementButton(type, position);
            const buttonMesh = button.getMesh()
            buttonGroup.add(buttonMesh)

        } catch (error) {
            console.error('Error creating my deck card page movement button:', error);
            return null;
        }
        return buttonGroup;
    }

    public adjustMyDeckCardPageMovementButtonPosition(): void {
        const buttonList = this.myDeckCardPageMovementButtonRepository.getAllMyDeckCardPageMovementButtons();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        buttonList.forEach((button) =>{
            const buttonMesh = button.getMesh();
            const initialPosition = button.position;

            const buttonWidth = 0.05 * windowWidth;
            const buttonHeight = buttonWidth * 1.66;

            const newPositionX = initialPosition.getX() * windowWidth;
            const newPositionY = initialPosition.getY() * windowHeight;

            buttonMesh.geometry.dispose();
            buttonMesh.geometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);

            buttonMesh.position.set(newPositionX, newPositionY, 0);
        });

    }

    public getMyDeckCardPageMovementButtonById(id: number): MyDeckCardPageMovementButton | null {
        return this.myDeckCardPageMovementButtonRepository.findById(id);
    }

    public deleteMyDeckCardPageMovementButtonById(id: number): void {
        this.myDeckCardPageMovementButtonRepository.deleteById(id);
    }

    public getAllMyDeckCardPageMovementButtons(): MyDeckCardPageMovementButton[] {
        return this.myDeckCardPageMovementButtonRepository.findAll();
    }

    public deleteAllMyDeckCardPageMovementButtons(): void {
        this.myDeckCardPageMovementButtonRepository.deleteAll();
    }
}
