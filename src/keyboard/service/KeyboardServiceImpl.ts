import { KeyboardService } from "./KeyboardService";
import {KeyboardRepository} from "../repository/KeyboardRepository";
import {KeyboardRepositoryImpl} from "../repository/KeyboardRepositoryImpl";
import {KeyboardActionHandler} from "../handler/KeyboardActionHandler";
import * as THREE from "three";

export class KeyboardServiceImpl implements KeyboardService {
    private static instance: KeyboardServiceImpl | null = null;
    private repository: KeyboardRepository;

    private keyboardActionHandler: KeyboardActionHandler;

    private constructor(scene: THREE.Scene) {
        this.repository = KeyboardRepositoryImpl.getInstance();
        this.keyboardActionHandler = KeyboardActionHandler.getInstance(scene);
    }

    static getInstance(scene: THREE.Scene): KeyboardServiceImpl {
        if (!KeyboardServiceImpl.instance) {
            KeyboardServiceImpl.instance = new KeyboardServiceImpl(scene);
        }
        return KeyboardServiceImpl.instance;
    }

    processKeyboard(key: string): void {
        console.log(`KeyboardServiceImpl processKeyboard(): ${key}`)
        const handler = this.repository.getHandler(key);
        if (!handler) return;

        const action = handler();
        if (!action) return;

        this.keyboardActionHandler.execute(action);
    }
}
