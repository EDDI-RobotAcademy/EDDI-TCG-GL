import { ShopGachaButtonPosition } from "../entity/ShopGachaButtonPosition";

export interface ShopGachaButtonPositionRepository {
    createGachaButtonPosition(id: number, index: number): ShopGachaButtonPosition;
    getGachaButtonPosition(id: number): ShopGachaButtonPosition | undefined;
    updatePositions(): void;
} 