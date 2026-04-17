import { CameraManager } from "../../src/core/camera/CameraManager";
import { RendererManager } from "../../src/core/renderer/RendererManager";
import { SceneManager } from "../../src/core/scene/SceneManager";
import { AnimationLoop } from "../../src/core/animation/AnimationLoop";

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

    const scene = sceneManager.createScene('draw-field-energy-full-efr');

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
                if (btnType === 'general') {
                    interactionState = 'attackMode';
                    for (const entry of opponentEntries) {
                        if (entry.group.visible) {
                            enemyNeonEffect.attach(entry.cardIndex, entry.group);
                        }
                    }
                } else if (btnType === 'details') {
                    console.log('Details clicked — not implemented in pilot');
                    clearActivePanel();
                }
                return;
            }
        }

        // Check opponent card click while in attack mode — apply damage, kill only if HP <= 0
        if (interactionState === 'attackMode') {
            const oppHits = sharedRaycaster.intersectObjects(opponentGroup.children, true);
            if (oppHits.length > 0) {
                e.stopImmediatePropagation();
                let targetGroup: THREE.Object3D | null = oppHits[0].object;
                while (targetGroup && targetGroup.parent !== opponentGroup) {
                    targetGroup = targetGroup.parent;
                }
                if (targetGroup && targetGroup instanceof THREE.Group) {
                    const targetEntry = opponentEntries.find((oe) => oe.group === targetGroup);
                    if (targetEntry) {
                        // Resolve attacker's attack power
                        const attackerId = neonEffect.getActiveEntityIds()[0];
                        let attackPower = 0;
                        if (attackerId != null) {
                            const attackerCard = getCardById(attackerId);
                            if (attackerCard) {
                                attackPower = attackerCard.공격력 ?? 0;
                            }
                        }

                        // Apply damage to opponent HP (keyed by cardIndex for uniqueness)
                        const targetIdx = targetEntry.cardIndex;
                        const currentHp = opponentHpState.get(targetIdx) ?? 0;
                        const newHp = currentHp - attackPower;
                        opponentHpState.set(targetIdx, newHp);

                        console.log(`General attack: attacker=${attackerId} (ATK=${attackPower}) → opponent idx=${targetIdx} cardId=${targetEntry.card.cardId} (HP: ${currentHp} → ${newHp})`);

                        if (newHp <= 0) {
                            // Remove from alive list and reflow remaining opponents
                            const aliveIdx = opponentAliveOrder.indexOf(targetIdx);
                            if (aliveIdx >= 0) {
                                opponentAliveOrder.splice(aliveIdx, 1);
                            }
                            reflowOpponentField();
                            console.log(`Opponent idx=${targetIdx} defeated! Remaining: ${opponentAliveOrder.length}`);
                        } else {
                            // Visual damage feedback — brief red flash
                            targetEntry.group.traverse((child) => {
                                if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                                    const mat = child.material as THREE.MeshBasicMaterial;
                                    const origColor = mat.color.clone();
                                    mat.color.set(0xff4444);
                                    setTimeout(() => { mat.color.copy(origColor); }, 200);
                                }
                            });
                            console.log(`Opponent idx=${targetIdx} survived with HP=${newHp}`);
                        }
                    }
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

        const buttonSpecs: ActivePanelButtonSpec[] = [
            activePanelFrame.generalButton,
            activePanelFrame.detailsButton,
        ];

        activePanelGroup = await activePanelRenderer.build(activePanelFrame, clickPos, buttonSpecs);
        scene.add(activePanelGroup);
        interactionState = 'panelVisible';
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
