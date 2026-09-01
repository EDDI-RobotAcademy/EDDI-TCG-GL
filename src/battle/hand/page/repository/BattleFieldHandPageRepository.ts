import * as THREE from 'three';

export interface BattleFieldHandPageRepository {
    createPrevButton(): Promise<THREE.Mesh>;
    createNextButton(): Promise<THREE.Mesh>;

    getCurrentPage(): number;
    setCurrentPage(page: number): void;
    getCardsPerPage(): number;
}