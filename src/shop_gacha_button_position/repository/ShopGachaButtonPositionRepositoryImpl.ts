import { Vector2d } from "../../common/math/Vector2d";
import { ShopGachaButtonPosition } from "../entity/ShopGachaButtonPosition";
import { ShopGachaButtonPositionRepository } from "./ShopGachaButtonPositionRepository";

export class ShopGachaButtonPositionRepositoryImpl implements ShopGachaButtonPositionRepository {
    private static instance: ShopGachaButtonPositionRepositoryImpl | null = null;
    private positions: Map<number, ShopGachaButtonPosition> = new Map();

    private initialX: number = -0.19;
    private initialY: number = -0.08;
    private incrementX: number = 0.219;

    // 최소/최대 간격 설정
    private readonly MIN_BUTTON_GAP: number = 0.15;  // 버튼 간 최소 간격 (화면 너비 대비)
    private readonly MAX_BUTTON_GAP: number = 0.25;  // 버튼 간 최대 간격 (화면 너비 대비)

    private constructor() {}

    public static getInstance(): ShopGachaButtonPositionRepositoryImpl {
        if (!ShopGachaButtonPositionRepositoryImpl.instance) {
            ShopGachaButtonPositionRepositoryImpl.instance = new ShopGachaButtonPositionRepositoryImpl();
        }
        return ShopGachaButtonPositionRepositoryImpl.instance;
    }

    createGachaButtonPosition(id: number, index: number): ShopGachaButtonPosition {
        const x = this.initialX + (index * this.incrementX);
        const y = this.initialY;
        const buttonPosition = new ShopGachaButtonPosition(id, x, y);
        this.positions.set(id, buttonPosition);
        return buttonPosition;
    }

    getGachaButtonPosition(id: number): ShopGachaButtonPosition | undefined {
        return this.positions.get(id);
    }

    updatePositions(): void {
        this.positions.forEach((position, id) => {
            const index = id - 1;
            const x = this.initialX + (index * this.incrementX);
            const y = this.initialY;
            position.setPosition(x, y);
        });
    }
} 