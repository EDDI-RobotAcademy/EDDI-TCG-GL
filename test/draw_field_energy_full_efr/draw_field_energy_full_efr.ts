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
import { YourDeckRepositoryImpl } from "../../src/your_deck/repository/YourDeckRepositoryImpl";
import { HandCard } from "../../src/battle_field_hand/entity/HandCard";
import { HandEntry } from "../../src/battle_field_hand/renderer/BattleFieldHandRendererV2";
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
import { CardGrade } from "../../src/card/grade";
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
import { AttackAnimationV2 } from "../../src/general_attack/animation/AttackAnimationV2";
import { ScytheCutEffect } from "../../src/animation/scythe/ScytheCutEffect";
import { EnergyBurnEffect } from "../../src/animation/energy_burn/EnergyBurnEffect";

import { createDefaultGuideMessageHudFrame } from "../../src/common/guide_message/frame/GuideMessageHudFrame";

declare const TWEEN: { Tween: any; Easing: any; update: (time?: number) => void };
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

    // Opponent master (본체) — legacy OPPONENT_MASETER area coordinates
    const masterX1 = (0.4605885 - 0.5) * window.innerWidth;
    const masterY1 = (0.5 - 0.1920103) * window.innerHeight;
    const masterX2 = (0.5410156 - 0.5) * window.innerWidth;
    const masterY2 = (0.5 - 0.0476804) * window.innerHeight;
    const masterW = Math.abs(masterX2 - masterX1);
    const masterH = Math.abs(masterY2 - masterY1);
    const masterCX = (masterX1 + masterX2) / 2;
    const masterCY = (masterY1 + masterY2) / 2;

    const masterMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true });
    const masterMesh = new THREE.Mesh(new THREE.PlaneGeometry(masterW, masterH), masterMaterial);
    masterMesh.renderOrder = 1;

    const masterGroup = new THREE.Group();
    masterGroup.position.set(masterCX, masterCY, 0);
    masterGroup.add(masterMesh);
    masterGroup.userData = { baseCardWidth: masterW, baseCardHeight: masterH };
    scene.add(masterGroup);

    let opponentMasterHp = 40;

    // Pilot B — hand row (6장으로 확장해 페이지네이션 검증)
    const placementFrame = createDefaultPlacedCardPlacementFrame();

    const handMapRepo = BattleFieldHandMapRepositoryImpl.getInstance();
    // Initial hand — 6 cards drawn from the 40-card deck spec. Mix of UNIT/SUPPORT/ENERGY/ITEM.
    // Default repo seed already contains (2, 19, 93, 26); add 27 + Energy Burn (9) for testing.
    handMapRepo.addBattleFieldHand(27);
    handMapRepo.addBattleFieldHand(9);  // 에너지 번 (ITEM) — drains up to 2 energy off opponent units
    const handCardIds = handMapRepo.getBattleFieldHandList();
    const hand = resolveCards(handCardIds, 'hand');

    // Draw pile — remaining 35 cards after subtracting 1 of each of (2, 19, 26, 27, 93) from
    // the 40-card deck spec. Array order is draw order (index 0 = next draw).
    const deckRepo = YourDeckRepositoryImpl.getInstance();
    deckRepo.seed([
        8, 8, 8,          // 죽음의 낫 x3 (legendary)
        9, 9,             // 에너지 번 x2 (hero)
        25, 25, 25,       // 파멸의 계약 x3 (hero)
        27,               // 영혼 수확자 벨른 x1 (hero, 2 - 1 in hand)
        151, 151,         // 차갑게 불타는 암흑 에너지 x2 (hero)
        20, 20, 20,       // 망자의 늪 x3 (uncommon)
        2, 2,             // 넘쳐 흐르는 사기 x2 (uncommon, 3 - 1 in hand)
        26, 26,           // 망령 x2 (uncommon, 3 - 1 in hand)
        30,               // 레오닉의 부름 x1 (uncommon)
        31, 31, 31,       // 구울 x3 (normal)
        32, 32, 32,       // 스켈레톤 워리어 x3 (normal)
        33, 33,           // 시체 폭발 x2 (normal)
        35, 35,           // 사기 전환 x2 (normal)
        36, 36,           // 죽음의 대지 x2 (normal)
        93, 93, 93, 93,   // 일반 에너지 x4 (energy, 5 - 1 in hand)
    ]);

    const handCardFrame = createDefaultHandCardFrame();
    const handLayoutFrame = createDefaultBattleFieldHandLayoutFrame();
    const handRenderer = new BattleFieldHandRendererV2();
    const handGroup = await handRenderer.build(hand, handCardFrame, handLayoutFrame);
    scene.add(handGroup);

    const entries = handRenderer.getEntries(handGroup);

    // handOrder/placedOrder track HandEntry references, not cardIds — the 40-card deck contains
    // duplicate cardIds (e.g., 8×3, 93×4), so cardId-keyed lookups would collapse them together.
    const handOrder: HandEntry[] = [...entries];
    const placedOrder: HandEntry[] = [];
    const MAX_PER_PAGE = 4;
    let currentPage = 1;

    const findEntryByGroup = (group: THREE.Object3D): HandEntry | undefined =>
        entries.find((e) => e.group === group);
    const getMaxPage = () => Math.max(1, Math.ceil(handOrder.length / MAX_PER_PAGE));

    const reflowHandAndPlaced = (): void => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const pageStart = (currentPage - 1) * MAX_PER_PAGE;
        const pageEnd = pageStart + MAX_PER_PAGE;

        handOrder.forEach((entry, index) => {
            if (index >= pageStart && index < pageEnd) {
                const pageLocalIndex = index - pageStart;
                const { x, y } = computeHandCardCenter(handLayoutFrame, pageLocalIndex, w, h);
                entry.group.position.set(x, y, 0);
                entry.group.visible = true;
            } else {
                entry.group.visible = false;
            }
        });

        placedOrder.forEach((entry, index) => {
            const { x, y } = computePlacedCardPosition(placementFrame, index, w, h);
            entry.group.position.set(x, y, 0);
            entry.group.visible = true;
        });
    };

    reflowHandAndPlaced();

    // Pilot E new — opponent field units (reuses HandCardRendererV2 via OpponentFieldRendererV2)
    // Add mythic unit (네더 블레이드, cardId 19) to the opponent field for scythe-targeting tests:
    //   scythe vs <MYTHICAL → instant kill; scythe vs MYTHICAL → 30 damage.
    OpponentFieldMapRepositoryImpl.getInstance().addOpponentField(19);
    const opponentCardIds = OpponentFieldMapRepositoryImpl.getInstance().getOpponentFieldList();
    const opponentCards = resolveCards(opponentCardIds, 'opponent');

    // Seed energy on opponent units for energy-burn testing:
    //   index 1 = 스켈레톤 워리어 #1 → 1 energy (partial drain: removes 1, deals 10 dmg)
    //   index 3 = 길 잃은 망령 → 2 energy (full drain: removes 2, no damage)
    //   all others → 0 energy (no drain: deals 20 dmg).
    if (opponentCards[1]) opponentCards[1] = { ...opponentCards[1], energyCount: 1 };
    if (opponentCards[3]) opponentCards[3] = { ...opponentCards[3], energyCount: 2 };
    const opponentLayoutFrame = createDefaultOpponentFieldLayoutFrame();
    const opponentRenderer = new OpponentFieldRendererV2();
    const opponentGroup = await opponentRenderer.build(opponentCards, handCardFrame, opponentLayoutFrame);
    scene.add(opponentGroup);

    // Opponent HP state + alive order for reflow on death
    const opponentHpState = new Map<number, number>();
    const opponentEnergyState = new Map<number, number>();
    const opponentAliveOrder: number[] = [];
    for (let i = 0; i < opponentCards.length; i++) {
        const oc = opponentCards[i];
        const card = getCardById(oc.cardId);
        const hp = card?.체력 ?? 0;
        opponentHpState.set(i, typeof hp === 'number' ? hp : 0);
        opponentEnergyState.set(i, oc.energyCount);
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
    let pendingAttackType: string = 'general';

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
    // Tracks the currently-selected ally card as a concrete entry reference — neonEffect's
    // cardId-keyed getActiveEntityIds() can't disambiguate duplicate cardIds in the hand.
    let selectedAttackerEntry: HandEntry | null = null;

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
        selectedAttackerEntry = null;
        interactionState = 'idle';
    }

    const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
    const attackAnimation = new AttackAnimationV2(scene);
    const scytheCutEffect = new ScytheCutEffect(scene);
    const energyBurnEffect = new EnergyBurnEffect(scene);

    animationLoop.setCustomUpdate(() => {
        if (typeof TWEEN !== 'undefined') TWEEN.update();
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
    rendererManager.getDomElement().addEventListener('mousedown', async (e: MouseEvent) => {
        if (e.button !== 0) return;
        sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);

        // Check active panel button click first
        if (activePanelGroup && interactionState === 'panelVisible') {
            const panelHits = sharedRaycaster.intersectObjects(activePanelGroup.children, false);
            if (panelHits.length > 0) {
                e.stopImmediatePropagation();
                const btnType = panelHits[0].object.userData.buttonType;
                if (btnType === 'general' || btnType.startsWith('skill')) {
                    const attackerId = selectedAttackerEntry?.card.cardId ?? null;
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
                        // AoE — play animation first, then apply damage
                        console.log(`${btnType} (AoE, damage=${damage}) → hitting all opponents`);
                        const atkEntry = selectedAttackerEntry;
                        if (atkEntry) {
                            clearAllSelection();
                            await attackAnimation.playAoESkill(atkEntry.group);
                        }

                        for (const idx of [...opponentAliveOrder]) {
                            const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                            if (!entry) continue;

                            const currentHp = opponentHpState.get(idx) ?? 0;
                            const newHp = currentHp - damage;
                            opponentHpState.set(idx, newHp);

                            // Red flash + shake on all hit targets
                            entry.group.traverse((child) => {
                                if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                                    const mat = child.material as THREE.MeshBasicMaterial;
                                    const origColor = mat.color.clone();
                                    mat.color.set(0xff4444);
                                    setTimeout(() => { mat.color.copy(origColor); }, 200);
                                }
                            });
                            // Hit shake — same intensity as single-target attack
                            const shakeOrigX = entry.group.position.x;
                            const shakeOrigY = entry.group.position.y;
                            const cardWidth = 0.06493506493 * window.innerWidth;
                            let shakeStep = 0;
                            const shakeTotal = 12;
                            const shakeInterval = setInterval(() => {
                                if (shakeStep >= shakeTotal) {
                                    entry.group.position.x = shakeOrigX;
                                    entry.group.position.y = shakeOrigY;
                                    clearInterval(shakeInterval);
                                    return;
                                }
                                const amp = cardWidth * 0.125 * (1 - shakeStep / shakeTotal);
                                entry.group.position.x = shakeOrigX + (Math.random() - 0.5) * amp;
                                entry.group.position.y = shakeOrigY + (Math.random() - 0.5) * amp;
                                shakeStep++;
                            }, 30);

                            if (newHp <= 0) {
                                const capturedIdx = idx;
                                setTimeout(() => {
                                    const aliveIdx = opponentAliveOrder.indexOf(capturedIdx);
                                    if (aliveIdx >= 0) {
                                        opponentAliveOrder.splice(aliveIdx, 1);
                                    }
                                    reflowOpponentField();
                                }, 450);
                            }

                            console.log(`  opponent idx=${idx} HP: ${currentHp} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                        }

                        // EveryField also hits master
                        if (skillType === SkillType.EveryField && opponentMasterHp > 0) {
                            const prevMasterHp = opponentMasterHp;
                            opponentMasterHp -= damage;
                            // 본체 피격 표현 없음 (투명 유지)
                            if (opponentMasterHp <= 0) {
                                opponentMasterHp = 0;
                                setTimeout(() => { masterGroup.visible = false; }, 300);
                            }
                            console.log(`  MASTER HP: ${prevMasterHp} → ${opponentMasterHp}${opponentMasterHp <= 0 ? ' (defeated)' : ''}`);
                        }

                        clearAllSelection();
                    } else {
                        // Single-target — enter attack mode, red neon on opponents + master
                        interactionState = 'attackMode';
                        pendingAttackDamage = damage;
                        pendingAttackType = btnType;
                        for (const entry of opponentEntries) {
                            if (entry.group.visible) {
                                enemyNeonEffect.attach(entry.cardIndex, entry.group);
                            }
                        }
                        if (opponentMasterHp > 0) {
                            enemyNeonEffect.attach(-1, masterGroup);
                        }
                        console.log(`${btnType} (Single, damage=${damage}) — choose opponent target or master`);
                    }
                } else if (btnType === 'details') {
                    console.log('Details clicked — not implemented in pilot');
                    clearActivePanel();
                }
                return;
            }
        }

        // Check master click while in attack mode
        if (interactionState === 'attackMode' && opponentMasterHp > 0) {
            const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
            if (masterHits.length > 0) {
                e.stopImmediatePropagation();
                const atkPower = pendingAttackDamage;
                const attackerEntry = selectedAttackerEntry;

                clearAllSelection();

                if (attackerEntry) {
                    await attackAnimation.playAttack(attackerEntry.group, masterGroup, pendingAttackType);
                }

                const prevHp = opponentMasterHp;
                opponentMasterHp -= atkPower;
                console.log(`Attack on MASTER: ATK=${atkPower} → HP: ${prevHp} → ${opponentMasterHp}`);

                if (opponentMasterHp <= 0) {
                    opponentMasterHp = 0;
                    setTimeout(() => { masterGroup.visible = false; console.log('Opponent MASTER defeated!'); }, 300);
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
                const attackerEntry = selectedAttackerEntry;
                const attackerId = attackerEntry?.card.cardId ?? null;

                clearAllSelection();

                // Play attack animation before applying damage
                if (attackerEntry) {
                    await attackAnimation.playAttack(attackerEntry.group, targetEntry.group, pendingAttackType);
                }

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

        const selectedEntry = selectedAttackerEntry;
        if (!selectedEntry) return;
        const isPlaced = placedOrder.includes(selectedEntry);
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
        const cardSkillPaths = skillImagePaths[String(selectedEntry.card.cardId)] || [];
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
    let availableEnergy = 19;
    // Keyed by HandEntry so duplicate-cardId copies don't share counters/meshes.
    const placedCardEnergy = new Map<HandEntry, number>();
    const cardEnergyMeshes = new Map<HandEntry, { iconMesh: THREE.Mesh; textMesh: THREE.Mesh }>();

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

    async function attachEnergyToCard(entry: HandEntry): Promise<void> {
        if (availableEnergy <= 0) return;
        if (!placedOrder.includes(entry)) return;

        availableEnergy--;
        const cardEnergy = (placedCardEnergy.get(entry) ?? 0) + 1;
        placedCardEnergy.set(entry, cardEnergy);

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

        const existing = cardEnergyMeshes.get(entry);
        if (existing) {
            // Update text only
            group.remove(existing.textMesh);
            existing.textMesh.geometry.dispose();
            (existing.textMesh.material as THREE.MeshBasicMaterial).dispose();
            const newText = createEnergyCanvasText(cardEnergy, eX, eY, handCardFrame.cardWidthRatio * 0.2 * window.innerWidth);
            group.add(newText);
            cardEnergyMeshes.set(entry, { iconMesh: existing.iconMesh, textMesh: newText });
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

            cardEnergyMeshes.set(entry, { iconMesh, textMesh });
        }

        setFieldEnergyNeon(false);
        console.log(`Energy attached to card ${entry.card.cardId}: ${cardEnergy} total. Available: ${availableEnergy}`);
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
                const entry = findEntryByGroup(walkGroup);
                if (entry && placedOrder.includes(entry)) {
                    e.stopImmediatePropagation();
                    attachEnergyToCard(entry);
                    return;
                }
            }
        }
    });

    // Scythe (cardId 8) — consume + effect on opponent card drop.
    // Below MYTHICAL → instant kill; MYTHICAL → 30 damage.
    const SCYTHE_CARD_ID = 8;
    const SCYTHE_MYTHIC_DAMAGE = 30;

    // Energy Burn (cardId 9) — ITEM that targets opponent units like scythe.
    //   0 energy on target → 20 damage (10 × 2)
    //   1 energy on target → 10 damage (10 × 1) + drain 1 energy
    //  ≥2 energy on target → 0 damage          + drain 2 energy
    const ENERGY_BURN_CARD_ID = 9;
    const ENERGY_BURN_PER_MISSING_DAMAGE = 10;

    // Card IDs that target opponent units when picked up (red neon on all visible opponents).
    const OPPONENT_TARGETING_ITEM_IDS: readonly number[] = [SCYTHE_CARD_ID, ENERGY_BURN_CARD_ID];

    type OpponentEntry = typeof opponentEntries[number];

    const hitOpponentAt = (x: number, y: number): OpponentEntry | null => {
        for (const entry of opponentEntries) {
            if (!entry.group.visible) continue;
            const ud = entry.group.userData as { baseCardWidth?: number; baseCardHeight?: number };
            const bw = (ud.baseCardWidth ?? 0) * (entry.group.scale.x || 1);
            const bh = (ud.baseCardHeight ?? 0) * (entry.group.scale.y || 1);
            const cx = entry.group.position.x;
            const cy = entry.group.position.y;
            if (x >= cx - bw / 2 && x <= cx + bw / 2 && y >= cy - bh / 2 && y <= cy + bh / 2) {
                return entry;
            }
        }
        return null;
    };

    const applyScytheEffect = async (target: OpponentEntry): Promise<void> => {
        const targetCard = getCardById(target.card.cardId);
        const grade = targetCard ? parseInt(targetCard.등급, 10) : 0;
        const isMythic = grade === CardGrade.MYTHICAL;

        const targetIdx = target.cardIndex;
        const currentHp = opponentHpState.get(targetIdx) ?? 0;
        const damage = isMythic ? SCYTHE_MYTHIC_DAMAGE : currentHp;
        const newHp = Math.max(0, currentHp - damage);
        opponentHpState.set(targetIdx, newHp);
        const killing = newHp <= 0;

        console.log(`[scythe] target cardId=${target.card.cardId} grade=${grade}${isMythic ? ' (MYTHICAL → 30 dmg)' : ' (instant kill)'} HP: ${currentHp} → ${newHp}`);

        // Play the cut animation. For killing hits it hides the target and plays the split
        // halves; for mythic-survives it plays a dark flash without splitting.
        await scytheCutEffect.play(target.group, target.card.cardId, killing);

        if (killing) {
            const aliveIdx = opponentAliveOrder.indexOf(targetIdx);
            if (aliveIdx >= 0) opponentAliveOrder.splice(aliveIdx, 1);
            reflowOpponentField();
            console.log(`[scythe] opponent idx=${targetIdx} defeated. Remaining: ${opponentAliveOrder.length}`);
        }
    };

    // Flash-and-shake feedback shared by energy-burn damage and (future) other item hits.
    // Mirrors the AoE-skill damage block above but kept self-contained here.
    const flashAndShakeTarget = (group: THREE.Group): void => {
        group.traverse((child) => {
            if (!(child instanceof THREE.Mesh) || !child.material) return;
            if (child.userData.__neonBorderLine) return;
            if (child.userData.__energyBurnSurfaceFlame) return;
            // ShaderMaterial (e.g., burn/flame overlays) has no `.color` — skip silently.
            const mat = child.material as THREE.MeshBasicMaterial;
            if (!mat.color) return;
            const origColor = mat.color.clone();
            mat.color.set(0xff4444);
            setTimeout(() => { mat.color.copy(origColor); }, 200);
        });
        const shakeOrigX = group.position.x;
        const shakeOrigY = group.position.y;
        const cardWidth = 0.06493506493 * window.innerWidth;
        let shakeStep = 0;
        const shakeTotal = 12;
        const shakeInterval = setInterval(() => {
            if (shakeStep >= shakeTotal) {
                group.position.x = shakeOrigX;
                group.position.y = shakeOrigY;
                clearInterval(shakeInterval);
                return;
            }
            const amp = cardWidth * 0.125 * (1 - shakeStep / shakeTotal);
            group.position.x = shakeOrigX + (Math.random() - 0.5) * amp;
            group.position.y = shakeOrigY + (Math.random() - 0.5) * amp;
            shakeStep++;
        }, 30);
    };

    const applyEnergyBurnEffect = async (target: OpponentEntry): Promise<void> => {
        const targetIdx = target.cardIndex;
        const currentEnergy = opponentEnergyState.get(targetIdx) ?? 0;
        const energyDrained = Math.min(2, currentEnergy);
        const damageMultiplier = 2 - energyDrained;  // 0 e → 2, 1 e → 1, ≥2 e → 0
        const damage = damageMultiplier * ENERGY_BURN_PER_MISSING_DAMAGE;

        const newEnergy = currentEnergy - energyDrained;
        opponentEnergyState.set(targetIdx, newEnergy);

        let newHp = 0;
        let killing = false;
        if (damage > 0) {
            const currentHp = opponentHpState.get(targetIdx) ?? 0;
            newHp = Math.max(0, currentHp - damage);
            opponentHpState.set(targetIdx, newHp);
            killing = newHp <= 0;
            console.log(`[energy-burn] target cardId=${target.card.cardId} energy: ${currentEnergy} → ${newEnergy} (drained ${energyDrained}) damage=${damage} HP → ${newHp}${killing ? ' (defeated — card burns away)' : ''}`);
        } else {
            console.log(`[energy-burn] target cardId=${target.card.cardId} energy: ${currentEnergy} → ${newEnergy} (drained ${energyDrained}) no damage`);
        }

        // Play the effect (passes killing so the card dissolves inside the flame) + damage
        // feedback in parallel. The icon refreshes ~1s in AFTER motes visually consume, but
        // ONLY on survive — a killing hit dissolves the whole card, so updating its energy
        // icon mid-burn is wasted (and would flash the text back on while the card fades).
        await Promise.all([
            energyBurnEffect.play(target.group, energyDrained, killing),
            (async () => {
                if (damage > 0) {
                    await new Promise((r) => setTimeout(r, 500));
                    flashAndShakeTarget(target.group);
                }
            })(),
            (async () => {
                if (killing) return;
                if (energyDrained <= 0) return;  // no drain → icons unchanged
                // Let the mote-burn shader visuals get well underway before the icons on the
                // card start to burn — ties the on-card drain visually to the mote burning.
                await new Promise((r) => setTimeout(r, 600));
                await energyBurnEffect.playEnergyIconBurnAway(target.group);
                // After burn, redraw with the new (reduced) count — shows any remaining energy.
                opponentRenderer.getCardRenderer().updateEnergyCount(target.group, newEnergy, handCardFrame);
            })(),
        ]);

        if (killing) {
            const aliveIdx = opponentAliveOrder.indexOf(targetIdx);
            if (aliveIdx >= 0) opponentAliveOrder.splice(aliveIdx, 1);
            reflowOpponentField();
        }
    };

    const consumeHandCard = (entry: HandEntry, idx: number): void => {
        handOrder.splice(idx, 1);
        handGroup.remove(entry.group);
        handRenderer.getCardRenderer().dispose(entry.group);
    };

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
                selectedAttackerEntry = findEntryByGroup(group) ?? null;
                interactionState = 'cardSelected';

                // Opponent-targeting items (scythe, energy-burn) → red targeting border on all
                // visible opponent units (no master).
                const pickedCardId = selectedAttackerEntry?.card.cardId;
                if (pickedCardId != null && OPPONENT_TARGETING_ITEM_IDS.includes(pickedCardId)) {
                    for (const oe of opponentEntries) {
                        if (oe.group.visible) {
                            enemyNeonEffect.attach(oe.cardIndex, oe.group);
                        }
                    }
                }
            },
            onDrop: (_entityId, group, worldX, worldY) => {
                group.renderOrder = 0;
                group.position.z = 0;

                const droppedEntry = findEntryByGroup(group);
                const handIndex = droppedEntry ? handOrder.indexOf(droppedEntry) : -1;

                // Always clear the scythe's targeting border on release.
                enemyNeonEffect.detachAll();

                if (!droppedEntry || handIndex < 0) {
                    reflowHandAndPlaced();
                    return;
                }

                const kind = droppedEntry.card.cardKind;
                const cardId = droppedEntry.card.cardId;

                // ITEM: scythe / energy-burn consume + hit opponent. Drop-location uses the
                // card's visual center (group.position) rather than the cursor — feels more natural.
                if (kind === CardKind.ITEM) {
                    const dropCx = group.position.x;
                    const dropCy = group.position.y;
                    const isTargeting = OPPONENT_TARGETING_ITEM_IDS.includes(cardId);
                    const target = isTargeting ? hitOpponentAt(dropCx, dropCy) : null;
                    if (target) {
                        if (cardId === SCYTHE_CARD_ID) {
                            applyScytheEffect(target);
                        } else if (cardId === ENERGY_BURN_CARD_ID) {
                            applyEnergyBurnEffect(target);
                        }
                        consumeHandCard(droppedEntry, handIndex);
                    }
                    neonEffect.detachAll();
                    selectedAttackerEntry = null;
                    interactionState = 'idle';
                    reflowHandAndPlaced();
                    return;
                }

                // UNIT → YourField placement. Non-UNIT non-ITEM (support/energy/trap/etc.) falls
                // through to snap back — matches legacy MouseDropHandler's no-op handlers.
                const bounds = computeYourFieldAreaBounds(
                    yourFieldAreaFrame,
                    window.innerWidth,
                    window.innerHeight,
                );
                const inside =
                    worldX >= bounds.minX && worldX <= bounds.maxX &&
                    worldY >= bounds.minY && worldY <= bounds.maxY;
                const isUnit = kind === CardKind.UNIT;

                if (inside && isUnit) {
                    handOrder.splice(handIndex, 1);
                    placedOrder.push(droppedEntry);
                }
                neonEffect.detachAll();
                selectedAttackerEntry = null;
                interactionState = 'idle';
                reflowHandAndPlaced();
            },
        },
    );
    bridge.attach();

    // 'd' key — draw 1 card from the deck and append it to the hand. No deck visual.
    // New cards land at the end of handOrder; pagination reflow hides overflow on other pages.
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
        if (e.key !== 'd' && e.key !== 'D') return;
        const drawnId = deckRepo.drawCard();
        if (drawnId == null) {
            console.log('[deck] empty — nothing to draw');
            return;
        }
        const resolved = resolveCards([drawnId], 'draw');
        if (resolved.length === 0) return;
        const newCard = resolved[0];
        const newEntry = await handRenderer.appendCard(handGroup, newCard, handCardFrame);
        handOrder.push(newEntry);
        reflowHandAndPlaced();
        console.log(`[deck] drew cardId=${drawnId}. Remaining: ${deckRepo.getRemainingCount()}`);
    });

    // Pilot D-1 — field-energy HUD overlays
    const energyFrame = createDefaultFieldEnergyHudFrame();
    const energyRenderer = new FieldEnergyHudRendererV2(19);
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

    let fieldEnergyChargeCount = 1;
    let currentRaceId = 1;
    const MAX_RACE_ID = 3;

    // Invisible click zones for count prev/next + race prev/next.
    // Coordinates from legacy MouseCursorDetectAreaMap (screen viewport percentages).
    function createClickZone(
        x1Pct: number, y1Pct: number, x2Pct: number, y2Pct: number,
        arrow: '◁' | '▷',
        onClick: () => void,
    ): HTMLElement {
        const zone = document.createElement('div');
        zone.style.position = 'fixed';
        zone.style.left = `${x1Pct * 100}%`;
        zone.style.top = `${y1Pct * 100}%`;
        zone.style.width = `${(x2Pct - x1Pct) * 100}%`;
        zone.style.height = `${(y2Pct - y1Pct) * 100}%`;
        zone.style.zIndex = '1001';
        zone.style.pointerEvents = 'auto';
        zone.style.cursor = 'pointer';
        zone.style.display = 'flex';
        zone.style.alignItems = 'center';
        zone.style.justifyContent = 'center';
        zone.style.color = '#00ff88';
        zone.style.fontSize = `${(y2Pct - y1Pct) * 122}vh`;
        zone.style.lineHeight = '1';
        zone.style.userSelect = 'none';
        zone.style.paddingTop = '0.3vh';
        zone.classList.add('field-energy-arrow');
        zone.innerText = arrow;
        zone.addEventListener('click', (ev) => {
            ev.stopPropagation();
            onClick();
        });
        return zone;
    }

    // Count prev/next (legacy: FIELD_ENERGY_PREV / FIELD_ENERGY_NEXT)
    const countPrevZone = createClickZone(0.88203, 0.62863, 0.90530, 0.68030, '◁', () => {
        if (fieldEnergyChargeCount > 0) {
            fieldEnergyChargeCount--;
            countRenderer.setCount(fieldEnergyChargeCount);
            countRenderer.update(countFrame, countElement, window.innerWidth, window.innerHeight);
        }
    });
    const countNextZone = createClickZone(0.97348, 0.62863, 0.995, 0.68030, '▷', () => {
        if (fieldEnergyChargeCount < availableEnergy) {
            fieldEnergyChargeCount++;
            countRenderer.setCount(fieldEnergyChargeCount);
            countRenderer.update(countFrame, countElement, window.innerWidth, window.innerHeight);
        }
    });
    document.body.appendChild(countPrevZone);
    document.body.appendChild(countNextZone);

    // Race prev/next — same width/height as Count zones, centered on Race icon (top=72.1%)
    // Count zone size: w=0.02327, h=0.05167. Race center Y=0.721, half h=0.02584
    const raceZoneH = 0.68030 - 0.62863;  // same height as count zones
    const raceCenterY = 0.721;
    const raceY1 = raceCenterY - raceZoneH / 2 + raceZoneH / 2 + 0.005;
    const raceY2 = raceCenterY + raceZoneH / 2 + raceZoneH / 2 + 0.005;
    const racePrevZone = createClickZone(0.88203, raceY1, 0.90530, raceY2, '◁', () => {
        currentRaceId = ((currentRaceId - 2 + MAX_RACE_ID) % MAX_RACE_ID) + 1;
        const newRaceFrame = createDefaultFieldEnergyRaceHudFrame(currentRaceId);
        raceRenderer.update(newRaceFrame, raceElement, window.innerWidth, window.innerHeight);
    });
    const raceNextZone = createClickZone(0.97348, raceY1, 0.995, raceY2, '▷', () => {
        currentRaceId = (currentRaceId % MAX_RACE_ID) + 1;
        const newRaceFrame = createDefaultFieldEnergyRaceHudFrame(currentRaceId);
        raceRenderer.update(newRaceFrame, raceElement, window.innerWidth, window.innerHeight);
    });
    document.body.appendChild(racePrevZone);
    document.body.appendChild(raceNextZone);

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
        @keyframes arrowNeonPulse {
            0%, 100% { text-shadow: 0 0 4px #00ff88, 0 0 8px #00ff88; opacity: 0.6; }
            50% { text-shadow: 0 0 8px #00ff88, 0 0 16px #00ff88, 0 0 24px #00ff88; opacity: 1; }
        }
        .field-energy-hover { filter: brightness(1.2); transition: filter 0.15s; }
        .field-energy-neon { animation: greenNeonPulse 1.4s ease-in-out infinite; border-radius: 6px; }
        .field-energy-neon-shift-up { animation: greenNeonPulseShiftUp 1.4s ease-in-out infinite; border-radius: 6px; }
        .field-energy-arrow { opacity: 0; pointer-events: none; transition: opacity 0.15s; }
        .field-energy-arrow-active { opacity: 1; pointer-events: auto; animation: arrowNeonPulse 1.4s ease-in-out infinite; }
    `;
    document.head.appendChild(neonStyle);

    // Enable pointer events on all 3 for hover, but only energyElement for neon toggle click.
    // Race/count don't get click handlers — their clicks are handled by the invisible zones.
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

    const arrowZones = [countPrevZone, countNextZone, racePrevZone, raceNextZone];

    function setFieldEnergyNeon(on: boolean): void {
        fieldEnergyActive = on;
        for (const el of fieldEnergyElements) {
            el.classList.remove('field-energy-hover', 'field-energy-neon', 'field-energy-neon-shift-up');
            if (on) el.classList.add(el === countElement ? 'field-energy-neon-shift-up' : 'field-energy-neon');
        }
        for (const arrow of arrowZones) {
            if (on) {
                arrow.classList.add('field-energy-arrow-active');
            } else {
                arrow.classList.remove('field-energy-arrow-active');
            }
        }
    }

    // Hover on any of the 3 → all 3 light up
    for (const el of fieldEnergyElements) {
        el.addEventListener('mouseenter', () => setFieldEnergyHover(true));
        el.addEventListener('mouseleave', () => setFieldEnergyHover(false));
    }

    // Neon toggle ONLY on energyElement — race/count are handled by invisible zones
    energyElement.addEventListener('click', (ev: Event) => {
        ev.stopPropagation();
        setFieldEnergyNeon(!fieldEnergyActive);
    });

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
