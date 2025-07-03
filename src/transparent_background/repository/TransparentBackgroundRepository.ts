import * as THREE from 'three';
import {TransparentBackground} from "../entity/TransparentBackground";

export interface TransparentBackgroundRepository {
    createTransparentBackground(id: string): Promise<TransparentBackground>;
    findTransparentBackground(): TransparentBackground | null;
    deleteTransparentBackground(): void;
}