import * as THREE from "three";

// 열려 있는 액티브 패널을 담아 둔다.
//
// 만드는 일은 렌더러가 한다. 여기는 만들어진 것을 들고, 무엇이 열려 있는지 알려 준다.
// 그래서 화면과 카메라를 안 든다.
export interface ActivePanelAreaCache {
    // 만들어진 패널을 받아 화면에 붙인다.
    open(scene: THREE.Scene, camera: THREE.Camera, x: number, y: number, cardId: number): Promise<void>;
    close(scene: THREE.Scene): void;
    exists(): boolean;
    getActiveButtons(): THREE.Mesh[];
}
