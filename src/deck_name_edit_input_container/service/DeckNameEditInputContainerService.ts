import * as THREE from 'three';

export interface DeckNameEditInputContainerService {
    createDeckNameEditInputContainer(): Promise<HTMLDivElement | null>;
}