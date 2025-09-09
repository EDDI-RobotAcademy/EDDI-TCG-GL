import * as THREE from 'three';
import {MyDeckSearchInputContainer} from "../entity/MyDeckSearchInputContainer";

export interface MyDeckSearchInputContainerRepository {
    createMyDeckSearchInputContainer(): Promise<MyDeckSearchInputContainer>;
    findMyDeckSearchInputContainer(): MyDeckSearchInputContainer | null;
    deleteMyDeckSearchInputContainer(): void;
}