import { ShopGachaButton } from "../entity/ShopGachaButton";

export interface ShopGachaButtonService {
    initializeButtons(): Promise<void>;
    getButton(id: number): ShopGachaButton | undefined;
    getAllButtons(): ShopGachaButton[];
    adjustButtonPositions(): void;
    clearButtons(): void;
} 