
import { NeonBorderRepository } from "./NeonBorderRepository";
import {NeonBorder} from "../entity/NeonBorder";
import {NeonBorderSceneType} from "../entity/NeonBorderSceneType";
import chalk from "chalk";
import {NeonBorderType} from "../entity/NeonBorderType";

export class NeonBorderRepositoryImpl implements NeonBorderRepository {
    private static instance: NeonBorderRepositoryImpl | null = null;
    private storage: Map<number, NeonBorder> = new Map();

    private constructor() {} // private 생성자로 외부에서 인스턴스 생성 불가

    static getInstance(): NeonBorderRepositoryImpl {
        if (!NeonBorderRepositoryImpl.instance) {
            NeonBorderRepositoryImpl.instance = new NeonBorderRepositoryImpl();
        }
        return NeonBorderRepositoryImpl.instance;
    }

    save(neonBorder: NeonBorder): NeonBorder {
        console.log(chalk.red.bold(`NeonBorderRepositoryImpl save() neonBorder Id: ${neonBorder.getId()}, type: ${neonBorder.neonBorderSceneType}`));
        this.storage.set(neonBorder.getId(), neonBorder);
        return neonBorder;
    }

    findById(id: number): NeonBorder | null {
        return this.storage.get(id) || null;
    }

    findAll(): NeonBorder[] {
        return Array.from(this.storage.values());
    }

    deleteById(id: number): void {
        this.storage.delete(id);
    }

    deleteAll(): void {
        this.storage.clear();
    }

    findByCardSceneId(cardSceneId: number): NeonBorder | null {
        for (const neonBorder of this.storage.values()) {
            if (neonBorder.getNeonBorderSceneId() === cardSceneId) {
                return neonBorder;
            }
        }
        return null;
    }

    findByCardSceneIdWithSceneType(cardSceneId: number, sceneType: NeonBorderSceneType): NeonBorder | null {
        for (const neonBorder of this.storage.values()) {
            if (
                neonBorder.getNeonBorderSceneId() === cardSceneId &&
                neonBorder.getNeonBorderSceneType() === NeonBorderSceneType[sceneType]
            ) {
                return neonBorder;
            }
        }
        return null;
    }

    findByCardSceneIdWithPlacement(cardSceneId: number, sceneType: NeonBorderSceneType, borderType: NeonBorderType): NeonBorder | null {
        for (const neonBorder of this.storage.values()) {
            console.log(chalk.red.bold(`NeonBorderRepositoryImpl findByCardSceneIdWithPlacement() neonBorder: ${JSON.stringify(neonBorder, null, 2)}`));
            console.log(chalk.red.bold(`cardSceneId: ${cardSceneId}, sceneType: ${sceneType}`));
            console.log(chalk.red.bold(`NeonBorderSceneType[sceneType]: ${NeonBorderSceneType[sceneType]}, neonBorder.getNeonBorderSceneType(): ${neonBorder.getNeonBorderSceneType()}`));
            if (
                neonBorder.getNeonBorderSceneId() === cardSceneId &&
                neonBorder.getNeonBorderSceneType() === NeonBorderSceneType[sceneType] &&
                neonBorder.getType() === borderType
            ) {
                return neonBorder;
            }
        }
        return null;
    }

    findOpponentMaster(borderType: NeonBorderType): NeonBorder | null {
        for (const neonBorder of this.storage.values()) {
            if (
                neonBorder.getType() === borderType
            ) {
                console.log(chalk.red.bold(`Found Opponent Master NeonBorder (id: ${neonBorder.getId()})`));
                return neonBorder;
            }
        }
        return null;
    }

}
