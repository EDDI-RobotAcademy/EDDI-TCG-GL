import * as THREE from "three";
import {ActivePanelAreaRepository} from "./ActivePanelAreaRepository";
import {TextureManager} from "../../texture_manager/TextureManager";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {getCardById} from "../../card/utility";

export class ActivePanelAreaRepositoryImpl implements ActivePanelAreaRepository {
    private static instance: ActivePanelAreaRepositoryImpl | null = null;
    private activePanel: THREE.Mesh | null = null;
    private scene: THREE.Scene;
    private camera: THREE.Camera;

    private textureManager = TextureManager.getInstance();

    private activeButtons: THREE.Mesh[] = []; // 추가: 버튼들 추적용 배열

    private readonly ACTIVE_PANEL_WIDTH_RATIO = 0.06493506493;
    private readonly ACTIVE_PANEL_HEIGHT_RATIO = this.ACTIVE_PANEL_WIDTH_RATIO / 1.617;

    private readonly ACTIVE_PANEL_BUTTON_WIDTH_RATIO = 0.05411255411;
    private readonly ACTIVE_PANEL_BUTTON_HEIGHT_RATIO = this.ACTIVE_PANEL_BUTTON_WIDTH_RATIO / 1.617;

    private readonly FIRST_SKILL = 1;
    private readonly SECOND_SKILL = 2;

    private constructor(camera: THREE.Camera, scene: THREE.Scene) {
        this.camera = camera;
        this.scene = scene;
    }

    static getInstance(camera: THREE.Camera, scene: THREE.Scene): ActivePanelAreaRepositoryImpl {
        if (!ActivePanelAreaRepositoryImpl.instance) {
            ActivePanelAreaRepositoryImpl.instance = new ActivePanelAreaRepositoryImpl(camera, scene);
        }
        return ActivePanelAreaRepositoryImpl.instance;
    }

    private async createButton(
        type: 'general' | 'details' | 'firstSkill' | 'secondSkill',
        cardId: number,
        width: number,
        height: number,
        pos: Vector2d,
        panelHeight: number,
        margin: number,
        skillCount: number
    ): Promise<THREE.Mesh | null> {
        let texture: THREE.Texture | null | undefined = null;

        if (type === 'general') {
            texture = await this.textureManager.getTexture("active_panel_general", 1);
        } else if (type === 'details') {
            texture = await this.textureManager.getTexture("active_panel_details", 1);
        } else if (type === 'firstSkill' && skillCount > 0) {
            texture = await this.textureManager.getSkillButtonTexture(cardId, 1);
        } else if (type === 'secondSkill' && skillCount > 1) {
            texture = await this.textureManager.getSkillButtonTexture(cardId, 2);
        }

        if (!texture) {
            console.warn(`${type} 버튼 텍스처 없음`);
            return null;
        }

        const mesh = MeshGenerator.createMesh(texture, width, height, pos);
        mesh.renderOrder = 4;

        const generalY = panelHeight * 0.5 - height * 0.5 - margin * 0.5;
        const detailsY = panelHeight * 0.5 - height * (1.5 + skillCount) - margin * (skillCount + 1.75);

        const step = skillCount > 0
            ? (generalY - detailsY) / (skillCount + 1)
            : 0;

        const yOffset = (() => {
            switch (type) {
                case 'general':
                    return generalY;

                case 'details':
                    return detailsY;

                case 'firstSkill':
                    if (skillCount >= 1) return generalY - step * this.FIRST_SKILL;
                    return 0;

                case 'secondSkill':
                    if (skillCount >= 2) return generalY - step * this.SECOND_SKILL;
                    return 0;
            }
        })();

        mesh.position.set(pos.getX(), pos.getY() + yOffset, mesh.position.z);
        mesh.userData.type = type;
        return mesh;
    }

    async create(x: number, y: number, cardId: number): Promise<void> {
        if (this.activePanel) {
            console.warn("이미 Active Panel이 존재합니다.");
            return;
        }

        const card = getCardById(cardId);
        if (!card) throw new Error(`Card ${cardId} 찾을 수 없음`);

        const skillCount = Number(card["스킬 개수" as keyof typeof card]) || 0;

        const width = this.ACTIVE_PANEL_WIDTH_RATIO * window.innerWidth;
        const height = this.ACTIVE_PANEL_HEIGHT_RATIO * window.innerWidth * (skillCount + 2);
        const heightMargin = (this.ACTIVE_PANEL_HEIGHT_RATIO - this.ACTIVE_PANEL_BUTTON_HEIGHT_RATIO) * window.innerWidth;

        const geometry = new THREE.PlaneGeometry(width, height + heightMargin);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            depthTest: false
        });

        this.activePanel = new THREE.Mesh(geometry, material);
        this.activePanel.renderOrder = 2;

        const mouse = new THREE.Vector3(
            ((x + width * 0.5) / window.innerWidth) * 2 - 1,
            -((y + height * 0.5) / window.innerHeight) * 2 + 1,
            0
        );
        mouse.unproject(this.camera);
        this.activePanel.position.copy(mouse);
        this.scene.add(this.activePanel);

        const buttonWidth = this.ACTIVE_PANEL_BUTTON_WIDTH_RATIO * window.innerWidth;
        const buttonHeight = this.ACTIVE_PANEL_BUTTON_HEIGHT_RATIO * window.innerWidth;
        const buttonPos = new Vector2d(mouse.x, mouse.y);

        const buttons: Array<'general' | 'details' | 'firstSkill' | 'secondSkill'> = [
            'general',
            'details',
            'firstSkill',
            'secondSkill'
        ];

        for (const type of buttons) {
            const button = await this.createButton(type, cardId, buttonWidth, buttonHeight, buttonPos, height, heightMargin, skillCount);
            if (button) {
                this.scene.add(button);
                this.activeButtons.push(button);
                console.log(`${type} 버튼 추가 완료`, button.position);
            }
        }
    }

    delete(): void {
        if (this.activePanel) {
            this.scene.remove(this.activePanel);
            this.activePanel.geometry.dispose();
            if (this.activePanel.material instanceof THREE.Material) {
                this.activePanel.material.dispose();
            }
            this.activePanel = null;
        } else {
            console.warn("삭제할 Active Panel 없음");
        }

        // 추가: 버튼들 제거
        this.activeButtons.forEach((button) => {
            this.scene.remove(button);

            for (const key in button.userData) {
                delete button.userData[key];
            }

            button.geometry.dispose();
            if (button.material instanceof THREE.Material) {
                button.material.dispose();
            }
        });
        this.activeButtons = []; // 참조 초기화
    }

    exists(): boolean {
        return this.activePanel !== null;
    }

    getActiveButtons(): THREE.Mesh[] {
        return this.activeButtons;
    }
}

