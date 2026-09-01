import * as THREE from 'three';
import {BattleFieldHandPageService} from "./BattleFieldHandPageService";

import {BattleFieldHandPageRepository} from "../repository/BattleFieldHandPageRepository";
import {BattleFieldHandPageRepositoryImpl} from "../repository/BattleFieldHandPageRepositoryImpl";

export class BattleFieldHandPageServiceImpl implements BattleFieldHandPageService {
    private static instance: BattleFieldHandPageServiceImpl | null = null;

    private battleFieldHandPageRepository: BattleFieldHandPageRepository;

    private constructor() {
        this.battleFieldHandPageRepository = BattleFieldHandPageRepositoryImpl.getInstance();
    }

    public static getInstance(): BattleFieldHandPageServiceImpl {
        if (!this.instance) {
            this.instance = new BattleFieldHandPageServiceImpl();
        }
        return this.instance;
    }

    async createPrevButton(): Promise<THREE.Mesh> {
        return await this.battleFieldHandPageRepository.createPrevButton();
    }

    async createNextButton(): Promise<THREE.Mesh> {
        return await this.battleFieldHandPageRepository.createNextButton();
    }
}