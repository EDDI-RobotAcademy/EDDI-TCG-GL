import { ShopGachaButton } from "../entity/ShopGachaButton";

export interface ShopGachaButtonRepository {
    createButton(id: number, race: string, index: number, textureId: number): Promise<ShopGachaButton>;
    getButton(id: number): ShopGachaButton | undefined;
    getAllButtons(): ShopGachaButton[];
    clearButtons(): void;
} 