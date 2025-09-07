import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {DeckCardCountMarkerService} from "./DeckCardCountMarkerService";

import {DeckCardCountMarker} from "../entity/DeckCardCountMarker";
import {DeckCardCountMarkerPosition} from "../../deck_card_count_marker_position/entity/DeckCardCountMarkerPosition";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";

import {DeckCardCountMarkerRepositoryImpl} from "../repository/DeckCardCountMarkerRepositoryImpl";
import {DeckCardCountMarkerPositionRepositoryImpl} from "../../deck_card_count_marker_position/repository/DeckCardCountMarkerPositionRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";

import {ClippingMaskManager} from "../../clipping_mask_manager/ClippingMaskManager";

export class DeckCardCountMarkerServiceImpl implements DeckCardCountMarkerService {
    private static instance: DeckCardCountMarkerServiceImpl;
    private deckCardCountMarkerRepository: DeckCardCountMarkerRepositoryImpl;
    private deckCardCountMarkerPositionRepository: DeckCardCountMarkerPositionRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private clippingMaskManager: ClippingMaskManager;

    private constructor(scene: THREE.Scene) {
        this.deckCardCountMarkerRepository = DeckCardCountMarkerRepositoryImpl.getInstance(scene);
        this.deckCardCountMarkerPositionRepository = DeckCardCountMarkerPositionRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.clippingMaskManager = ClippingMaskManager.getInstance();
    }

    public static getInstance(scene: THREE.Scene): DeckCardCountMarkerServiceImpl {
        if (!DeckCardCountMarkerServiceImpl.instance) {
            DeckCardCountMarkerServiceImpl.instance = new DeckCardCountMarkerServiceImpl(scene);
        }
        return DeckCardCountMarkerServiceImpl.instance;
    }

    public async createDeckCardCountMarkerWithPosition(deckId: number, cardId: number): Promise<THREE.Group | null> {
        const markerGroup = new THREE.Group();
        try {
            const markerId = this.getMarkerIdByDeckIdAndCardId(deckId, cardId);
            if (markerId == null) {
                const position = this.createDeckCardCountMarkerPosition(deckId, cardId);
                console.log(`[New Marker] Card ID ${cardId}: Position X=${position.position.getX()}, Y=${position.position.getY()}`);

                const deckCardCountMarker = await this.createDeckCardCountMarker(deckId, cardId, position.position);
                markerGroup.add(deckCardCountMarker.getMesh());

            } else {
                const existingPosition = this.getPositionByMarkerId(markerId);
                const existingMarkerMesh = this.getMarkerMeshByDeckIdAndCardId(deckId, cardId);

                if (existingPosition && existingMarkerMesh) {
                    const positionX = existingPosition.getX() * window.innerWidth;
                    const positionY = existingPosition.getY() * window.innerHeight;

                    existingMarkerMesh.position.set(positionX, positionY, 0);
                    markerGroup.add(existingMarkerMesh);
                }
            }
        } catch (error) {
            console.error(`[Error] Failed to create Deck Card Count Marker: ${error}`);
            return null;
        }
        return markerGroup;
    }

    public adjustDeckCardCountMarkerPosition(): void {
        const currentDeckButtonId = this.getCurrentClickDeckButton();
        if (currentDeckButtonId === null) {
            console.error("No deck button clicked");
            return;
        }

        const deckIdList = this.getAllDeckIdList();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        for (const deckId of deckIdList) {
            const markerIdList = this.getMarkerIdListByDeckId(deckId);

            for (const markerId of markerIdList) {
                const markerMesh = this.getMarkerByMarkerId(markerId);
                if (!markerMesh) {
                    console.warn(`[WARN] Marker Mesh (with Marker ID: ${markerId}) not found`);
                    continue;
                }

                const initialPosition = this.getPositionByMarkerId(markerId);
                console.log(`[DEBUG] (adjust) InitialPosition: ${initialPosition}`);

                if (!initialPosition) {
                    console.error(`[DEBUG] (adjust) No position found for button id: ${markerId}`);
                    continue;
                }

                const markerWidth = 0.012 * window.innerWidth;
                const markerHeight = markerWidth;

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;
                console.log(`[DEBUG] (adjust) Deck Card Count Marker ${markerId}:`, {
                    initialPosition: initialPosition,
                    newPositionX,
                    newPositionY,
                });

                markerMesh.geometry.dispose();
                markerMesh.geometry = new THREE.PlaneGeometry(markerWidth, markerHeight);
                markerMesh.position.set(newPositionX, newPositionY, 0);

                const scrollArea = this.getScrollArea();
                if (scrollArea) {
                    scrollArea.width = 0.54 * windowWidth;
                    scrollArea.height = 0.745 * windowHeight;
                    scrollArea.position.set(0 * window.innerWidth, -0.125 * window.innerHeight);
                    const clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
                    this.applyClippingPlanesToMesh(markerMesh, clippingPlanes);
                }

            }
        }
    }

    private async createDeckCardCountMarker(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardCountMarker> {
        return await this.deckCardCountMarkerRepository.createDeckCardCountMarker(deckId, cardId, position);
    }

    private createDeckCardCountMarkerPosition(deckId: number, cardId: number): DeckCardCountMarkerPosition {
        return this.deckCardCountMarkerPositionRepository.addDeckCardCountMarkerPosition(deckId, cardId);
    }

    private getMarkerIdByDeckIdAndCardId(deckId: number, cardId: number): number | null {
        const markerId = this.deckCardCountMarkerRepository.findMarkerIdByDeckIdAndCardId(deckId, cardId);
        if (markerId == null) {
            console.warn(`[WARN] Deck Card Count Marker(With Marker ID: ${markerId}) not found`);
            return null;
        }
        return markerId;
    }

    private getPositionByMarkerId(markerId: number): DeckCardCountMarkerPosition | null {
        return this.deckCardCountMarkerPositionRepository.findPositionByPositionId(markerId);
    }

    private getMarkerMeshByDeckIdAndCardId(deckId: number, cardId: number): THREE.Mesh | null {
        const marker = this.deckCardCountMarkerRepository.findMarkerByDeckIdAndCardId(deckId, cardId);
        if (!marker) {
            console.warn(`[WARN] Deck Card Count Marker (with Deck ID: ${deckId}, Card ID: ${cardId}) not found`);
            return null;
        }
        return marker.getMesh();
    }

    public getCurrentClickDeckButton(): number | null {
        return this.myDeckButtonClickDetectRepository.getCurrentClickDeckButtonId();
    }

    public getAllDeckIdList(): number[] {
        return this.deckCardCountMarkerRepository.findDeckIdList();
    }

    public getMarkerIdListByDeckId(deckId: number): number[] {
        return this.deckCardCountMarkerRepository.findMarkerIdListByDeckId(deckId);
    }

    private getMarkerByMarkerId(markerId: number): THREE.Mesh | null {
        const marker = this.deckCardCountMarkerRepository.findMarkerByMarkerId(markerId);
        if (!marker) {
            console.warn(`[WARN] Marker (with Marker ID: ${markerId}) not found`);
            return null;
        }
        const markerMesh = marker.getMesh();
        return markerMesh;
    }

    public getMarkerListByDeckId(deckId: number): DeckCardCountMarker[] {
        const markerList = this.deckCardCountMarkerRepository.findMarkerListByDeckId(deckId);
        if (!markerList) {
            return [];
        }
        return markerList;
    }

    public initializeMarkerVisibility(): void {
        const deckIdList = this.getAllDeckIdList();
        const sortedDeckIdList = [...deckIdList].sort((a, b) => a - b);
        const firstDeckId = sortedDeckIdList[0];

        deckIdList.forEach((deckId, index) => {
            const markerList = this.getMarkerListByDeckId(deckId);
            if (deckId === firstDeckId) {
                markerList.forEach((marker) => marker.setVisibility(true));
            } else {
                markerList.forEach((marker) => marker.setVisibility(false));
            }
        });
    }

    public saveMarkerGroup(deckId: number): void {
        this.deckCardCountMarkerRepository.saveMarkerGroupByDeckId(deckId);
    }

    public getMarkerGroupByDeckId(deckId: number): THREE.Group {
        return this.deckCardCountMarkerRepository.findMarkerGroupByDeckId(deckId);
    }

    public resetMarkerGroup(): void {
        this.deckCardCountMarkerRepository.resetMarkerGroup();
    }

    private getScrollArea(): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(3, 1);
    }

    private applyClippingPlanesToMesh(mesh: THREE.Mesh, clippingPlanes: THREE.Plane[]): void {
        this.clippingMaskManager.applyClippingPlanesToMesh(mesh, clippingPlanes);
    }

    public applyClippingMaskToMarker(): void {
        const deckIdList = this.getAllDeckIdList();
        const scrollArea = this.getScrollArea();
        let clippingPlanes: THREE.Plane[] = [];

        if (scrollArea) {
            clippingPlanes = this.clippingMaskManager.setClippingPlanes(scrollArea);
            deckIdList.forEach((deckId) => {
                const markerGroup = this.getMarkerGroupByDeckId(deckId);
                markerGroup.children.forEach((markerObject) => {
                    if (markerObject instanceof THREE.Mesh) {
                        this.applyClippingPlanesToMesh(markerObject, clippingPlanes);
                    } else {
                        console.warn("[WARN] Skipping non-mesh object in Marker Group:", markerObject);
                    }
                });
            });
        }
    }

}
