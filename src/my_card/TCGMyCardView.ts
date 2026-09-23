import * as THREE from 'three';
import { TextureManager } from "../texture_manager/TextureManager";
import { NonBackgroundImage } from "../shape/image/NonBackgroundImage";
import { AudioController } from "../audio/AudioController";
import myCardMusic from '@resource/music/my_card/my-card.mp3';
import { MouseController } from "../mouse/MouseController";
import { Navigator } from "../router/Navigator";
import { Component } from "../router/Component";
import {TransparentRectangle} from "../shape/TransparentRectangle";

export class TCGMyCardView implements Component {
    private static instance: TCGMyCardView | null = null;

    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private myCardContainer: HTMLElement;
    private background: NonBackgroundImage | null = null;
    private buttons: NonBackgroundImage[] = [];
    private buttonInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();
    private audioController: AudioController;
    private mouseController: MouseController;
    private routeMap: Navigator;

    private initialized = false;
    private isAnimating = false;

    private transparentRectangles: TransparentRectangle[] = []
    private rectInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();

    constructor(myCardContainer: HTMLElement, routeMap: Navigator) {
        this.myCardContainer = myCardContainer;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.myCardContainer.appendChild(this.renderer.domElement);

        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -aspect * viewSize / 2, aspect * viewSize / 2,
            viewSize / 2, -viewSize / 2,
            0.1, 1000
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        this.textureManager = TextureManager.getInstance();
        this.audioController = AudioController.getInstance();

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.mouseController = new MouseController(this.camera, this.scene);
        this.routeMap = routeMap;

    }

    public static getInstance(lobbyContainer: HTMLElement, routeMap: Navigator): TCGMyCardView {
        if (!TCGMyCardView.instance) {
            TCGMyCardView.instance = new TCGMyCardView(lobbyContainer, routeMap);
        }
        return TCGMyCardView.instance;
    }


    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('TCGBattleFieldView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Adding background and buttons...");

        this.addBackground();

        this.initialized = true;
        this.isAnimating = true;

        const lobbyButtonX = 0.15854;
        const lobbyButtonY = 0.04728;
        const lobbyButtonWidth = 0.09415;
        const lobbyButtonHeight = 0.06458;

        this.addTransparentRectangle('lobbyButton', lobbyButtonX, lobbyButtonY, lobbyButtonWidth, lobbyButtonHeight);

        this.animate();
    }

    private onTransparentRectangleClick(id: string): void {
        console.log(`TransparentRectangle clicked: ${id}`);
        switch (id) {
            case 'lobbyButton':
                this.routeMap.navigate("/tcg-main-lobby");
                break;
            default:
                console.error("Unknown TransparentRectangle ID:", id);
        }
    }

    public show(): void {
        // 이 화면의 음악을 여기서 건다. 만들 때 걸면 돌아올 때 다시 안 걸린다 (R2-134).
        this.audioController.playForScreen(myCardMusic);

        this.renderer.domElement.style.display = 'block';
        this.myCardContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize()
        } else {
            this.animate()
            this.registerEventHandlers()
        }
    }

    private registerEventHandlers(): void {
        this.transparentRectangles.forEach(rect => {
            this.mouseController.registerButton(rect.getMesh(), this.onTransparentRectangleClick.bind(this, rect.getId()));
        });
    }

    public hide(): void {
        console.log('Hiding TCGMainLobbyView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.myCardContainer.style.display = 'none';

        this.mouseController.clearButtons();
    }

    private async addBackground(): Promise<void> {
        const texture = await this.textureManager.getTexture('my_card_background', 1);
        console.log('addBackground():', texture);
        if (texture) {
            if (!this.background) {
                this.background = new NonBackgroundImage(
                    window.innerWidth,
                    window.innerHeight,
                    new THREE.Vector2(0, 0)
                );
            }
            this.background.createNonBackgroundImageWithTexture(texture, 1, 1);
            this.background.draw(this.scene);
        } else {
            console.error("Background texture not found.");
        }
    }

    private addTransparentRectangle(id: string, positionXPercent: number, positionYPercent: number, widthPercent: number, heightPercent: number): void {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const positionX = (positionXPercent - 0.5) * screenWidth
        const positionY = (0.5 - positionYPercent) * screenHeight

        const position = new THREE.Vector2(
            positionX, positionY
        );

        const width = 0.09415 * screenWidth
        const height = 0.06458 * screenHeight

        const transparentRectangle = new TransparentRectangle(position, width, height, 0xffffff, 0.0, id);
        transparentRectangle.addToScene(this.scene);

        this.mouseController.registerButton(transparentRectangle.getMesh(), this.onTransparentRectangleClick.bind(this, id));

        this.transparentRectangles.push(transparentRectangle);
        this.rectInitialInfo.set(id, { positionPercent: new THREE.Vector2(positionXPercent - 0.5, 0.5 - positionYPercent), widthPercent, heightPercent });
    }

    private onWindowResize(): void {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const aspect = newWidth / newHeight;
        const viewSize = newHeight;

        this.camera.left = -aspect * viewSize / 2;
        this.camera.right = aspect * viewSize / 2;
        this.camera.top = viewSize / 2;
        this.camera.bottom = -viewSize / 2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(newWidth, newHeight);

        if (this.background) {
            const scaleX = newWidth / this.background.getWidth();
            const scaleY = newHeight / this.background.getHeight();
            this.background.setScale(scaleX, scaleY);
        }

        this.buttons.forEach(button => {
            const initialInfo = this.buttonInitialInfo.get(button.getMesh()?.uuid ?? '');
            if (initialInfo) {
                const newWidth = window.innerWidth * initialInfo.widthPercent;
                const newHeight = window.innerHeight * initialInfo.heightPercent;
                const newPosition = new THREE.Vector2(
                    window.innerWidth * initialInfo.positionPercent.x,
                    window.innerHeight * initialInfo.positionPercent.y
                );

                button.setPosition(newPosition.x, newPosition.y);
                button.setScale(newWidth / button.getWidth(), newHeight / button.getHeight());
            }
        });

        this.rectInitialInfo.forEach((info, id) => {
            const rectangle = this.transparentRectangles.find(rect => rect.getId() === id);
            if (rectangle) {
                const newPosition = new THREE.Vector2(
                    info.positionPercent.x * newWidth,
                    info.positionPercent.y * newHeight
                );
                rectangle.setPosition(newPosition);
                rectangle.setScale(
                    info.widthPercent * newWidth / rectangle.getWidth(),
                    info.heightPercent * newHeight / rectangle.getHeight()
                );
            }
        });
    }

    animate(): void {
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
            this.renderer.render(this.scene, this.camera);
        } else {
            console.log('Animation stopped.');
        }
    }
}

