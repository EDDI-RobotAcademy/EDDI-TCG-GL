import {NeonBorderStatus} from "./NeonBorderStatus";
import {IdGenerator} from "../../common/id_generator/IdGenerator";
import {NeonBorderSceneType} from "./NeonBorderSceneType";
import {NeonBorderType} from "./NeonBorderType";

export class NeonBorder {
    id: number;
    neonBorderLineSceneIdList: number[];
    neonBorderLinePositionIdList: number[];
    neonBorderSceneType: NeonBorderSceneType;
    neonBorderSceneId: number;
    status: NeonBorderStatus;
    type: NeonBorderType;

    constructor(
        neonBorderLineSceneIdList: number[],
        neonBorderLinePositionIdList: number[],
        neonBorderSceneType: NeonBorderSceneType,
        neonBorderSceneId: number,
        type: NeonBorderType,
        status: NeonBorderStatus = NeonBorderStatus.ACTIVE
    ) {
        this.id = IdGenerator.generateId("NeonBorder");
        this.neonBorderLineSceneIdList = neonBorderLineSceneIdList;
        this.neonBorderLinePositionIdList = neonBorderLinePositionIdList;
        this.neonBorderSceneType = neonBorderSceneType;
        this.neonBorderSceneId = neonBorderSceneId;
        this.type = type;
        this.status = status;
    }

    getId(): number {
        return this.id;
    }

    getNeonBorderLineSceneIdList(): number[] {
        return this.neonBorderLineSceneIdList;
    }

    getNeonBorderLinePositionIdList(): number[] {
        return this.neonBorderLinePositionIdList;
    }

    getNeonBorderSceneType(): NeonBorderSceneType {
        return this.neonBorderSceneType;
    }

    getNeonBorderSceneId(): number {
        return this.neonBorderSceneId;
    }

    setNeonBorderSceneId(sceneId: number): void {
        this.neonBorderSceneId = sceneId
    }

    getStatus(): NeonBorderStatus {
        return this.status;
    }

    setStatus(newStatus: NeonBorderStatus): void {
        this.status = newStatus;
    }

    getType(): NeonBorderType {
        return this.type;
    }
}