import * as THREE from "three";
import { disposeMesh, markOwnedTexture, disposeGroup } from "../../../../core/lifecycle/DisposableMeshStore";

import { CardJob } from "../../../../card/job";
import { CardKind } from "../../../../card/kind";
import { Vector2d } from "../../../../common/math/Vector2d";
import { CardFace } from "../entity/CardFace";
import { BadgeTextSpec, HandCardFrame, HandCardSlot } from "../frame/HandCardFrame";

interface HandCardUserData {
    entityId: number;
    baseCardWidth: number;
    baseCardHeight: number;
}

interface SlotBuild {
    slot: HandCardSlot;
    imageSrc: string;
    slotType: string;
    // 배지 위에 얹을 숫자. 없으면 안 얹는다.
    badge?: { readonly value: number; readonly spec: BadgeTextSpec };
}

const RESOURCE_PATHS = {
    card: (id: number) => `resource/battle_field_unit/card/${id}.png`,
    // 체력과 무기는 **숫자 없는 바탕 한 장**이다. 숫자는 그 위에 글자로 얹는다.
    //
    // 전에는 값마다 그림 한 장이었다 (153장씩). 152 를 넘는 값을 못 그렸고, 전투 중에
    // 값이 바뀌면 그림을 갈아 끼워야 했는데 그 길이 없었다.
    //
    swordPowerBase: () => `resource/battle_field_unit/sword_power/sword_power.png`,
    staffPowerBase: () => `resource/battle_field_unit/staff_power/staff_power.png`,
    hpBase: () => `resource/battle_field_unit/hp/hp.png`,
    // Energy texture is name-based (non-numeric filename) in the resource tree.
    energy: () => `resource/battle_field_unit/energy/unit_card_energy.png`,
    race: (id: number) => `resource/card_race/${id}.png`,
    cardKinds: (id: number) => `resource/card_kinds/${id}.png`,
};

// Renders one hand card (main card + conditional slots + optional energy-text) into a Group
// centered at the local origin (0, 0). The parent BattleFieldHandRendererV2 places each card
// into the row by setting the outer Group's position.
export class HandCardRendererV2 {
    public async build(entity: CardFace, frame: HandCardFrame): Promise<THREE.Group> {
        const group = new THREE.Group();

        const cardWidth = frame.cardWidthRatio * window.innerWidth;
        const cardHeight = cardWidth * frame.cardAspect;

        const cardTexture = await this.loadTexture(RESOURCE_PATHS.card(entity.cardId));
        group.add(this.createMesh(cardTexture, cardWidth, cardHeight, new Vector2d(0, 0), 1));

        const slotBuilds = this.resolveSlotBuilds(entity, frame);
        for (const { slot, imageSrc, slotType, badge } of slotBuilds) {
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

            if (badge) {
                // **배지의 자식으로 붙인다.** 형제로 두면 일반 공격에서 무기가 날아갈 때
                // 숫자만 제자리에 남는다. 그림에 숫자가 박혀 있을 때는 같이 날아갔다.
                slotMesh.add(this.createBadgeTextMesh(
                    badge.value, badge.spec, slotWidth, slotHeight, `${slotType}Text`,
                ));
            }
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
        disposeGroup(group);
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
            if (child instanceof THREE.Mesh) {
                // 숫자가 바뀔 때마다 글자 그림을 새로 만든다. 옛것을 놓아주지 않으면 쌓인다.
                disposeMesh(child);
            } else {
                group.remove(child);
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

        // 숫자 크기는 **만들 때의 카드 너비** 에서 낸다. 지금 창 너비를 보면 안 된다.
        //
        // 이 함수는 만들 때가 아니라 나중에 부른다. 그때 카드 겹은 이미 늘어나 있고, 이
        // 숫자는 그 겹의 자식이라 자동으로 따라 늘어난다. 창 너비를 또 보면 두 번 늘어난다.
        const textScale = 0.2 * cardWidth;
        const textMesh = this.createEnergyTextMesh(newCount, position, textScale);
        textMesh.userData.slotType = 'energyText';
        group.add(textMesh);
    }

    private resolveSlotBuilds(entity: CardFace, frame: HandCardFrame): SlotBuild[] {
        const builds: SlotBuild[] = [];

        // Matches BattleFieldHandServiceImpl.addAttributesToCardGroup exactly:
        //   WARRIOR → weapon, MAGICIAN → staff, ASSASSIN → (nothing, same as legacy gap)
        //   non-UNIT → kinds
        if (entity.cardKind === CardKind.UNIT) {
            if (entity.unitJob === CardJob.WARRIOR) {
                builds.push({
                    slot: frame.slots.weapon, imageSrc: RESOURCE_PATHS.swordPowerBase(), slotType: 'sword',
                    badge: { value: entity.attackPowerId, spec: frame.badgeText.weapon },
                });
            } else if (entity.unitJob === CardJob.MAGICIAN) {
                builds.push({
                    slot: frame.slots.staff, imageSrc: RESOURCE_PATHS.staffPowerBase(), slotType: 'staff',
                    badge: { value: entity.attackPowerId, spec: frame.badgeText.staff },
                });
            }
        } else {
            builds.push({ slot: frame.slots.kinds, imageSrc: RESOURCE_PATHS.cardKinds(entity.kindId), slotType: 'kinds' });
        }

        if (entity.raceId >= 0) {
            builds.push({ slot: frame.slots.race, imageSrc: RESOURCE_PATHS.race(entity.raceId), slotType: 'race' });
        }

        if (entity.hpId != null && entity.hpId >= 0) {
            builds.push({
                slot: frame.slots.hp, imageSrc: RESOURCE_PATHS.hpBase(), slotType: 'hp',
                badge: { value: entity.hpId, spec: frame.badgeText.hp },
            });
        }

        // Skip the energy icon entirely when attached energy is 0 — drawing an empty "E" with "0"
        // is considered visual noise, not "displaying a count of zero".
        if (entity.cardKind === CardKind.UNIT && entity.energyCount > 0) {
            builds.push({ slot: frame.slots.energy, imageSrc: RESOURCE_PATHS.energy(), slotType: 'energy' });
        }

        return builds;
    }

    // 배지 위에 얹는 숫자를 만든다. 체력과 무기가 쓴다.
    //
    // **글자 먹 자국을 기준으로 놓고 잰다.** 글꼴 상자를 기준으로 하면 (textBaseline
    // "middle") 아래로 내려가는 획 자리까지 상자에 들어 있어서, 숫자만 그릴 때 글자가
    // 위로 뜬다. `actualBoundingBox` 가 실제로 먹이 묻은 칸을 알려 준다.
    //
    // 크기도 먹 자국으로 맞춘다. 그래서 글꼴을 바꿔도 글자 크기가 안 변한다.
    // 자리는 **배지 한가운데 기준**이다. 배지의 자식이라 배지가 이미 제자리에 있다.
    private createBadgeTextMesh(
        value: number, spec: BadgeTextSpec,
        slotWidth: number, slotHeight: number, slotType: string,
    ): THREE.Mesh {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const text = String(value);

        // 재 볼 때 쓰는 글씨 크기. 이 값 자체는 화면에 안 나온다 — 먹 자국을 재서
        // 세계 크기로 옮기는 데만 쓴다.
        const REF_PX = 200;
        const fontOf = (px: number) => spec.font.replace('{px}', String(px));
        // 숫자 사이를 벌린다. 글자 높이에 맞춰 벌려야 크기가 달라져도 보기가 같다.
        // 굵은 Times 숫자의 높이는 글씨 크기의 약 0.66 배다.
        const spacingPx = spec.letterSpacingRatio * REF_PX * 0.66;
        const applySpacing = (c: CanvasRenderingContext2D): void => {
            // 옛 브라우저는 이 값을 모른다. 그때는 글꼴 기본 간격으로 그린다.
            (c as unknown as {letterSpacing?: string}).letterSpacing = `${spacingPx}px`;
        };

        ctx.font = fontOf(REF_PX);
        applySpacing(ctx);
        const m = ctx.measureText(text);
        const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
        if (inkH <= 0) return new THREE.Mesh();

        // 먹 자국에 딱 맞는 판을 만들고 여백을 조금 둔다. 여백이 없으면 가장자리가 잘린다.
        const PAD = Math.ceil(REF_PX * 0.08);
        canvas.width = Math.ceil(inkW) + PAD * 2;
        canvas.height = Math.ceil(inkH) + PAD * 2;

        // 판 크기를 바꾸면 그리기 상태가 지워진다. 다시 잡는다.
        ctx.font = fontOf(REF_PX);
        applySpacing(ctx);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = spec.color;
        // 먹 자국의 왼쪽 위가 (PAD, PAD) 에 오도록 놓는다.
        ctx.fillText(text, PAD + m.actualBoundingBoxLeft, PAD + m.actualBoundingBoxAscent);

        const texture = markOwnedTexture(new THREE.CanvasTexture(canvas));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01,
            depthWrite: false,
        });

        // 먹 자국 높이가 배지 높이의 sizeRatio 가 되게 판 크기를 낸다.
        const worldPerPixel = (spec.sizeRatio * slotHeight) / inkH;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.scale.set(canvas.width * worldPerPixel, canvas.height * worldPerPixel, 1);
        mesh.position.set(
            spec.offsetXRatio * slotWidth,
            spec.offsetYRatio * slotHeight,
            0.01,
        );
        // 배지(renderOrder 2) 위에 와야 한다.
        mesh.renderOrder = 3;
        mesh.userData.slotType = slotType;
        return mesh;
    }

    // 배지 위 숫자를 **제자리에서** 바꾼다. 전투 중에 체력이 깎이거나 공격력이 오를 때 쓴다.
    //
    // 크기는 **만들 때의 카드 너비** 에서 낸다. 지금 창 너비를 보면 안 된다 — 이 숫자는
    // 이미 늘어나 있는 카드 겹의 자식이라, 창 너비를 또 보면 두 번 늘어난다.
    public setBadgeValue(
        group: THREE.Group, frame: HandCardFrame,
        which: 'hp' | 'sword' | 'staff', value: number,
    ): void {
        const ud = group.userData as HandCardUserData;
        // 무기는 병종에 따라 검이거나 지팡이다. 부르는 쪽이 어느 쪽인지 안다.
        const slot = which === 'hp' ? frame.slots.hp
            : which === 'staff' ? frame.slots.staff : frame.slots.weapon;
        const spec = which === 'hp' ? frame.badgeText.hp
            : which === 'staff' ? frame.badgeText.staff : frame.badgeText.weapon;
        const slotType = `${which}Text`;

        // 이 배지가 애초에 없는 카드면 아무것도 안 한다. 없는 자리에 숫자만 뜨면 안 된다.
        const badgeMesh = group.children.find(
            (it) => (it.userData as { slotType?: string }).slotType === which,
        );
        if (!badgeMesh) return;

        for (const child of [...badgeMesh.children]) {
            if ((child.userData as { slotType?: string }).slotType !== slotType) continue;
            // 숫자가 바뀔 때마다 글자 그림을 새로 만든다. 옛것을 놓아주지 않으면 쌓인다.
            if (child instanceof THREE.Mesh) disposeMesh(child);
            else badgeMesh.remove(child);
        }

        const slotWidth = slot.widthRatio * ud.baseCardWidth;
        const slotHeight = slotWidth * slot.aspect;
        badgeMesh.add(this.createBadgeTextMesh(
            value, spec, slotWidth, slotHeight, slotType,
        ));
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

        const texture = markOwnedTexture(new THREE.CanvasTexture(canvas));
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
