import * as THREE from "three";

import {SideScrollAreaDetectService} from "./SideScrollAreaDetectService";
import {SideScrollArea} from "../../side_scroll_area/entity/SideScrollArea";
import {SideScrollAreaRepositoryImpl} from "../../side_scroll_area/repository/SideScrollAreaRepositoryImpl";
import {SideScrollAreaDetectRepositoryImpl} from "../repository/SideScrollAreaDetectRepositoryImpl";
import {SelectedCardBlockRepositoryImpl} from "../../selected_card_block/repository/SelectedCardBlockRepositoryImpl";
import {SideScrollAreaType} from "../../side_scroll_area/entity/SideScrollAreaType";
import {MyCardScrollBarRepositoryImpl} from "../../my_card_scroll_bar/repository/MyCardScrollBarRepositoryImpl";

import {CameraRepository} from "../../camera/repository/CameraRepository";
import {CameraRepositoryImpl} from "../../camera/repository/CameraRepositoryImpl";

export class SideScrollAreaDetectServiceImpl implements SideScrollAreaDetectService {
    private static instance: SideScrollAreaDetectServiceImpl | null = null;
    private sideScrollAreaDetectRepository: SideScrollAreaDetectRepositoryImpl;
    private sideScrollAreaRepository: SideScrollAreaRepositoryImpl;
    private selectedCardBlockRepository: SelectedCardBlockRepositoryImpl;
    private myCardScrollBarRepository: MyCardScrollBarRepositoryImpl;

    private cameraRepository: CameraRepository;
    private leftMouseDown: boolean = false;
    private myCardScrollAreaDetectState: boolean = true;
    private myDeckScrollAreaDetectState: boolean = true;

    private constructor(private camera: THREE.Camera, private scene: THREE.Scene) {
        this.sideScrollAreaDetectRepository = SideScrollAreaDetectRepositoryImpl.getInstance();
        this.sideScrollAreaRepository = SideScrollAreaRepositoryImpl.getInstance();
        this.selectedCardBlockRepository = SelectedCardBlockRepositoryImpl.getInstance();
        this.myCardScrollBarRepository = MyCardScrollBarRepositoryImpl.getInstance();
        this.cameraRepository = CameraRepositoryImpl.getInstance();
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): SideScrollAreaDetectServiceImpl {
        if (!SideScrollAreaDetectServiceImpl.instance) {
            SideScrollAreaDetectServiceImpl.instance = new SideScrollAreaDetectServiceImpl(camera, scene);
        }
        return SideScrollAreaDetectServiceImpl.instance;
    }

    setLeftMouseDown(state: boolean): void {
        this.leftMouseDown = state;
    }

    isLeftMouseDown(): boolean {
        return this.leftMouseDown;
    }

    setMyCardScrollAreaDetectState(state: boolean): void {
        this.myCardScrollAreaDetectState = state;
    }

    getMyCardScrollAreaDetectState(): boolean {
        return this.myCardScrollAreaDetectState;
    }

    setMyDeckScrollAreaDetectState(state: boolean): void {
        this.myDeckScrollAreaDetectState = state;
    }

    getMyDeckScrollAreaDetectState(): boolean {
        return this.myDeckScrollAreaDetectState;
    }

    async detectMakeDeckSideScrollArea(detectPoint: { x: number; y: number }): Promise<SideScrollArea | null> {
        const { x, y } = detectPoint;
        const sideScrollArea = this.getSideScrollAreasByType(1);
        if (sideScrollArea == null) {
            console.error("Side Scroll Area is null.");
            return null;
        }
        const detectSideScrollArea = this.sideScrollAreaDetectRepository.isSideScrollAreaDetect(
            { x, y },
            sideScrollArea,
            this.camera
        );

        if (detectSideScrollArea) {
            console.log(`[DEBUG] Detected Side Scroll Area ID: ${detectSideScrollArea.id}`);

            if (detectSideScrollArea.id == 0) {
                this.setMakeDeckScrollEnabled(detectSideScrollArea.id, true);

                return detectSideScrollArea;

            } else {
                this.setMakeDeckScrollEnabled(detectSideScrollArea.id, false);
            }

        }

        return null;
    }

    async detectMyCardSideScrollArea(detectPoint: { x: number; y: number }): Promise<SideScrollArea | null> {
        const { x, y } = detectPoint;
        const sideScrollArea = this.getSideScrollAreasByType(2);
        if (sideScrollArea == null) {
            console.error("[ERROR]Side Scroll Area is null.");
            return null;
        }

        const detectSideScrollArea = this.sideScrollAreaDetectRepository.isSideScrollAreaDetect(
            { x, y },
            sideScrollArea,
            this.camera
        );

        if (detectSideScrollArea) {
            console.log(`[DEBUG] Detected Side Scroll Area`);
            this.setMyCardScrollEnabled(true);
            this.setMyCardScrollBarVisibility(true);

        } else {
            console.log(`No Detected Side Scroll Area`);
            this.setMyCardScrollEnabled(false);
            this.setMyCardScrollBarVisibility(false);
        }

        return null;
    }

    async detectMyDeckSideScrollArea(detectPoint: { x: number; y: number }): Promise<SideScrollArea | null> {
        const { x, y } = detectPoint;
        const sideScrollArea = this.getSideScrollAreasByType(3);
        if (sideScrollArea == null) {
            console.error("My Deck Side Scroll Area is null.");
            return null;
        }
        const detectSideScrollArea = this.sideScrollAreaDetectRepository.isSideScrollAreaDetect(
            { x, y },
            sideScrollArea,
            this.camera
        );

        if (detectSideScrollArea) {
            console.log(`%c[DEBUG] Detected My Deck Scroll Area ID: ${detectSideScrollArea.id}`, 'color: #2E9AFE; font-weight: bold;');
            if (detectSideScrollArea.id == 0) {
                this.setMyDeckScrollEnabled(0, true);
                this.setMyDeckScrollEnabled(1, false);
                this.setMyDeckScrollEnabled(2, false);
            }

            if (detectSideScrollArea.id == 1) {
                this.setMyDeckScrollEnabled(0, false);
                this.setMyDeckScrollEnabled(1, true);
                this.setMyDeckScrollEnabled(2, false);
            }

            if (detectSideScrollArea.id == 2) {
                this.setMyDeckScrollEnabled(0, false);
                this.setMyDeckScrollEnabled(1, false);
                this.setMyDeckScrollEnabled(2, true);
            }

        }
        return null;
    }

    // To-do: 메서드명 변경 필요
    public async onMouseMove(event: MouseEvent): Promise<void> {
        if (event.button === 0) {
            const detectPoint = { x: event.clientX, y: event.clientY };
            await this.detectMakeDeckSideScrollArea(detectPoint);
        }
    }

    // To-do: 메서드명 변경 필요
    public async onMouseMoveMyCard(event: MouseEvent): Promise<void> {
        if (event.button === 0) {
            const detectPoint = { x: event.clientX, y: event.clientY };
            await this.detectMyCardSideScrollArea(detectPoint);
        }
    }

    public async onMouseMoveMyDeck(event: MouseEvent): Promise<void> {
        if (event.button === 0) {
            const detectPoint = { x: event.clientX, y: event.clientY };
            await this.detectMyDeckSideScrollArea(detectPoint);
        }
    }

    public setMakeDeckScrollEnabled(areaId: number, enable: boolean): void {
        this.sideScrollAreaDetectRepository.setMakeDeckScrollEnabled(areaId, enable);
    }

    public getMakeDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMakeDeckScrollEnabledById(areaId);
    }

    private getSideScrollAreasByType(type: SideScrollAreaType): SideScrollArea[] | null {
        return this.sideScrollAreaRepository.findAreasByType(type);
    }

    public setMyCardScrollEnabled(enable: boolean): void {
        this.sideScrollAreaDetectRepository.setMyCardScrollEnabled(enable);
    }

    public getMyCardScrollEnabled(): boolean {
        return this.sideScrollAreaDetectRepository.findMyCardScrollEnabled();
    }

    public setMyDeckScrollEnabled(areaId: number, enable: boolean): void {
        this.sideScrollAreaDetectRepository.setMyDeckScrollEnabled(areaId, enable);
    }

    public getMyDeckScrollEnabledById(areaId: number): boolean {
        return this.sideScrollAreaDetectRepository.findMyDeckScrollEnabledById(areaId);
    }

    private setMyCardScrollBarVisibility(isVisible: boolean): void {
        const scrollBarIds = this.myCardScrollBarRepository.findAllScrollBarIds();
        if (isVisible == true) {
            scrollBarIds.forEach((id) => this.myCardScrollBarRepository.showScrollBar(id));
        } else {
            scrollBarIds.forEach((id) => this.myCardScrollBarRepository.hideScrollBar(id));
        }
    }

}
