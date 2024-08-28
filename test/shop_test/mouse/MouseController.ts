import * as THREE from 'three';

export class MouseController {
    private static instance: MouseController;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private buttonClickHandlers: { [uuid: string]: () => void } = {};

    constructor(camera: THREE.Camera, scene: THREE.Scene) {  // 생성자 변경
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        this.scene = scene;
        window.addEventListener('click', this.onMouseClick.bind(this));
    }

    // private constructor(camera: THREE.Camera, scene: THREE.Scene) {
    //     this.raycaster = new THREE.Raycaster();
    //     this.mouse = new THREE.Vector2();
    //     this.camera = camera;
    //     this.scene = scene;
    //     window.addEventListener('click', this.onMouseClick.bind(this));
    // }
    //
    // public static getInstance(camera: THREE.Camera, scene: THREE.Scene): MouseController {
    //     if (!MouseController.instance) {
    //         MouseController.instance = new MouseController(camera, scene);
    //     }
    //     return MouseController.instance;
    // }

    private onMouseClick(event: MouseEvent): void {
        // 마우스 좌표를 정규화된 장치 좌표로 변환
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        console.log(`Mouse clicked at: (${event.clientX}, ${event.clientY})`);
        console.log('this.scene.children:', this.scene.children);

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const buttons = this.scene.children.filter(obj => this.buttonClickHandlers[obj.uuid] !== undefined);
        const intersects = this.raycaster.intersectObjects(buttons, true);

        console.log('every button handler list:', this.buttonClickHandlers);

        if (intersects.length > 0) {
            const intersectedButton = intersects[0].object as THREE.Mesh;
            console.log('Intersected button:', intersectedButton);
            const handler = this.buttonClickHandlers[intersectedButton.uuid];
            console.log('Handler:', handler);
            if (handler) {
                console.log('Handler found for button with UUID:', intersectedButton.uuid);
                handler();
            } else {
                console.warn(`No handler found for button with UUID: ${intersectedButton.uuid}`);
            }
        } else {
            console.log('No buttons intersected by the raycaster.');
        }
    }

    public registerButton(button: THREE.Mesh, handler: () => void): void {
        this.buttonClickHandlers[button.uuid] = handler;
        console.log(`Registered button: ${button.uuid}`);
    }

    public clearButtons(): void {
        this.buttonClickHandlers = {};  // 버튼 핸들러 초기화
        console.log('All button handlers cleared.');
    }
}
