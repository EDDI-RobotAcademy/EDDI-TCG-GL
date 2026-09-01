import * as THREE from "three";

import { CardJob } from "../../../card/job";
import { CardKind } from "../../../card/kind";
import { Vector2d } from "../../../common/math/Vector2d";
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
            const textMesh = this.createEnergyTextMesh(entity.energyCount, energyPos, textScale);
            textMesh.userData.slotType = 'energyText';
            group.add(textMesh);
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

    // Updates the attached-energy display on an already-built card Group IN PLACE:
    // disposes the existing energy icon + text mesh (if any) and, when newCount > 0,
    // adds fresh ones using the same positioning math as build().
    public updateEnergyCount(group: THREE.Group, newCount: number, frame: HandCardFrame): void {
        const ud = group.userData as HandCardUserData;
        const cardWidth = ud.baseCardWidth;
        const cardHeight = ud.baseCardHeight;

        const toRemove: THREE.Object3D[] = [];
        for (const child of group.children) {
            const slotType = (child.userData as { slotType?: string }).slotType;
            if (slotType === 'energy' || slotType === 'energyText') {
                toRemove.push(child);
            }
        }
        for (const child of toRemove) {
            group.remove(child);
            if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                const material = child.material;
                if (Array.isArray(material)) material.forEach((m) => m.dispose());
                else material?.dispose();
            }
        }

        if (newCount <= 0) return;

        const energySlot = frame.slots.energy;
        const slotWidth = energySlot.widthRatio * cardWidth;
        const slotHeight = slotWidth * energySlot.aspect;
        const position = new Vector2d(
            energySlot.offsetXRatio * cardWidth,
            energySlot.offsetYRatio * cardHeight,
        );
        // Icon — loaded asynchronously; added on completion. Callers don't await because the
        // rest of the turn flow doesn't depend on the icon being visible immediately.
        void this.loadTexture(RESOURCE_PATHS.energy()).then((texture) => {
            const iconMesh = this.createMesh(texture, slotWidth, slotHeight, position, energySlot.renderOrder);
            iconMesh.userData.slotType = 'energy';
            group.add(iconMesh);
        });

        const textScale = frame.cardWidthRatio * 0.2 * window.innerWidth;
        const textMesh = this.createEnergyTextMesh(newCount, position, textScale);
        textMesh.userData.slotType = 'energyText';
        group.add(textMesh);
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
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;

        // alphaTest + depthWrite:false kill the square-box halo behind the glyph — without
        // alphaTest the faintly-shaded filtered pixels around the text leave a visible rect.
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            depthWrite: false,
        });
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.getX(), position.getY(), 0.01);
        mesh.scale.set(baseScale, baseScale, 1);
        // MUST draw after the card body (renderOrder=1) and the energy icon (renderOrder=2).
        // With depthWrite:false the text no longer relies on depth-buffer occlusion to stay on top.
        mesh.renderOrder = 3;
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
