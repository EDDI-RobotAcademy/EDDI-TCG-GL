import * as THREE from "three";

import {TextureManager} from "../../../texture_manager/TextureManager";
import {MeshGenerator} from "../../../mesh/generator";
import {Vector2d} from "../../../common/math/Vector2d";
import {
    LegacyActivePanelFrame,
    computeLegacyActivePanelSize,
    computeLegacyActivePanelButtonOffsetY,
} from "../frame/LegacyActivePanelFrame";

export type LegacyActivePanelButtonType = 'general' | 'details' | 'firstSkill' | 'secondSkill';

// 만들어진 패널 한 벌. 담아 두는 쪽이 이것을 그대로 든다.
export interface LegacyActivePanelParts {
    readonly panel: THREE.Mesh;
    readonly buttons: THREE.Mesh[];
}

// 본편이 쓰는 액티브 패널을 만든다.
//
// 전에는 담아 두는 곳이 이 일을 했다. 그래서 그 곳이 화면과 카메라를 들어야 했고,
// 혼자만 있는 것이라 처음 만든 화면에 묶였다.
//
// 자리 계산은 옛 방식 그대로다. 바꾸면 본편의 패널이 다르게 보인다.
export class LegacyActivePanelRenderer {
    private readonly textureManager = TextureManager.getInstance();

    public async build(
        frame: LegacyActivePanelFrame,
        center: Vector2d,
        cardId: number,
        skillCount: number,
    ): Promise<LegacyActivePanelParts> {
        const size = computeLegacyActivePanelSize(frame, skillCount, window.innerWidth);

        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(size.panelWidth, size.panelHeight + size.heightMargin),
            new THREE.MeshBasicMaterial({
                color: frame.panelColor,
                transparent: true,
                opacity: frame.panelOpacity,
                // 필드 카드 위에 얹혀야 하므로 앞뒤를 안 따진다.
                depthTest: false,
            }),
        );
        panel.renderOrder = frame.panelRenderOrder;
        panel.position.set(center.getX(), center.getY(), 0);

        const buttons: THREE.Mesh[] = [];
        const types: LegacyActivePanelButtonType[] =
            ['general', 'details', 'firstSkill', 'secondSkill'];
        for (const type of types) {
            const button = await this.buildButton(frame, size, center, type, cardId, skillCount);
            if (button) buttons.push(button);
        }

        return {panel, buttons};
    }

    private async buildButton(
        frame: LegacyActivePanelFrame,
        size: ReturnType<typeof computeLegacyActivePanelSize>,
        center: Vector2d,
        type: LegacyActivePanelButtonType,
        cardId: number,
        skillCount: number,
    ): Promise<THREE.Mesh | null> {
        const texture = await this.resolveTexture(type, cardId, skillCount);
        if (!texture) return null;

        const mesh = MeshGenerator.createMesh(texture, size.buttonWidth, size.buttonHeight, center);
        mesh.renderOrder = frame.buttonRenderOrder;

        const offsetY = computeLegacyActivePanelButtonOffsetY(type, size, skillCount);
        mesh.position.set(center.getX(), center.getY() + offsetY, mesh.position.z);
        mesh.userData.type = type;
        return mesh;
    }

    private async resolveTexture(
        type: LegacyActivePanelButtonType, cardId: number, skillCount: number,
    ): Promise<THREE.Texture | null | undefined> {
        if (type === 'general') {
            return this.textureManager.getTexture("active_panel_general", 1);
        }
        if (type === 'details') {
            return this.textureManager.getTexture("active_panel_details", 1);
        }
        if (type === 'firstSkill' && skillCount > 0) {
            return this.textureManager.getSkillButtonTexture(cardId, 1);
        }
        if (type === 'secondSkill' && skillCount > 1) {
            return this.textureManager.getSkillButtonTexture(cardId, 2);
        }
        return null;
    }

    public dispose(parts: LegacyActivePanelParts): void {
        this.disposeMesh(parts.panel);
        for (const button of parts.buttons) {
            for (const key in button.userData) delete button.userData[key];
            this.disposeMesh(button);
        }
    }

    private disposeMesh(mesh: THREE.Mesh): void {
        mesh.parent?.remove(mesh);
        mesh.geometry?.dispose();
        if (mesh.material instanceof THREE.Material) mesh.material.dispose();
    }
}
