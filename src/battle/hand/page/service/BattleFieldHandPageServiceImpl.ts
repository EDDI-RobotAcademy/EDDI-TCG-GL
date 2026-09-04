import * as THREE from 'three';
import {BattleFieldHandPageService} from "./BattleFieldHandPageService";

import {BattleFieldHandPageStore} from "../store/BattleFieldHandPageStore";
import {BattleFieldHandPageStoreImpl} from "../store/BattleFieldHandPageStoreImpl";

export class BattleFieldHandPageServiceImpl implements BattleFieldHandPageService {
    private static instance: BattleFieldHandPageServiceImpl | null = null;

    private battleFieldHandPageStore: BattleFieldHandPageStore;

    private constructor() {
        this.battleFieldHandPageStore = BattleFieldHandPageStoreImpl.getInstance();
    }

    public static getInstance(): BattleFieldHandPageServiceImpl {
        if (!this.instance) {
            this.instance = new BattleFieldHandPageServiceImpl();
        }
        return this.instance;
    }

    async createPrevButton(): Promise<THREE.Mesh> {
        return await this.battleFieldHandPageStore.createPrevButton();
    }

    async createNextButton(): Promise<THREE.Mesh> {
        return await this.battleFieldHandPageStore.createNextButton();
    }
}