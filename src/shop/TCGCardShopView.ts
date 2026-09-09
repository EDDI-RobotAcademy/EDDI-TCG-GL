import * as THREE from 'three';
import {GuideMessageHudRendererV2} from "../common/guide_message/renderer/GuideMessageHudRendererV2";
import {createDefaultGuideMessageHudFrame} from "../common/guide_message/frame/GuideMessageHudFrame";
import { TextureManager } from "../texture_manager/TextureManager";
import { NonBackgroundImage } from "../shape/image/NonBackgroundImage";
import { AudioController } from "../audio/AudioController";
import cardShopMusic from '@resource/music/shop/card-shop.mp3';
import { MouseController } from "../mouse/MouseController";
import { RouteMap } from "../router/RouteMap";
import { Component } from "../router/Component";
import { ShopButtonType } from "./ShopButtonType";
import {ShopButtonConfigList} from "./ShopButtonConfigList";
import { TransparentRectangle } from "../shape/TransparentRectangle";

export class TCGCardShopView implements Component {
    private static instance: TCGCardShopView | null = null;

    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private shopContainer: HTMLElement;
    private background: NonBackgroundImage | null = null;
    private buttons: NonBackgroundImage[] = [];
    private buttonInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();
    private audioController: AudioController;
    private mouseController: MouseController;
    private routeMap: RouteMap;

    private initialized = false;
    private isAnimating = false;

    private transparentRectangles: TransparentRectangle[] = []
    private rectInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();


    constructor(shopContainer: HTMLElement, routeMap: RouteMap) {
        this.shopContainer = shopContainer;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.shopContainer.appendChild(this.renderer.domElement);

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
        this.audioController.setMusic(cardShopMusic);

        window.addEventListener('resize', this.onWindowResize.bind(this));

        // this.mouseController = MouseController.getInstance(this.camera, this.scene);
        this.mouseController = new MouseController(this.camera, this.scene);
        this.routeMap = routeMap;

        window.addEventListener('click', () => this.initializeAudio(), { once: true });
    }

    public static getInstance(shopContainer: HTMLElement, routeMap: RouteMap): TCGCardShopView {
        if (!TCGCardShopView.instance) {
            TCGCardShopView.instance = new TCGCardShopView(shopContainer, routeMap);
        }
        return TCGCardShopView.instance;
    }

    private async initializeAudio(): Promise<void> {
        try {
            await this.audioController.playMusic();
        } catch (error) {
            console.error('Initial audio play failed:', error);
        }
    }

    public async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('Already initialized');
            this.show();
            return;
        }

        console.log('TCGCardShopView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Adding background and buttons...");

        this.addBackground();
        this.addButtons();
        this.initialized = true;
        this.isAnimating = true;

        const lobbyButtonX = 0.04761;
        const lobbyButtonY = 0.07534;
        const lobbyButtonWidth = 0.09415;
        const lobbyButtonHeight = 0.06458;

        const myCardButtonX = -695;
        const myCardButtonY = 242;
        const myCardButtonWidth = 145;
        const myCardButtonHeight = 50;

        // 버튼 추가 시 상대적인 위치로 변환하여 사용
        this.addTransparentRectangle('lobbyButton', lobbyButtonX, lobbyButtonY, lobbyButtonWidth, lobbyButtonHeight);
        this.addTransparentRectangle('myCardButton', myCardButtonX, myCardButtonY, myCardButtonWidth, myCardButtonHeight);

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGCardShopView...');
        this.renderer.domElement.style.display = 'block';
        this.shopContainer.style.display = 'block';
        this.isAnimating = true;

        this.mouseController.clearButtons();

        this.scene.children.forEach(child => {
            child.visible = true;
        });

        if (!this.initialized) {
            this.initialize();
        } else {
            this.addButtons(); // 버튼을 다시 생성하는 메서드 호출

            // 투명 사각형을 다시 생성하고 씬에 추가
            this.addTransparentRectangles();

            this.animate();
            this.registerEventHandlers()
        }
    }

    private addTransparentRectangles(): void {
        // 로비 버튼
        const lobbyButtonX = 0.04761;
        const lobbyButtonY = 0.07534;
        const lobbyButtonWidth = 0.09415;
        const lobbyButtonHeight = 0.06458;
        this.addTransparentRectangle('lobbyButton', lobbyButtonX, lobbyButtonY, lobbyButtonWidth, lobbyButtonHeight);

        // 카드 버튼
        const myCardButtonX = -695;
        const myCardButtonY = 242;
        const myCardButtonWidth = 145;
        const myCardButtonHeight = 50;
        this.addTransparentRectangle('myCardButton', myCardButtonX, myCardButtonY, myCardButtonWidth, myCardButtonHeight);
    }

    private registerEventHandlers(): void {
        // ShopButtonConfigList에서 가져온 버튼들에 대한 이벤트 핸들러 등록
        this.buttons.forEach((button, index) => {
            const config = ShopButtonConfigList.buttonConfigs[index];
            this.mouseController.registerButton(button.getMesh(), this.onButtonClick.bind(this, config.type));
        });

        // addTransparentRectangle에서 추가된 사각형들에 대한 이벤트 핸들러 등록
        this.transparentRectangles.forEach((rectangle) => {
            this.mouseController.registerButton(rectangle.getMesh(), this.onTransparentRectangleClick.bind(this, rectangle.getId()));
        });
    }

    public hide(): void {
        console.log('Hiding TCGCardShopView...');
        this.isAnimating = false;

        // 상점을 떠날 때 안내 문구도 함께 치운다.
        if (this.guideElement) {
            this.guideRenderer.dispose(this.guideElement);
            this.guideElement.remove();
            this.guideElement = null;
        }

        this.renderer.domElement.style.display = 'none';
        this.shopContainer.style.display = 'none';

        this.buttons.forEach(button => {
            this.mouseController.unregisterButton(button.getMesh());
            this.disposeMesh(button.getMesh());
            this.scene.remove(button.getMesh());
        });

        this.transparentRectangles.forEach(rectangle => {
            this.mouseController.unregisterButton(rectangle.getMesh());
            this.disposeMesh(rectangle.getMesh());
            this.scene.remove(rectangle.getMesh());
        });

        this.mouseController.clearButtons();

        this.buttons = [];
        this.transparentRectangles = [];

        // this.scene.children.forEach(child => {
        //     child.visible = false;
        // });

        console.log('Scene children after hide:', this.scene.children);
    }

    private disposeMesh(mesh: THREE.Mesh): void {
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(material => material.dispose());
            } else {
                mesh.material.dispose();
            }
        }
    }

    private async addBackground(): Promise<void> {
        const texture = await this.textureManager.getTexture('shop_background', 1);
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

    private async addButtons(): Promise<void> {
        await Promise.all(ShopButtonConfigList.buttonConfigs.map(async (config) => {
            const buttonTexture = await this.textureManager.getTexture('shop_buttons', config.id);

            if (buttonTexture) {
                const widthPercent = 300 / 1920;  // 기준 화면 크기의 퍼센트로 버튼 크기를 정의
                const heightPercent = 300 / 1080;
                const positionPercent = new THREE.Vector2(config.position.x / 1920, config.position.y / 1080);

                const button = new NonBackgroundImage(
                    window.innerWidth * widthPercent,
                    window.innerHeight * heightPercent,
                    new THREE.Vector2(
                        window.innerWidth * positionPercent.x,
                        window.innerHeight * positionPercent.y
                    )
                );
                button.createNonBackgroundImageWithTexture(buttonTexture, 1, 1);
                button.draw(this.scene);

                console.log(`Button ID: ${config.id}`);
                console.log('Button Texture:', buttonTexture);
                console.log('Button Position (Percent):', positionPercent);
                console.log('Button Position (Pixels):', button.getLocalTranslation());
                console.log('Button Size (Width, Height):', button.getWidth(), button.getHeight());

                this.buttons.push(button);
                this.buttonInitialInfo.set(button.getMesh()?.uuid ?? '', { positionPercent, widthPercent, heightPercent });

                this.mouseController.registerButton(button.getMesh(), this.onButtonClick.bind(this, config.type));
            } else {
                console.error("Button texture not found.");
            }
        }));
    }

    private __calculatePercentPosition(position: number, screenSize: number): number {
        return position / screenSize;
    }

    private addTransparentRectangle(id: string, positionXPercent: number, positionYPercent: number, widthPercent: number, heightPercent: number): void {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        console.log('width:', screenWidth, ', height:', screenHeight)
        console.log('positionXPercent:', positionXPercent, ', positionYPercent:', positionYPercent)
        console.log('positionXPercent:', positionXPercent, ', positionY:', (0.5 - positionYPercent) * screenHeight)

        const positionX = (positionXPercent - 0.5) * screenWidth
        const positionY = (0.5 - positionYPercent) * screenHeight

        // 비율 기반 절대 위치 및 크기 계산
        const position = new THREE.Vector2(
            positionX, positionY
        );

        const width = 0.09415 * screenWidth
        const height = 0.06458 * screenHeight

        const transparentRectangle = new TransparentRectangle(position, width, height, 0xffffff, 0.0, id);
        transparentRectangle.addToScene(this.scene);

        this.mouseController.registerButton(transparentRectangle.getMesh(), this.onTransparentRectangleClick.bind(this, id));

        // 위치 및 크기 정보를 저장하여 리사이즈 시 재계산할 수 있도록 합니다.
        this.transparentRectangles.push(transparentRectangle);
        this.rectInitialInfo.set(id, { positionPercent: new THREE.Vector2(positionXPercent - 0.5, 0.5 - positionYPercent), widthPercent, heightPercent });
    }

    // 아직 못 가는 곳을 눌렀을 때 알려 준다.
    private readonly guideRenderer = new GuideMessageHudRendererV2();
    private readonly guideFrame = createDefaultGuideMessageHudFrame();
    private guideElement: HTMLElement | null = null;

    private onButtonClick(type: ShopButtonType): void {
        console.log('Button clicked:', type);
        // 카드 뽑기 화면이 아직 없다. 없는 길로 보내면 로비로 되돌아와서
        // 상점에서 튕겨 나간 것처럼 보인다. 그래서 알려 준다.
        switch (type) {
            case ShopButtonType.ALL:
            case ShopButtonType.UNDEAD:
            case ShopButtonType.TRENT:
            case ShopButtonType.HUMAN:
                void this.showGuide('카드 뽑기는 준비 중입니다.');
                break;
            default:
                console.error("Unknown button type:", type);
        }
    }

    // 안내 문구를 띄운다. 처음 부를 때 만든다.
    private async showGuide(message: string): Promise<void> {
        if (!this.guideElement) {
            this.guideElement = await this.guideRenderer.build(this.guideFrame);
            document.body.appendChild(this.guideElement);
        }
        this.guideRenderer.show(this.guideElement, message, 3000);
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

    private onTransparentRectangleClick(id: string): void {
        console.log(`TransparentRectangle clicked: ${id}`);
        switch (id) {
            case 'lobbyButton':
                this.routeMap.navigate("/tcg-main-lobby");
                break;
            case 'myCardButton':
                console.log("My Card button clicked");
                break;
            default:
                console.error("Unknown TransparentRectangle ID:", id);
        }
    }

    public animate(): void {
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
            this.renderer.render(this.scene, this.camera);
        } else {
            console.log('TCGCardShop: Animation stopped.');
        }
    }
}

