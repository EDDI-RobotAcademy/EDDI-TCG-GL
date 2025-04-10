import * as THREE from "three";

export interface MyDeckScrollService {
    setScrollState(state: boolean): void;
    getScrollState(): boolean;
    onWheelScroll(event: WheelEvent): Promise<void>;
    getDeckCount(): number
}
