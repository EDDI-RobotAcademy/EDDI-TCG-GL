import * as THREE from 'three';
import {DeckNameEditInputContainer} from "../entity/DeckNameEditInputContainer";

export interface DeckNameEditInputContainerRepository {
    createDeckNameEditInputContainer(): Promise<DeckNameEditInputContainer>;
    findDeckNameEditInputContainer(): DeckNameEditInputContainer | null;
    deleteDeckNameEditInputContainer(): void;
}