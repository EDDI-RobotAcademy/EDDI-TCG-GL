import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {SideScrollAreaRepository} from './SideScrollAreaRepository';
import {SideScrollArea} from "../entity/SideScrollArea";
import {TransparentRectangle} from "../../shape/TransparentRectangle";
import {SideScrollAreaType} from "../entity/SideScrollAreaType";

export class SideScrollAreaRepositoryImpl implements SideScrollAreaRepository {
    private static instance: SideScrollAreaRepositoryImpl;
    private areaMap: Map<SideScrollAreaType, { areaId: number, area: SideScrollArea }[]> = new Map();

    private readonly AREA_WIDTH: number = 0.255
    private readonly AREA_HEIGHT: number = 0.735
    private readonly POSITION_X: number = 0.3895
    private readonly POSITION_Y: number = 0.04

    private constructor() {}

    public static getInstance(): SideScrollAreaRepositoryImpl {
        if (!SideScrollAreaRepositoryImpl.instance) {
            SideScrollAreaRepositoryImpl.instance = new SideScrollAreaRepositoryImpl();
        }
        return SideScrollAreaRepositoryImpl.instance;
    }

    public async createSideScrollArea(
        id: string, type: SideScrollAreaType, width: number, height: number, positionX: number, positionY: number
    ): Promise<SideScrollArea> {
        const areaWidth = width * window.innerWidth;
        const areaHeight = height * window.innerHeight;

        const areaPositionX = positionX * window.innerWidth;
        const areaPositionY = positionY * window.innerHeight;
        const position = new THREE.Vector2(areaPositionX, areaPositionY);

        const area = new TransparentRectangle(position, areaWidth, areaHeight, 0xffffff, 0, id);
        const areaMesh = area.getMesh();

        const newArea = new SideScrollArea(type, areaMesh, position, areaWidth, areaHeight);

        // areaMap에서 해당 타입의 배열을 가져옴 (없으면 빈 배열 생성)
        if (!this.areaMap.has(type)) {
            this.areaMap.set(type, []);
        }

        this.areaMap.get(type)!.push({ areaId: newArea.id, area: newArea });

        return newArea;
    }

    public findAreaById(id: number): SideScrollArea | null {
        for (const areas of this.areaMap.values()) {
            const found = areas.find(entry => entry.areaId === id);
            if (found) return found.area;
        }
        return null;
    }

    public findAreasByType(type: SideScrollAreaType): SideScrollArea[] {
        return this.areaMap.get(type)?.map(entry => entry.area) || [];
    }

    public findAreaByTypeAndId(type: SideScrollAreaType, areaId: number): SideScrollArea | null {
        const areas = this.areaMap.get(type);
        if (!areas) return null;

        const found = areas.find(entry => entry.areaId === areaId);
        return found ? found.area : null;
    }

    public deleteAllArea(): void {
        this.areaMap.clear();
    }

    public deleteAreasByType(type: SideScrollAreaType): void {
        this.areaMap.delete(type);
    }

    public getAllTypes(): SideScrollAreaType[] {
        console.log(`all area type: ${Array.from(this.areaMap.keys())}`);
        return Array.from(this.areaMap.keys());
    }

    public getAreaIdsByType(type: SideScrollAreaType): number[] {
        return this.areaMap.get(type)?.map(entry => entry.areaId) || [];
    }
}
