import * as THREE from 'three';

export interface MyDeckSearchInputContainerService {
    createMyDeckSearchInputContainer(): Promise<HTMLDivElement | null>;
}