import { CameraManager } from "../../src/core/camera/CameraManager";
import { RendererManager } from "../../src/core/renderer/RendererManager";
import { SceneManager } from "../../src/core/scene/SceneManager";
import { AnimationLoop } from "../../src/core/animation/AnimationLoop";
import { AudioController } from "../../src/audio/AudioController";
import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';

import { createBattleFieldBackgroundFrame } from "../../src/background/frame/BackgroundFrame";
import { BackgroundRendererV2 } from "../../src/background/renderer/BackgroundRendererV2";

import {
    createDefaultYourFieldAreaFrame,
    computeYourFieldAreaBounds,
} from "../../src/your_field_area/frame/YourFieldAreaFrame";
import { YourFieldAreaRendererV2 } from "../../src/your_field_area/renderer/YourFieldAreaRendererV2";
import {
    createDefaultPlacedCardPlacementFrame,
    computePlacedCardPosition,
} from "../../src/your_field_area/frame/PlacedCardPlacementFrame";

import { createDefaultOpponentFieldAreaFrame } from "../../src/opponent_field_area/frame/OpponentFieldAreaFrame";
import { OpponentFieldAreaRendererV2 } from "../../src/opponent_field_area/renderer/OpponentFieldAreaRendererV2";
import { createDefaultOpponentFieldLayoutFrame, computeOpponentFieldCardCenter } from "../../src/opponent_field/frame/OpponentFieldLayoutFrame";
import { OpponentFieldRendererV2 } from "../../src/opponent_field/renderer/OpponentFieldRendererV2";
import { OpponentFieldMapRepositoryImpl } from "../../src/opponent_field_map/repository/OpponentFieldMapRepositoryImpl";

import { BattleFieldHandMapRepositoryImpl } from "../../src/battle_field_hand/repository/BattleFieldHandMapRepositoryImpl";
import { HandCard } from "../../src/battle_field_hand/entity/HandCard";
import { createDefaultHandCardFrame } from "../../src/battle_field_hand/frame/HandCardFrame";
import {
    createDefaultBattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../../src/battle_field_hand/frame/BattleFieldHandLayoutFrame";
import { BattleFieldHandRendererV2 } from "../../src/battle_field_hand/renderer/BattleFieldHandRendererV2";
import { HandInteractionBridge } from "../../src/battle_field_hand/interaction/HandInteractionBridge";

import { createDefaultHandPageButtonsFrame } from "../../src/battle_field_hand_page/frame/HandPageButtonsFrame";
import { HandPageButtonsRendererV2 } from "../../src/battle_field_hand_page/renderer/HandPageButtonsRendererV2";

import * as THREE from "three";

import { getCardById } from "../../src/card/utility";
import { CardJob } from "../../src/card/job";
import { CardKind } from "../../src/card/kind";
import { getSkillType, SkillType } from "../../src/card/SkillType";

import { createDefaultFieldEnergyHudFrame } from "../../src/common/field_energy/frame/FieldEnergyHudFrame";
import { FieldEnergyHudRendererV2 } from "../../src/common/field_energy/renderer/FieldEnergyHudRendererV2";
import { createDefaultFieldEnergyRaceHudFrame } from "../../src/common/field_energy/frame/FieldEnergyRaceHudFrame";
import { FieldEnergyRaceHudRendererV2 } from "../../src/common/field_energy/renderer/FieldEnergyRaceHudRendererV2";
import { createDefaultFieldEnergyCountHudFrame } from "../../src/common/field_energy/frame/FieldEnergyCountHudFrame";
import { FieldEnergyCountHudRendererV2 } from "../../src/common/field_energy/renderer/FieldEnergyCountHudRendererV2";

import { createAllyNeonBorderFrame, createEnemyNeonBorderFrame } from "../../src/neon_border/frame/NeonBorderFrame";
import { NeonBorderEffect } from "../../src/neon_border/effect/NeonBorderEffect";

import { createDefaultActivePanelFrame, ActivePanelButtonSpec } from "../../src/active_panel_area/frame/ActivePanelFrame";
import { ActivePanelRendererV2 } from "../../src/active_panel_area/renderer/ActivePanelRendererV2";

import { createDefaultGuideMessageHudFrame } from "../../src/common/guide_message/frame/GuideMessageHudFrame";
import { GuideMessageHudRendererV2 } from "../../src/common/guide_message/renderer/GuideMessageHudRendererV2";
import { createDefaultSandTimerHudFrame } from "../../src/common/timer/frame/SandTimerHudFrame";
import { SandTimerHudRendererV2 } from "../../src/common/timer/renderer/SandTimerHudRendererV2";
import { createDefaultTurnHudFrame } from "../../src/common/turn/frame/TurnHudFrame";
import { TurnHudRendererV2 } from "../../src/common/turn/renderer/TurnHudRendererV2";

const rootElement = document.getElementById('app');
if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

function resolveCards(cardIds: number[], label: string): HandCard[] {
    const out: HandCard[] = [];
    for (const cardId of cardIds) {
        const card = getCardById(cardId);
        if (!card) {
            console.warn(`${label}: Card ${cardId} not found in every_card_info — skipping.`);
            continue;
        }
        out.push({
            cardId,
            cardKind: parseInt(card.종류, 10) as CardKind,
            unitJob: parseInt(card.병종, 10) as CardJob,
            raceId: parseInt(card.종족, 10),
            hpId: card.체력,
            attackPowerId: card.공격력,
            kindId: parseInt(card.종류, 10),
            energyCount: 0,
        });
    }
    return out;
}

async function main(container: HTMLElement): Promise<void> {
    const rendererManager = new RendererManager(container);
    const sceneManager = new SceneManager();
    const cameraManager = CameraManager.getInstance();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = window.innerHeight;
    const camera = cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

    // Background music — plays on first user interaction (browser autoplay policy)
    const audioController = AudioController.getInstance();
    audioController.setMusic(battleFieldMusic);
    window.addEventListener('click', () => { audioController.playMusic(); }, { once: true });

    const scene = sceneManager.createScene('draw-field-energy-full-efr');

    // Load skill image paths per card from image-paths.json (card-specific skill buttons)
    let skillImagePaths: Record<string, string[]> = {};
    try {
        const resp = await fetch('image-paths.json');
        const imageData = await resp.json();
        skillImagePaths = imageData.active_panel_skill || {};
    } catch (err) {
        console.warn('Failed to load image-paths.json for skill buttons:', err);
    }

    // Pilot A — background + your field area
    const backgroundFrame = createBattleFieldBackgroundFrame();
    const backgroundRenderer = new BackgroundRendererV2();
    const backgroundGroup = await backgroundRenderer.build(backgroundFrame);
    scene.add(backgroundGroup);

    const yourFieldAreaFrame = createDefaultYourFieldAreaFrame();
    const yourFieldAreaRenderer = new YourFieldAreaRendererV2();
    const yourFieldAreaGroup = await yourFieldAreaRenderer.build(yourFieldAreaFrame);
    scene.add(yourFieldAreaGroup);

    // Pilot E new — opponent field area + opponent units
    const opponentFieldAreaFrame = createDefaultOpponentFieldAreaFrame();
    const opponentFieldAreaRenderer = new OpponentFieldAreaRendererV2();
    const opponentFieldAreaGroup = await opponentFieldAreaRenderer.build(opponentFieldAreaFrame);
    scene.add(opponentFieldAreaGroup);

    // Pilot B — hand row (6장으로 확장해 페이지네이션 검증)
    const placementFrame = createDefaultPlacedCardPlacementFrame();

    const handMapRepo = BattleFieldHandMapRepositoryImpl.getInstance();
    handMapRepo.addBattleFieldHand(27);
    handMapRepo.addBattleFieldHand(31);
    handMapRepo.addBattleFieldHand(32);
    const handCardIds = handMapRepo.getBattleFieldHandList();
    const hand = resolveCards(handCardIds, 'hand');

    const handCardFrame = createDefaultHandCardFrame();
    const handLayoutFrame = createDefaultBattleFieldHandLayoutFrame();
    const handRenderer = new BattleFieldHandRendererV2();
    const handGroup = await handRenderer.build(hand, handCardFrame, handLayoutFrame);
    scene.add(handGroup);

    const entries = handRenderer.getEntries(handGroup);

    const handOrder: number[] = entries.map((e) => e.card.cardId);
    const placedOrder: number[] = [];
    const MAX_PER_PAGE = 4;
    let currentPage = 1;

    const getEntryByCardId = (cardId: number) => entries.find((e) => e.card.cardId === cardId);
    const getMaxPage = () => Math.max(1, Math.ceil(handOrder.length / MAX_PER_PAGE));

    const reflowHandAndPlaced = (): void => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const pageStart = (currentPage - 1) * MAX_PER_PAGE;
        const pageEnd = pageStart + MAX_PER_PAGE;

        handOrder.forEach((cardId, index) => {
            const entry = getEntryByCardId(cardId);
            if (!entry) return;
            if (index >= pageStart && index < pageEnd) {
                const pageLocalIndex = index - pageStart;
                const { x, y } = computeHandCardCenter(handLayoutFrame, pageLocalIndex, w, h);
                entry.group.position.set(x, y, 0);
                entry.group.visible = true;
            } else {
                entry.group.visible = false;
            }
        });

        placedOrder.forEach((cardId, index) => {
            const entry = getEntryByCardId(cardId);
            if (!entry) return;
            const { x, y } = computePlacedCardPosition(placementFrame, index, w, h);
            entry.group.position.set(x, y, 0);
            entry.group.visible = true;
        });
    };

    reflowHandAndPlaced();

    // Pilot E new — opponent field units (reuses HandCardRendererV2 via OpponentFieldRendererV2)
    const opponentCardIds = OpponentFieldMapRepositoryImpl.getInstance().getOpponentFieldList();
    const opponentCards = resolveCards(opponentCardIds, 'opponent');
    const opponentLayoutFrame = createDefaultOpponentFieldLayoutFrame();
    const opponentRenderer = new OpponentFieldRendererV2();
    const opponentGroup = await opponentRenderer.build(opponentCards, handCardFrame, opponentLayoutFrame);
    scene.add(opponentGroup);

    // Opponent HP state + alive order for reflow on death
    const opponentHpState = new Map<number, number>();
    const opponentAliveOrder: number[] = [];
    for (let i = 0; i < opponentCards.length; i++) {
        const oc = opponentCards[i];
        const card = getCardById(oc.cardId);
        const hp = card?.체력 ?? 0;
        opponentHpState.set(i, typeof hp === 'number' ? hp : 0);
        opponentAliveOrder.push(i);
    }

    const opponentEntries = (opponentGroup.userData as { entries: { card: HandCard; cardIndex: number; group: THREE.Group }[] }).entries;

    const reflowOpponentField = (): void => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (const entry of opponentEntries) {
            const aliveIdx = opponentAliveOrder.indexOf(entry.cardIndex);
            if (aliveIdx >= 0) {
                const { x, y } = computeOpponentFieldCardCenter(opponentLayoutFrame, aliveIdx, w, h);
                entry.group.position.set(x, y, 0);
                entry.group.visible = true;
            } else {
                entry.group.visible = false;
            }
        }
    };

    // Tracks which attack/skill is active so single-target execution uses the correct damage.
    let pendingAttackDamage: number = 0;

    // Pilot E — hand page prev/next buttons with click handling
    const handPageButtonsFrame = createDefaultHandPageButtonsFrame();
    const handPageButtonsRenderer = new HandPageButtonsRendererV2();
    const handPageButtonsGroup = await handPageButtonsRenderer.build(handPageButtonsFrame);
    scene.add(handPageButtonsGroup);

    // NeonBorder effects — ally (blue, single-select) + enemy (red, multi-select)
    const neonBorderFrame = createAllyNeonBorderFrame();
    const neonEffect = new NeonBorderEffect(neonBorderFrame);
    const enemyNeonEffect = new NeonBorderEffect(createEnemyNeonBorderFrame());

    // Active panel state
    const activePanelFrame = createDefaultActivePanelFrame();
    const activePanelRenderer = new ActivePanelRendererV2();
    let activePanelGroup: THREE.Group | null = null;
    type InteractionState = 'idle' | 'cardSelected' | 'panelVisible' | 'attackMode';
    let interactionState: InteractionState = 'idle';

    function clearActivePanel(): void {
        if (activePanelGroup) {
            activePanelRenderer.dispose(activePanelGroup);
            activePanelGroup = null;
        }
        enemyNeonEffect.detachAll();
        if (interactionState === 'panelVisible' || interactionState === 'attackMode') {
            interactionState = neonEffect.hasActive() ? 'cardSelected' : 'idle';
        }
    }

    function clearAllSelection(): void {
        clearActivePanel();
        neonEffect.detachAll();
        interactionState = 'idle';
    }

    const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
    animationLoop.setCustomUpdate(() => {
        neonEffect.updateAnimation();
        enemyNeonEffect.updateAnimation();
    });
    animationLoop.start();

    // Shared raycaster
    const sharedRaycaster = new THREE.Raycaster();
    function ndcFromEvent(e: MouseEvent): THREE.Vector2 {
        return new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1,
        );
    }

    // Page button click
    rendererManager.getDomElement().addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button !== 0) return;
        sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
        const hits = sharedRaycaster.intersectObjects(handPageButtonsGroup.children, false);
        if (hits.length === 0) return;

        const buttonType = hits[0].object.userData.buttonType;
        if (buttonType === 'prev' && currentPage > 1) {
            currentPage--;
            reflowHandAndPlaced();
        } else if (buttonType === 'next' && currentPage < getMaxPage()) {
            currentPage++;
            reflowHandAndPlaced();
        }
    });

    // Active panel button click + opponent card click (attack targeting).
    // stopImmediatePropagation prevents HandInteractionBridge from stealing the same click.
    rendererManager.getDomElement().addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button !== 0) return;
        sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);

        // Check active panel button click first
        if (activePanelGroup && interactionState === 'panelVisible') {
            const panelHits = sharedRaycaster.intersectObjects(activePanelGroup.children, false);
            if (panelHits.length > 0) {
                e.stopImmediatePropagation();
                const btnType = panelHits[0].object.userData.buttonType;
                if (btnType === 'general' || btnType.startsWith('skill')) {
                    const attackerId = neonEffect.getActiveEntityIds()[0];
                    const attackerCard = attackerId != null ? getCardById(attackerId) : null;

                    // Determine skill type for skill buttons
                    let skillType = SkillType.Single;
                    let damage = attackerCard?.공격력 ?? 0;

                    // Card data uses SPACE keys in the actual JS data (not underscores):
                    //   "스킬 1" = skill type number, "스킬1 데미지" = skill1 damage, etc.
                    // Card interface uses underscores (스킬_1, 스킬1_데미지) but those don't match.
                    const cardAny = attackerCard as any;
                    if (btnType === 'skill1' && attackerCard) {
                        skillType = getSkillType(cardAny['스킬 1']);
                        damage = cardAny['스킬1 데미지'] ?? 0;
                    } else if (btnType === 'skill2' && attackerCard) {
                        skillType = getSkillType(cardAny['스킬 2']);
                        damage = cardAny['스킬2 데미지'] ?? 0;
                    }

                    if (skillType === SkillType.EveryUnitField || skillType === SkillType.EveryField) {
                        // AoE — immediate damage to ALL alive opponents, no targeting phase
                        console.log(`${btnType} (AoE, damage=${damage}) → hitting all opponents`);

                        for (const idx of [...opponentAliveOrder]) {
                            const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                            if (!entry) continue;

                            const currentHp = opponentHpState.get(idx) ?? 0;
                            const newHp = currentHp - damage;
                            opponentHpState.set(idx, newHp);

                            // Red flash on all hit targets
                            entry.group.traverse((child) => {
                                if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                                    const mat = child.material as THREE.MeshBasicMaterial;
                                    const origColor = mat.color.clone();
                                    mat.color.set(0xff4444);
                                    setTimeout(() => { mat.color.copy(origColor); }, 200);
                                }
                            });

                            if (newHp <= 0) {
                                const capturedIdx = idx;
                                setTimeout(() => {
                                    const aliveIdx = opponentAliveOrder.indexOf(capturedIdx);
                                    if (aliveIdx >= 0) {
                                        opponentAliveOrder.splice(aliveIdx, 1);
                                    }
                                    reflowOpponentField();
                                }, 300);
                            }

                            console.log(`  opponent idx=${idx} HP: ${currentHp} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                        }

                        clearAllSelection();
                    } else {
                        // Single-target — enter attack mode, red neon on opponents
                        interactionState = 'attackMode';
                        pendingAttackDamage = damage;
                        for (const entry of opponentEntries) {
                            if (entry.group.visible) {
                                enemyNeonEffect.attach(entry.cardIndex, entry.group);
                            }
                        }
                        console.log(`${btnType} (Single, damage=${damage}) — choose opponent target`);
                    }
                } else if (btnType === 'details') {
                    console.log('Details clicked — not implemented in pilot');
                    clearActivePanel();
                }
                return;
            }
        }

        // Check opponent card click while in attack mode — apply damage, kill only if HP <= 0.
        // Must iterate ALL hits and skip invisible groups (THREE.js 0.164 raycaster doesn't
        // filter by visible — dead cards at old positions still get hit).
        if (interactionState === 'attackMode') {
            const oppHits = sharedRaycaster.intersectObjects(opponentGroup.children, true);
            let targetEntry: typeof opponentEntries[number] | null = null;

            for (const hit of oppHits) {
                let walkGroup: THREE.Object3D | null = hit.object;
                while (walkGroup && walkGroup.parent !== opponentGroup) {
                    walkGroup = walkGroup.parent;
                }
                if (walkGroup && walkGroup instanceof THREE.Group && walkGroup.visible) {
                    const found = opponentEntries.find((oe) => oe.group === walkGroup);
                    if (found) { targetEntry = found; break; }
                }
            }

            if (targetEntry) {
                e.stopImmediatePropagation();
                const attackPower = pendingAttackDamage;
                const attackerId = neonEffect.getActiveEntityIds()[0];

                const targetIdx = targetEntry.cardIndex;
                const currentHp = opponentHpState.get(targetIdx) ?? 0;
                const newHp = currentHp - attackPower;
                opponentHpState.set(targetIdx, newHp);

                console.log(`Single-target attack: attacker=${attackerId} (ATK=${attackPower}) → opponent idx=${targetIdx} cardId=${targetEntry.card.cardId} (HP: ${currentHp} → ${newHp})`);

                const flashGroup = targetEntry.group;
                flashGroup.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                        const mat = child.material as THREE.MeshBasicMaterial;
                        const origColor = mat.color.clone();
                        mat.color.set(0xff4444);
                        setTimeout(() => { mat.color.copy(origColor); }, 200);
                    }
                });

                if (newHp <= 0) {
                    setTimeout(() => {
                        const aliveIdx = opponentAliveOrder.indexOf(targetIdx);
                        if (aliveIdx >= 0) {
                            opponentAliveOrder.splice(aliveIdx, 1);
                        }
                        reflowOpponentField();
                        console.log(`Opponent idx=${targetIdx} defeated! Remaining: ${opponentAliveOrder.length}`);
                    }, 300);
                } else {
                    console.log(`Opponent idx=${targetIdx} survived with HP=${newHp}`);
                }

                clearAllSelection();
                return;
            }
        }
    });

    // Right-click: toggle active panel if a placed card is selected
    rendererManager.getDomElement().addEventListener('contextmenu', (e: Event) => {
        e.preventDefault();
    });
    rendererManager.getDomElement().addEventListener('mousedown', async (e: MouseEvent) => {
        if (e.button !== 2) return;
        e.preventDefault();

        if (interactionState === 'panelVisible' || interactionState === 'attackMode') {
            clearActivePanel();
            return;
        }

        if (interactionState !== 'cardSelected') return;

        const selectedId = neonEffect.getActiveEntityIds()[0];
        if (selectedId == null) return;
        const isPlaced = placedOrder.includes(selectedId);
        if (!isPlaced) return;

        // Panel spawns at mouse right-click world position (legacy: activePanelAreaRepository.create(clickPoint.x, clickPoint.y, cardId))
        const clickNdc = ndcFromEvent(e);
        sharedRaycaster.setFromCamera(clickNdc, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const clickWorld = new THREE.Vector3();
        if (!sharedRaycaster.ray.intersectPlane(plane, clickWorld)) return;

        const clickPos = { x: clickWorld.x, y: clickWorld.y };

        // Build button list: general → skill1 → skill2 → ... → details
        const buttonSpecs: ActivePanelButtonSpec[] = [
            activePanelFrame.generalButton,
        ];

        // Add skill buttons if card has skill textures in image-paths.json
        const selectedCardId = neonEffect.getActiveEntityIds()[0];
        const cardSkillPaths = skillImagePaths[String(selectedCardId)] || [];
        for (let i = 0; i < cardSkillPaths.length; i++) {
            buttonSpecs.push({
                type: `skill${i + 1}`,
                imageSrc: cardSkillPaths[i],
            });
        }

        buttonSpecs.push(activePanelFrame.detailsButton);

        activePanelGroup = await activePanelRenderer.build(activePanelFrame, clickPos, buttonSpecs);
        scene.add(activePanelGroup);
        interactionState = 'panelVisible';
    });

    // Field energy → card attachment. Intercepts clicks BEFORE bridge when fieldEnergyActive.
    let availableEnergy = 7;
    const placedCardEnergy = new Map<number, number>();
    const cardEnergyMeshes = new Map<number, { iconMesh: THREE.Mesh; textMesh: THREE.Mesh }>();

    function loadTexturePromise(src: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(src, (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.magFilter = THREE.LinearFilter;
                tex.minFilter = THREE.LinearFilter;
                tex.generateMipmaps = false;
                resolve(tex);
            }, undefined, reject);
        });
    }

    let energyIconTexture: THREE.Texture | null = null;

    async function attachEnergyToCard(entityId: number): Promise<void> {
        if (availableEnergy <= 0) return;
        const entry = entries.find((e) => e.card.cardId === entityId);
        if (!entry) return;
        if (!placedOrder.includes(entityId)) return;

        availableEnergy--;
        const cardEnergy = (placedCardEnergy.get(entityId) ?? 0) + 1;
        placedCardEnergy.set(entityId, cardEnergy);

        // Update HUD
        energyRenderer.setEnergy(availableEnergy);
        energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
        countRenderer.setCount(cardEnergy);
        countRenderer.update(countFrame, countElement, window.innerWidth, window.innerHeight);

        // Update card visual — add/update energy icon + text
        const group = entry.group;
        const userData = group.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cardW = userData.baseCardWidth ?? 100;
        const cardH = userData.baseCardHeight ?? 160;
        const eSlot = handCardFrame.slots.energy;
        const eX = eSlot.offsetXRatio * cardW;
        const eY = eSlot.offsetYRatio * cardH;

        const existing = cardEnergyMeshes.get(entityId);
        if (existing) {
            // Update text only
            group.remove(existing.textMesh);
            existing.textMesh.geometry.dispose();
            (existing.textMesh.material as THREE.MeshBasicMaterial).dispose();
            const newText = createEnergyCanvasText(cardEnergy, eX, eY, handCardFrame.cardWidthRatio * 0.2 * window.innerWidth);
            group.add(newText);
            cardEnergyMeshes.set(entityId, { iconMesh: existing.iconMesh, textMesh: newText });
        } else {
            // Create icon + text for first time
            if (!energyIconTexture) {
                energyIconTexture = await loadTexturePromise('resource/battle_field_unit/energy/unit_card_energy.png');
            }
            const slotW = eSlot.widthRatio * cardW;
            const slotH = slotW * eSlot.aspect;
            const iconMat = new THREE.MeshBasicMaterial({ map: energyIconTexture, transparent: true, opacity: 1 });
            const iconGeo = new THREE.PlaneGeometry(slotW, slotH);
            const iconMesh = new THREE.Mesh(iconGeo, iconMat);
            iconMesh.position.set(eX, eY, 0);
            iconMesh.renderOrder = 2;
            group.add(iconMesh);

            const textMesh = createEnergyCanvasText(cardEnergy, eX, eY, handCardFrame.cardWidthRatio * 0.2 * window.innerWidth);
            group.add(textMesh);

            cardEnergyMeshes.set(entityId, { iconMesh, textMesh });
        }

        setFieldEnergyNeon(false);
        console.log(`Energy attached to card ${entityId}: ${cardEnergy} total. Available: ${availableEnergy}`);
    }

    function createEnergyCanvasText(value: number, x: number, y: number, baseScale: number): THREE.Mesh {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 96px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geo = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, 0.01);
        mesh.scale.set(baseScale, baseScale, 1);
        mesh.renderOrder = 3;
        return mesh;
    }

    // Intercept card clicks when field energy is active — before bridge
    rendererManager.getDomElement().addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button !== 0 || !fieldEnergyActive) return;
        sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
        const hits = sharedRaycaster.intersectObjects(handGroup.children, true);
        for (const hit of hits) {
            let walkGroup: THREE.Object3D | null = hit.object;
            while (walkGroup && walkGroup.parent !== handGroup) {
                walkGroup = walkGroup.parent;
            }
            if (walkGroup && walkGroup instanceof THREE.Group && walkGroup.visible) {
                const eid = (walkGroup.userData as { entityId?: number }).entityId;
                if (typeof eid === 'number' && placedOrder.includes(eid)) {
                    e.stopImmediatePropagation();
                    attachEnergyToCard(eid);
                    return;
                }
            }
        }
    });

    // Pilot C — click / drag / drop
    const bridge = new HandInteractionBridge(
        rendererManager.getDomElement(),
        camera,
        scene,
        {
            onPickup: (entityId, group) => {
                clearActivePanel();
                group.renderOrder = 100;
                group.position.z = 1;
                neonEffect.detachAll();
                neonEffect.attach(entityId, group);
                interactionState = 'cardSelected';
            },
            onDrop: (entityId, group, worldX, worldY) => {
                group.renderOrder = 0;
                group.position.z = 0;

                const bounds = computeYourFieldAreaBounds(
                    yourFieldAreaFrame,
                    window.innerWidth,
                    window.innerHeight,
                );
                const inside =
                    worldX >= bounds.minX && worldX <= bounds.maxX &&
                    worldY >= bounds.minY && worldY <= bounds.maxY;

                const wasInHand = handOrder.indexOf(entityId) >= 0;

                if (wasInHand && inside) {
                    handOrder.splice(handOrder.indexOf(entityId), 1);
                    placedOrder.push(entityId);
                    neonEffect.detachAll();
                    interactionState = 'idle';
                } else if (wasInHand && !inside) {
                    neonEffect.detachAll();
                    interactionState = 'idle';
                }

                reflowHandAndPlaced();
            },
        },
    );
    bridge.attach();

    // Pilot D-1 — field-energy HUD overlays
    const energyFrame = createDefaultFieldEnergyHudFrame();
    const energyRenderer = new FieldEnergyHudRendererV2(7);
    const energyElement = await energyRenderer.build(energyFrame);
    document.body.appendChild(energyElement);

    const raceFrame = createDefaultFieldEnergyRaceHudFrame(1);
    const raceRenderer = new FieldEnergyRaceHudRendererV2();
    const raceElement = await raceRenderer.build(raceFrame);
    document.body.appendChild(raceElement);

    const countFrame = createDefaultFieldEnergyCountHudFrame();
    const countRenderer = new FieldEnergyCountHudRendererV2(1);
    const countElement = await countRenderer.build(countFrame);
    document.body.appendChild(countElement);

    // Field Energy interaction — hover focus + click green neon on energy/race/count together
    const fieldEnergyElements = [energyElement, raceElement, countElement];
    let fieldEnergyActive = false;

    // Inject CSS keyframes for green neon pulse
    const neonStyle = document.createElement('style');
    neonStyle.textContent = `
        @keyframes greenNeonPulse {
            0%, 100% { box-shadow: 0 0 6px #00ff88, 0 0 12px #00ff88; filter: brightness(1.1); }
            50% { box-shadow: 0 0 14px #00ff88, 0 0 28px #00ff88, 0 0 42px #00ff88; filter: brightness(1.3); }
        }
        @keyframes greenNeonPulseShiftUp {
            0%, 100% { box-shadow: 0 -6px 6px #00ff88, 0 -6px 12px #00ff88; filter: brightness(1.1); }
            50% { box-shadow: 0 -6px 14px #00ff88, 0 -6px 28px #00ff88, 0 -6px 42px #00ff88; filter: brightness(1.3); }
        }
        .field-energy-hover { filter: brightness(1.2); transition: filter 0.15s; }
        .field-energy-neon { animation: greenNeonPulse 1.4s ease-in-out infinite; border-radius: 6px; }
        .field-energy-neon-shift-up { animation: greenNeonPulseShiftUp 1.4s ease-in-out infinite; border-radius: 6px; }
    `;
    document.head.appendChild(neonStyle);

    // Enable pointer events on all 3 elements
    for (const el of fieldEnergyElements) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
    }

    function setFieldEnergyHover(on: boolean): void {
        if (fieldEnergyActive) return;
        for (const el of fieldEnergyElements) {
            if (on) el.classList.add('field-energy-hover');
            else el.classList.remove('field-energy-hover');
        }
    }

    function setFieldEnergyNeon(on: boolean): void {
        fieldEnergyActive = on;
        for (const el of fieldEnergyElements) {
            el.classList.remove('field-energy-hover', 'field-energy-neon', 'field-energy-neon-shift-up');
            if (on) el.classList.add(el === countElement ? 'field-energy-neon-shift-up' : 'field-energy-neon');
        }
    }

    // Hover: any of the 3 elements triggers focus on all 3
    for (const el of fieldEnergyElements) {
        el.addEventListener('mouseenter', () => setFieldEnergyHover(true));
        el.addEventListener('mouseleave', () => setFieldEnergyHover(false));
        el.addEventListener('click', (ev: Event) => {
            ev.stopPropagation();
            setFieldEnergyNeon(!fieldEnergyActive);
        });
    }

    // Pilot E new — guide message / sand timer / turn HUDs
    const guideFrame = createDefaultGuideMessageHudFrame();
    const guideRenderer = new GuideMessageHudRendererV2();
    const guideElement = await guideRenderer.build(guideFrame);
    document.body.appendChild(guideElement);
    guideRenderer.show(guideElement, '카드를 드래그하여 이동하세요!', 3000);

    const timerFrame = createDefaultSandTimerHudFrame();
    const timerRenderer = new SandTimerHudRendererV2();
    const timerElement = await timerRenderer.build(timerFrame);
    document.body.appendChild(timerElement);

    const turnFrame = createDefaultTurnHudFrame();
    const turnRenderer = new TurnHudRendererV2(1);
    const turnElement = await turnRenderer.build(turnFrame);
    document.body.appendChild(turnElement);

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        cameraManager.updateAspect(width, height);
        rendererManager.resize(width, height);

        backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height);
        yourFieldAreaRenderer.resize(yourFieldAreaFrame, yourFieldAreaGroup, width, height);
        opponentFieldAreaRenderer.resize(opponentFieldAreaFrame, opponentFieldAreaGroup, width, height);

        const cardRenderer = handRenderer.getCardRenderer();
        for (const entry of entries) {
            cardRenderer.resize(handCardFrame, entry.group);
        }
        reflowHandAndPlaced();

        // Rescale opponent cards, then reflow alive ones (dead ones stay hidden)
        for (const entry of opponentEntries) {
            handRenderer.getCardRenderer().resize(handCardFrame, entry.group);
        }
        reflowOpponentField();
        handPageButtonsRenderer.resize(handPageButtonsFrame, handPageButtonsGroup, width, height);

        energyRenderer.update(energyFrame, energyElement, width, height);
        raceRenderer.update(raceFrame, raceElement, width, height);
        countRenderer.update(countFrame, countElement, width, height);
        guideRenderer.update(guideFrame, guideElement, width, height);
        timerRenderer.update(timerFrame, timerElement, width, height);
        turnRenderer.update(turnFrame, turnElement, width, height);
    });
}

main(rootElement).catch((error) => {
    console.error('draw_field_energy_full_efr failed to start:', error);
});
