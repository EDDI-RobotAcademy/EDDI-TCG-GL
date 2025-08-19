import {NeonBorder} from "../entity/NeonBorder";
import {NeonBorderSceneType} from "../entity/NeonBorderSceneType";
import {NeonBorderType} from "../entity/NeonBorderType";

export interface NeonBorderRepository {
    save(neonBorder: NeonBorder): NeonBorder;
    findById(id: number): NeonBorder | null;
    findAll(): NeonBorder[];
    deleteById(id: number): void;
    deleteAll(): void;

    findByCardSceneId(cardSceneId: number): NeonBorder | null;
    findByCardSceneIdWithSceneType(sceneId: number, type: NeonBorderSceneType): NeonBorder | null;
    findByCardSceneIdWithPlacement(sceneId: number, type: NeonBorderSceneType, borderType: NeonBorderType): NeonBorder | null;
    findOpponentMaster(borderType: NeonBorderType): NeonBorder | null;
}
