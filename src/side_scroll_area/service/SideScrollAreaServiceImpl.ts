import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";

import {SideScrollAreaService} from './SideScrollAreaService';
import {SideScrollArea} from "../entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../repository/SideScrollAreaRepositoryImpl";
import {SideScrollAreaType} from "../entity/SideScrollAreaType";

export class SideScrollAreaServiceImpl implements SideScrollAreaService {
    private static instance: SideScrollAreaServiceImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;

    private constructor() {
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
    }

    public static getInstance(): SideScrollAreaServiceImpl {
        if (!SideScrollAreaServiceImpl.instance) {
            SideScrollAreaServiceImpl.instance = new SideScrollAreaServiceImpl();
        }
        return SideScrollAreaServiceImpl.instance;
    }

    public async createSideScrollArea(
        id: string, type: SideScrollAreaType, width: number, height: number, positionX: number, positionY: number
    ): Promise<THREE.Mesh | null> {

        const area = await this.sideScrollAreaRepository.createSideScrollArea(
            id, type, width, height, positionX, positionY);
        const areaMesh = area.getMesh();

        return areaMesh;
    }

    public adjustMakeDeckSideScrollAreaPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const allArea = this.getSideScrollAreaByType(1);
        if (!allArea) {
            console.error("DeckMakeButton is null. Cannot adjust position.");
            return;
        }

        allArea.forEach((area) => {
            const areaMesh = area.getMesh();
            const initialPosition = area.position;

            const areaWidth = 0.255 * windowWidth;
            const areaHeight = 0.735 * windowHeight;

            const newPositionX = 0.3895 * windowWidth;
            const newPositionY = 0.04 * windowHeight;

            areaMesh.geometry.dispose();
            areaMesh.geometry = new THREE.PlaneGeometry(areaWidth, areaHeight);

            areaMesh.position.set(newPositionX, newPositionY, 0);
        });
    }

    public adjustMyCardSideScrollAreaPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const allArea = this.getSideScrollAreaByType(2);
        if (!allArea) {
            console.error("DeckMakeButton is null. Cannot adjust position.");
            return;
        }

        allArea.forEach((area) => {
            const areaMesh = area.getMesh();
            const initialPosition = area.position;

            const areaWidth = 0.902 * windowWidth;
            const areaHeight = 0.884 * windowHeight;

            const newPositionX = 0.048 * windowWidth;
            const newPositionY = -0.06 * windowHeight;

            areaMesh.geometry.dispose();
            areaMesh.geometry = new THREE.PlaneGeometry(areaWidth, areaHeight);

            areaMesh.position.set(newPositionX, newPositionY, 0);
        });
    }

    public adjustMyDeckSideScrollAreaPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const allArea = this.getSideScrollAreaByTypeAndId(3, 0);
        if (!allArea) {
            console.error("Scroll Area is null. Cannot adjust position.");
            return;
        }

        const areaMesh = allArea.getMesh();
        const initialPosition = allArea.position;

        const areaWidth = 0.203 * windowWidth;
        const areaHeight = 0.46 * windowHeight;

        const newPositionX = -0.381 * windowWidth;
        const newPositionY = -0.035 * windowHeight;

        areaMesh.geometry.dispose();
        areaMesh.geometry = new THREE.PlaneGeometry(areaWidth, areaHeight);

        areaMesh.position.set(newPositionX, newPositionY, 0);
    }

    public adjustMyDeckCardScrollAreaPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const allArea = this.getSideScrollAreaByTypeAndId(3, 1);
        if (!allArea) {
            console.error("Scroll Area is null. Cannot adjust position.");
            return;
        }

        const areaMesh = allArea.getMesh();
        const initialPosition = allArea.position;

        const areaWidth = 0.54 * windowWidth;
        const areaHeight = 0.745 * windowHeight;

        const newPositionX = 0 * windowWidth;
        const newPositionY = -0.125 * windowHeight;

        areaMesh.geometry.dispose();
        areaMesh.geometry = new THREE.PlaneGeometry(areaWidth, areaHeight);

        areaMesh.position.set(newPositionX, newPositionY, 0);
    }

    public getSideScrollAreaByType(type: SideScrollAreaType): SideScrollArea[] | null {
        return this.sideScrollAreaRepository.findAreasByType(type);
    }

    public getSideScrollAreaByTypeAndId(type: SideScrollAreaType, id: number): SideScrollArea | null {
        return this.sideScrollAreaRepository.findAreaByTypeAndId(type, id);
    }

   public getAllAreaTypes(): SideScrollAreaType[] {
       return this.sideScrollAreaRepository.getAllTypes();
   }

   public getAreaIdByType(type: SideScrollAreaType): number[] {
       return this.sideScrollAreaRepository.getAreaIdsByType(type);
   }
}
