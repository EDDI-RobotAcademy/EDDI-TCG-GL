import {MouseCursorDetectAreaMap} from "../entity/MouseCursorDetectAreaMap";
import {MouseCursorDetectArea} from "../entity/MouseCursorDetectArea";
import {MouseCursorDetectRepository} from "./MouseCursorDetectRepository";

export class MouseCursorDetectRepositoryImpl implements MouseCursorDetectRepository {
    private static instance: MouseCursorDetectRepositoryImpl;
    private areaMap: MouseCursorDetectAreaMap;

    private constructor() {
        this.areaMap = new MouseCursorDetectAreaMap();
    }

    public static getInstance(): MouseCursorDetectRepositoryImpl {
        if (!MouseCursorDetectRepositoryImpl.instance) {
            MouseCursorDetectRepositoryImpl.instance = new MouseCursorDetectRepositoryImpl();
        }
        return MouseCursorDetectRepositoryImpl.instance;
    }

    public detectArea(mouseX: number, mouseY: number): MouseCursorDetectArea | null {
        for (const areaKey in MouseCursorDetectArea) {
            const area = Number(areaKey);
            if (isNaN(area)) continue; // 숫자가 아닌 값 필터링

            const bounds = this.areaMap.getAbsoluteBounds(area as MouseCursorDetectArea);
            console.log(`getAbsoluteBounds(): bounds: ${JSON.stringify(bounds, null, 2)}`);
            if (bounds && this.isInside(mouseX, mouseY, bounds)) {
                console.log(`getAbsoluteBounds() -> area: ${area}`)
                return area as MouseCursorDetectArea;
            }
        }
        return null;
    }

    private isInside(x: number, y: number, bounds: { x1: number, y1: number, x2: number, y2: number }): boolean {
        return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2;
    }
}
