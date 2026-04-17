import * as THREE from "three";

import { CardJob } from "../../card/job";
import { CardKind } from "../../card/kind";
import { Vector2d } from "../../common/math/Vector2d";
import { HandCard } from "../entity/HandCard";
import { HandCardFrame, HandCardSlot } from "../frame/HandCardFrame";

interface HandCardUserData {
    entityId: number;
    baseCardWidth: number;
    baseCardHeight: number;
}

interface SlotBuild {
    slot: HandCardSlot;
    imageSrc: string;
    slotType: string;
}

const RESOURCE_PATHS = {
    card: (id: number) => `resource/battle_field_unit/card/${id}.png`,
    swordPower: (id: number) => `resource/battle_field_unit/sword_power/${id}.png`,
    staffPower: (id: number) => `resource/battle_field_unit/staff_power/${id}.png`,
    hp: (id: number) => `resource/battle_field_unit/hp/${id}.png`,
    // Energy texture is name-based (non-numeric filename) in the resource tree.
    energy: () => `resource/battle_field_unit/energy/unit_card_energy.png`,
    race: (id: number) => `resource/card_race/${id}.png`,
    cardKinds: (id: number) => `resource/card_kinds/${id}.png`,
};

// Renders one hand card (main card + conditional slots + optional energy-text) into a Group
// centered at the local origin (0, 0). The parent BattleFieldHandRendererV2 places each card
// into the row by setting the outer Group's position.
export class HandCardRendererV2 {
    public async build(entity: HandCard, frame: HandCardFrame): Promise<THREE.Group> {
        const group = new THREE.Group();

        const cardWidth = frame.cardWidthRatio * window.innerWidth;
        const cardHeight = cardWidth * frame.cardAspect;

        const cardTexture = await this.loadTexture(RESOURCE_PATHS.card(entity.cardId));
        group.add(this.createMesh(cardTexture, cardWidth, cardHeight, new Vector2d(0, 0), 1));

        const slotBuilds = this.resolveSlotBuilds(entity, frame);
        for (const { slot, imageSrc, slotType } of slotBuilds) {
            const slotWidth = slot.widthRatio * cardWidth;
            const slotHeight = slotWidth * slot.aspect;
            const position = new Vector2d(
                slot.offsetXRatio * cardWidth,
                slot.offsetYRatio * cardHeight,
            );
            const texture = await this.loadTexture(imageSrc);
            const slotMesh = this.createMesh(texture, slotWidth, slotHeight, position, slot.renderOrder);
            slotMesh.userData.slotType = slotType;
            group.add(slotMesh);
        }

        // Energy text rides alongside the energy icon; both are gated on energyCount > 0 (see resolveSlotBuilds).
        if (entity.cardKind === CardKind.UNIT && entity.energyCount > 0) {
            const energySlot = frame.slots.energy;
            const energyPos = new Vector2d(
                energySlot.offsetXRatio * cardWidth,
                energySlot.offsetYRatio * cardHeight,
            );
            const textScale = frame.cardWidthRatio * 0.2 * window.innerWidth;
            group.add(this.createEnergyTextMesh(entity.energyCount, energyPos, textScale));
        }

        const userData: HandCardUserData = {
            entityId: entity.cardId,
            baseCardWidth: cardWidth,
            baseCardHeight: cardHeight,
        };
        group.userData = userData;
        return group;
    }

    // Viewport-driven rescale: uniform scale on the Group propagates to every child mesh's
    // size AND position, because all slot positions are expressed as ratios of cardWidth/cardHeight.
    public resize(frame: HandCardFrame, group: THREE.Group): void {
        const userData = group.userData as HandCardUserData;
        const newCardWidth = frame.cardWidthRatio * window.innerWidth;
        const newCardHeight = newCardWidth * frame.cardAspect;
        const sx = newCardWidth / userData.baseCardWidth;
        const sy = newCardHeight / userData.baseCardHeight;
        group.scale.set(sx, sy, 1);
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

    private resolveSlotBuilds(entity: HandCard, frame: HandCardFrame): SlotBuild[] {
        const builds: SlotBuild[] = [];

        // Matches BattleFieldHandServiceImpl.addAttributesToCardGroup exactly:
        //   WARRIOR → weapon, MAGICIAN → staff, ASSASSIN → (nothing, same as legacy gap)
        //   non-UNIT → kinds
        if (entity.cardKind === CardKind.UNIT) {
            if (entity.unitJob === CardJob.WARRIOR) {
                builds.push({ slot: frame.slots.weapon, imageSrc: RESOURCE_PATHS.swordPower(entity.attackPowerId), slotType: 'sword' });
            } else if (entity.unitJob === CardJob.MAGICIAN) {
                builds.push({ slot: frame.slots.staff, imageSrc: RESOURCE_PATHS.staffPower(entity.attackPowerId), slotType: 'staff' });
            }
        } else {
            builds.push({ slot: frame.slots.kinds, imageSrc: RESOURCE_PATHS.cardKinds(entity.kindId), slotType: 'kinds' });
        }

        if (entity.raceId >= 0) {
            builds.push({ slot: frame.slots.race, imageSrc: RESOURCE_PATHS.race(entity.raceId), slotType: 'race' });
        }

        if (entity.hpId != null && entity.hpId >= 0) {
            builds.push({ slot: frame.slots.hp, imageSrc: RESOURCE_PATHS.hp(entity.hpId), slotType: 'hp' });
        }

        // Skip the energy icon entirely when attached energy is 0 — drawing an empty "E" with "0"
        // is considered visual noise, not "displaying a count of zero".
        if (entity.cardKind === CardKind.UNIT && entity.energyCount > 0) {
            builds.push({ slot: frame.slots.energy, imageSrc: RESOURCE_PATHS.energy(), slotType: 'energy' });
        }

        return builds;
    }

    // Mirrors BattleFieldHandServiceImpl.createEnergyTextMesh to preserve the legacy "0" glyph.
    private createEnergyTextMesh(value: number, position: Vector2d, baseScale: number): THREE.Mesh {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 96px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const yOffset = canvas.height / 2 + 0.01030927835 * window.innerHeight;
        ctx.fillText(value.toString(), canvas.width / 2, yOffset);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.getX(), position.getY(), 0.01);
        mesh.scale.set(baseScale, baseScale, 1);
        return mesh;
    }

    // SRGB + LinearFilter + no mipmaps — match the unit/card texture baseline.
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
