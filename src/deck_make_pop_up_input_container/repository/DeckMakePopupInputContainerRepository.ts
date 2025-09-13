import * as THREE from 'three';
import {DeckMakePopupInputContainer} from "../entity/DeckMakePopupInputContainer";

export interface DeckMakePopupInputContainerRepository {
    createDeckMakePopupInputContainer(): Promise<DeckMakePopupInputContainer>;
    findDeckMakePopupInputContainer(): DeckMakePopupInputContainer | null;
    deleteDeckMakePopupInputContainer(): void;
}