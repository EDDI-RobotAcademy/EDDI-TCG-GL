import {RouteMap} from "../../src/router/RouteMap";
import {routes} from "../../src/router/routes";
import {TCGMainLobbyView} from "../../src/lobby/TCGMainLobbyView";

import * as THREE from 'three';
import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';
import {Component} from "../../src/router/Component";
import {TextureManager} from "../../src/texture_manager/TextureManager";
import {NonBackgroundImage} from "../../src/shape/image/NonBackgroundImage";
import {AudioController} from "../../src/audio/AudioController";
import {MouseController} from "../../src/mouse/MouseController";
import {BattleFieldUnitRepository} from "../../src/battle_field_unit/repository/BattleFieldUnitRepository";
import {Vector2d} from "../../src/common/math/Vector2d";
import {BattleFieldUnit} from "../../src/battle_field_unit/entity/BattleFieldUnit";
import {BattleFieldUnitScene} from "../../src/battle_field_unit/scene/BattleFieldUnitScene";
import {ResourceManager} from "../../src/resouce_manager/ResourceManager";
import {BattleFieldUnitRenderer} from "../../src/battle_field_unit/renderer/BattleFieldUnitRenderer";

export class TCGJustTestBattleFieldView {
    private static instance: TCGJustTestBattleFieldView | null = null;

    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private renderer: THREE.WebGLRenderer;
    private textureManager: TextureManager;
    private simulationBattleFieldContainer: HTMLElement;
    private background: NonBackgroundImage | null = null;
    private buttons: NonBackgroundImage[] = [];
    private buttonInitialInfo: Map<string, { positionPercent: THREE.Vector2, widthPercent: number, heightPercent: number }> = new Map();
    private audioController: AudioController;
    private mouseController: MouseController;

    private battleFieldUnitRepository = BattleFieldUnitRepository.getInstance();
    private battleFieldUnitScene = new BattleFieldUnitScene();
    private battleFieldResourceManager = new ResourceManager()
    private battleFieldUnitRenderer?: BattleFieldUnitRenderer;

    private initialized = false;
    private isAnimating = false;

    constructor(simulationBattleFieldContainer: HTMLElement) {
        this.simulationBattleFieldContainer = simulationBattleFieldContainer;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.simulationBattleFieldContainer.appendChild(this.renderer.domElement);

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
        this.audioController.setMusic(battleFieldMusic);

        this.mouseController = new MouseController(this.camera, this.scene);

        window.addEventListener('click', () => this.initializeAudio(), { once: true });
    }

    public static getInstance(lobbyContainer: HTMLElement): TCGJustTestBattleFieldView {
        if (!TCGJustTestBattleFieldView.instance) {
            TCGJustTestBattleFieldView.instance = new TCGJustTestBattleFieldView(lobbyContainer);
        }
        return TCGJustTestBattleFieldView.instance;
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

        console.log('TCGBattleFieldView initialize() operate!!!');
        await this.textureManager.preloadTextures("image-paths.json");

        console.log("Textures preloaded. Adding background and buttons...");

        this.addBackground();
        this.addYourHandUnitList()

        this.initialized = true;
        this.isAnimating = true;

        this.animate();
    }

    public show(): void {
        console.log('Showing TCGMainLobbyView...');
        this.renderer.domElement.style.display = 'block';
        this.simulationBattleFieldContainer.style.display = 'block';
        this.isAnimating = true;
        if (!this.initialized) {
            this.initialize(); // 초기화되지 않은 경우 초기화 호출
        } else {
            this.animate(); // 이미 초기화된 경우 애니메이션만 다시 시작
        }
    }

    public hide(): void {
        console.log('Hiding TCGMainLobbyView...');
        this.isAnimating = false;
        this.renderer.domElement.style.display = 'none';
        this.simulationBattleFieldContainer.style.display = 'none';
    }

    private async addBackground(): Promise<void> {
        const texture = await this.textureManager.getTexture('battle_field_background', 1);
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

    private async addYourHandUnitList(): Promise<void> {
        const cardId = 19;
        const weaponId = 40;
        const hpId = 60;
        const energyId = 3;
        const raceId = 2;
        const position = new Vector2d(0, 0);

        console.log("Creating BattleFieldUnit with the following parameters:", { cardId, weaponId, hpId, energyId, raceId, position });

        this.battleFieldResourceManager = new ResourceManager();
        this.battleFieldResourceManager.registerBattleFieldUnitPath({
            cardPath: 'resource/battle_field_unit/card/{id}.png',
            weaponPath: 'resource/battle_field_unit/sword_power/{id}.png',
            hpPath: 'resource/battle_field_unit/hp/{id}.png',
            energyPath: 'resource/battle_field_unit/energy/{id}.png',
            racePath: 'resource/card_race/{id}.png'
        });
        console.log("ResourceManager paths registered.");

        this.battleFieldUnitRenderer = new BattleFieldUnitRenderer(this.battleFieldUnitScene, this.battleFieldResourceManager);
        console.log("BattleFieldUnitRenderer initialized:", this.battleFieldUnitRenderer);

        const battleFieldUnit = new BattleFieldUnit(cardId, weaponId, hpId, energyId, raceId, position);
        this.battleFieldUnitRepository.addBattleFieldUnit(battleFieldUnit);
        console.log("BattleFieldUnit created and added to the repository:", battleFieldUnit);

        this.scene.add(this.battleFieldUnitScene.getScene());
        console.log("BattleFieldUnitScene added to the main scene:", this.battleFieldUnitScene.getScene());
    }

    animate(): void {
        if (this.isAnimating) {
            requestAnimationFrame(() => this.animate());
            this.battleFieldUnitRenderer?.render(this.renderer, this.camera);
            this.renderer.render(this.scene, this.camera);
        } else {
            console.log('Animation stopped.');
        }
    }
}

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

const fieldView = TCGJustTestBattleFieldView.getInstance(rootElement);
fieldView.initialize();