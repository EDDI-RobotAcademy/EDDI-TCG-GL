import * as THREE from "three";

import { Vector2d } from "../../../common/math/Vector2d";
import { EntityRenderer } from "../../../core/renderer/EntityRenderer";
import { resolveAnchorPoint } from "../../../core/frame/Anchor";
import { SlotSpec } from "../../../core/frame/SlotSpec";
import { ResourceManager } from "../../../resouce_manager/ResourceManager";
import { BattleFieldUnit } from "../entity/BattleFieldUnit";
import { UnitFrame } from "../frame/UnitFrame";

interface ResolvedSlot {
    spec: SlotSpec;
    imageSrc: string;
}

export class BattleFieldUnitRendererV2 implements EntityRenderer<BattleFieldUnit, UnitFrame> {
    constructor(private readonly resourceManager: ResourceManager) {}

    public async build(entity: BattleFieldUnit, frame: UnitFrame): Promise<THREE.Group> {
        const group = new THREE.Group();

        const cardW = frame.rootWidth;
        const cardH = cardW * frame.rootAspect;

        const cardId = entity.getCardId();
        if (cardId < 0) {
            throw new Error(`BattleFieldUnit ${entity.getId()} is missing cardId`);
        }

        const cardTexture = await this.loadTexture(this.resourceManager.getCardPath(cardId));
        group.add(this.createMesh(cardTexture, cardW, cardH, new Vector2d(0, 0), 1));

        for (const { spec, imageSrc } of this.resolveSlots(entity, frame)) {
            const texture = await this.loadTexture(imageSrc);
            const slotW = cardW * spec.widthRatio;
            const slotH = slotW * spec.aspect;

            const anchorPoint = resolveAnchorPoint(spec.anchor, cardW, cardH);
            const position = new Vector2d(
                anchorPoint.getX() + spec.offset.getX(),
                anchorPoint.getY() + spec.offset.getY(),
            );

            group.add(this.createMesh(texture, slotW, slotH, position, spec.renderOrder));
        }

        const unitPosition = entity.getLocalTranslationPosition();
        group.position.set(unitPosition.getX(), unitPosition.getY(), 0);
        group.userData.entityId = entity.getId();
        group.userData.frame = frame;

        return group;
    }

    public update(entity: BattleFieldUnit, frame: UnitFrame, group: THREE.Group): void {
        const unitPosition = entity.getLocalTranslationPosition();
        group.position.set(unitPosition.getX(), unitPosition.getY(), 0);
        group.userData.frame = frame;
    }

    public dispose(group: THREE.Group): void {
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry?.dispose();
                const material = object.material;
                if (Array.isArray(material)) {
                    material.forEach((m) => m.dispose());
                } else {
                    material?.dispose();
                }
            }
        });
        group.clear();
    }

    private resolveSlots(entity: BattleFieldUnit, frame: UnitFrame): ResolvedSlot[] {
        const slots: ResolvedSlot[] = [];

        const weaponId = entity.getWeaponId();
        if (weaponId >= 0) {
            slots.push({ spec: frame.slots.weapon, imageSrc: this.resourceManager.getWeaponPath(weaponId) });
        }

        const hpId = entity.getHpId();
        if (hpId >= 0) {
            slots.push({ spec: frame.slots.hp, imageSrc: this.resourceManager.getHpPath(hpId) });
        }

        const energyId = entity.getEnergyId();
        if (energyId >= 0) {
            slots.push({ spec: frame.slots.energy, imageSrc: this.resourceManager.getEnergyPath(energyId) });
        }

        const raceId = entity.getRaceId();
        if (raceId >= 0) {
            slots.push({ spec: frame.slots.race, imageSrc: this.resourceManager.getRacePath(raceId) });
        }

        return slots;
    }

    // Match existing Shape-image texture settings (see LegacyNonBackgroundImage / NonBackgroundImage):
    // SRGBColorSpace + LinearFilter min/mag + generateMipmaps=false keeps TCG pixel art crisp at 1:1.
    private loadTexture(imageSrc: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(
                imageSrc,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                },
                undefined,
                (error) => reject(error),
            );
        });
    }

    private createMesh(
        texture: THREE.Texture,
        width: number,
        height: number,
        position: Vector2d,
        renderOrder: number,
    ): THREE.Mesh {
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
        });
        const geometry = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = renderOrder;
        mesh.position.set(position.getX(), position.getY(), 0);
        return mesh;
    }
}
