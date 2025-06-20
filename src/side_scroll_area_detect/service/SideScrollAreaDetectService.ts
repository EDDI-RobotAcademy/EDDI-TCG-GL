export interface SideScrollAreaDetectService {
    setLeftMouseDown(state: boolean): void;
    isLeftMouseDown(): boolean;
    setMyCardScrollAreaDetectState(state: boolean): void;
    getMyCardScrollAreaDetectState(): boolean;
    getMyDeckScrollEnabledById(areaId: number): boolean;

    detectMakeDeckSideScrollArea(detectPoint: { x: number; y: number }): Promise<any | null>;
    detectMyCardSideScrollArea(detectPoint: { x: number; y: number }): Promise<any | null>;
    detectMyDeckSideScrollArea(detectPoint: { x: number; y: number }): Promise<any | null>;

    onMouseMove(event: MouseEvent): Promise<void>;
    onMouseMoveMyCard(event: MouseEvent): Promise<void>;
    onMouseMoveMyDeck(event: MouseEvent): Promise<void>;

    getMakeDeckScrollEnabledById(areaId: number): boolean;
    getMyCardScrollEnabled(): boolean;
}
