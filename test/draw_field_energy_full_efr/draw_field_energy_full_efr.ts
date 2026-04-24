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

import {
    createAllyNeonBorderFrame,
    createEnemyNeonBorderFrame,
    createAllyTargetingNeonBorderFrame,
} from "../../src/neon_border/frame/NeonBorderFrame";
import { NeonBorderEffect } from "../../src/neon_border/effect/NeonBorderEffect";

import { createDefaultActivePanelFrame, ActivePanelButtonSpec } from "../../src/active_panel_area/frame/ActivePanelFrame";
import { ActivePanelRendererV2 } from "../../src/active_panel_area/renderer/ActivePanelRendererV2";
import { AttackAnimationV2 } from "../../src/general_attack/animation/AttackAnimationV2";
import { ScytheCutEffect } from "../../src/animation/scythe/ScytheCutEffect";
import { EnergyBurnEffect } from "../../src/animation/energy_burn/EnergyBurnEffect";
import { DoomContractEffect } from "../../src/animation/doom_contract/DoomContractEffect";
import { MoraleConvertEffect } from "../../src/animation/morale_convert/MoraleConvertEffect";
import { OverflowMoraleEffect } from "../../src/animation/overflow_morale/OverflowMoraleEffect";
import { SwampEffect } from "../../src/animation/swamp/SwampEffect";

import { YourLostZoneRepositoryImpl } from "../../src/your_lost_zone/repository/YourLostZoneRepositoryImpl";
import {
    createDefaultYourLostZonePanelFrame,
    computeYourLostZonePanelBounds,
} from "../../src/your_lost_zone/frame/YourLostZonePanelFrame";
import {
    createDefaultYourLostZonePopupFrame,
    computeYourLostZonePopupBounds,
} from "../../src/your_lost_zone/frame/YourLostZonePopupFrame";
import { YourLostZonePanelRendererV2 } from "../../src/your_lost_zone/renderer/YourLostZonePanelRendererV2";
import { YourLostZonePopupRendererV2 } from "../../src/your_lost_zone/renderer/YourLostZonePopupRendererV2";

import {
    createDefaultOpponentLostZonePanelFrame,
    computeOpponentLostZonePanelBounds,
} from "../../src/opponent_lost_zone/frame/OpponentLostZonePanelFrame";

import {
    createDefaultYourTombPanelFrame,
    isPointInsideYourTomb,
} from "../../src/your_tomb/frame/YourTombPanelFrame";
import { createDefaultYourTombPopupFrame } from "../../src/your_tomb/frame/YourTombPopupFrame";
import { YourTombPanelRendererV2 } from "../../src/your_tomb/renderer/YourTombPanelRendererV2";
import { YourTombRepositoryImpl } from "../../src/your_tomb/repository/YourTombRepositoryImpl";

import {
    createDefaultOpponentTombPanelFrame,
    isPointInsideOpponentTomb,
} from "../../src/opponent_tomb/frame/OpponentTombPanelFrame";
import { createDefaultOpponentTombPopupFrame } from "../../src/opponent_tomb/frame/OpponentTombPopupFrame";
import { OpponentTombPanelRendererV2 } from "../../src/opponent_tomb/renderer/OpponentTombPanelRendererV2";
import { OpponentTombRepositoryImpl } from "../../src/opponent_tomb/repository/OpponentTombRepositoryImpl";
import { createDefaultOpponentLostZonePopupFrame } from "../../src/opponent_lost_zone/frame/OpponentLostZonePopupFrame";
import { OpponentLostZonePanelRendererV2 } from "../../src/opponent_lost_zone/renderer/OpponentLostZonePanelRendererV2";
import { OpponentLostZoneRepositoryImpl } from "../../src/opponent_lost_zone/repository/OpponentLostZoneRepositoryImpl";
import { OpponentDeckRepositoryImpl } from "../../src/opponent_deck/repository/OpponentDeckRepositoryImpl";

import {
    createDefaultTurnEndButtonFrame,
    isPointInsideTurnEndButton,
} from "../../src/turn_end_button/frame/TurnEndButtonFrame";
import { TurnEndButtonRendererV2 } from "../../src/turn_end_button/renderer/TurnEndButtonRendererV2";
import { TurnStateRepositoryImpl } from "../../src/turn_state/repository/TurnStateRepositoryImpl";

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

    // Dedicated host group for attaching a NEON BORDER to the whole opponent field area
    // (used by 파멸의 계약's pickup highlight). OpponentFieldAreaRendererV2 positions its mesh
    // INSIDE its group (group stays at origin, mesh at xPercent*vw, yPercent*vh), and its
    // userData keys are `baseWidth/baseHeight` while NeonBorderEffect expects
    // `baseCardWidth/baseCardHeight`. A wrapper host placed at the mesh's world position
    // with the right userData keys lets NeonBorderEffect size + anchor its glow correctly.
    const opponentFieldNeonHost = new THREE.Group();
    opponentFieldNeonHost.position.set(
        opponentFieldAreaFrame.xPercent * window.innerWidth,
        opponentFieldAreaFrame.yPercent * window.innerHeight,
        0,
    );
    opponentFieldNeonHost.userData = {
        baseCardWidth:  opponentFieldAreaFrame.widthPercent  * window.innerWidth,
        baseCardHeight: opponentFieldAreaFrame.heightPercent * window.innerHeight,
    };
    scene.add(opponentFieldNeonHost);

    // Mirror wrapper host for YOUR field area — used by 망자의 늪's pickup highlight to
    // attach a green neon border around the whole player field rectangle. Same userData
    // key requirement (baseCardWidth/baseCardHeight) as opponentFieldNeonHost.
    const yourFieldNeonHost = new THREE.Group();
    yourFieldNeonHost.position.set(
        yourFieldAreaFrame.xPercent * window.innerWidth,
        yourFieldAreaFrame.yPercent * window.innerHeight,
        0,
    );
    yourFieldNeonHost.userData = {
        baseCardWidth:  yourFieldAreaFrame.widthPercent  * window.innerWidth,
        baseCardHeight: yourFieldAreaFrame.heightPercent * window.innerHeight,
    };
    scene.add(yourFieldNeonHost);

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
    handMapRepo.addBattleFieldHand(9);   // 에너지 번 (ITEM) — drains up to 2 energy off opponent units
    handMapRepo.addBattleFieldHand(25);  // 파멸의 계약 (ITEM) — 15 AoE dmg + deck-to-lost-zone
    handMapRepo.addBattleFieldHand(35);  // 사기 전환 (ITEM) — sacrifice ally for floor(hp/5) field energy
    handMapRepo.addBattleFieldHand(20);  // 망자의 늪 (SUPPORT) — draw 3 from deck
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

    // ── Your Lost Zone — clickable panel at bottom-left + modal popup of ally cards.
    const lostZoneRepo = YourLostZoneRepositoryImpl.getInstance();
    // Seed with 12 test cards — exactly two full rows at 6 columns. Exercises horizontal
    // spacing (vs. hand layout) AND vertical row spacing / aspect ratio of the popup grid.
    for (const id of [31, 32, 26, 27, 93, 19, 2, 8, 9, 20, 25, 33]) lostZoneRepo.addCard(id);

    const lostZonePanelFrame = createDefaultYourLostZonePanelFrame();
    const lostZonePopupFrame = createDefaultYourLostZonePopupFrame();
    const lostZonePanelRenderer = new YourLostZonePanelRendererV2();
    const lostZonePopupRenderer = new YourLostZonePopupRendererV2();
    const lostZonePanelGroup = await lostZonePanelRenderer.build(lostZonePanelFrame);
    scene.add(lostZonePanelGroup);

    // ── Opponent Lost Zone — mirror of Your Lost Zone, with its own panel, popup, and repo.
    const opponentLostZonePanelFrame = createDefaultOpponentLostZonePanelFrame();
    const opponentLostZonePopupFrame = createDefaultOpponentLostZonePopupFrame();
    const opponentLostZonePanelRenderer = new OpponentLostZonePanelRendererV2();
    // Popup reuses YourLostZonePopupRendererV2 — popup rendering is generic (takes frame +
    // cards), so both lost zones share the same renderer. Keeps card layout identical.
    const opponentLostZonePopupRenderer = new YourLostZonePopupRendererV2();
    const opponentLostZonePanelGroup = await opponentLostZonePanelRenderer.build(opponentLostZonePanelFrame);
    scene.add(opponentLostZonePanelGroup);

    const opponentLostZoneRepo = OpponentLostZoneRepositoryImpl.getInstance();
    // Seed opponent repo with 12 test cards so pagination (2 pages at 10/page) is exercised.
    for (const id of [31, 32, 26, 27, 93, 19, 2, 8, 9, 20, 25, 33]) opponentLostZoneRepo.addCard(id);

    // ── Turn-end button — right-side click zone that hands control to the opponent.
    const turnEndButtonFrame = createDefaultTurnEndButtonFrame();
    const turnEndButtonRenderer = new TurnEndButtonRendererV2();
    const turnEndButtonGroup = await turnEndButtonRenderer.build(turnEndButtonFrame);
    scene.add(turnEndButtonGroup);
    const turnStateRepo = TurnStateRepositoryImpl.getInstance();

    // Hover → show the red blinking neon border around the hex. Cheap per-mousemove
    // point-in-hex test + a uniform flip on the shader material.
    let turnEndButtonHovered = false;
    rendererManager.getDomElement().addEventListener('mousemove', (e: MouseEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const worldX = e.clientX - w / 2;
        const worldY = h / 2 - e.clientY;
        const nowHover = isPointInsideTurnEndButton(worldX, worldY, turnEndButtonFrame, w, h);
        if (nowHover !== turnEndButtonHovered) {
            turnEndButtonHovered = nowHover;
            turnEndButtonRenderer.setHover(turnEndButtonGroup, nowHover);
        }
    });
    // Also clear hover when the cursor leaves the canvas entirely.
    rendererManager.getDomElement().addEventListener('mouseleave', () => {
        if (turnEndButtonHovered) {
            turnEndButtonHovered = false;
            turnEndButtonRenderer.setHover(turnEndButtonGroup, false);
        }
    });

    // ── OPPONENT DECK — PILOT-ONLY DUMMY SEED ──
    // OpponentDeckRepositoryImpl starts empty. In production, a network handler will seed
    // it with the server-provided deck snapshot — the server is the authority on opponent
    // deck contents. Because the dummy seed lives HERE (in the pilot) rather than inside
    // the repository itself, it never leaks into production callers that reuse the repo.
    OpponentDeckRepositoryImpl.getInstance().seed([
        31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8, 9, 93, 151,
    ]);

    let opponentLostZonePopupGroup: THREE.Group | null = null;
    let opponentLostZonePage = 0;
    const opponentLostZoneCardsPerPage =
        opponentLostZonePopupFrame.cardColumns * opponentLostZonePopupFrame.rowsPerPage;

    const buildOpponentLostZonePopupForCurrentPage = async (): Promise<THREE.Group> => {
        const all = [...opponentLostZoneRepo.getCards()];
        const start = opponentLostZonePage * opponentLostZoneCardsPerPage;
        const slice = all.slice(start, start + opponentLostZoneCardsPerPage);
        const resolved = resolveCards(slice, 'opponent-lost-zone');
        return opponentLostZonePopupRenderer.build(opponentLostZonePopupFrame, resolved);
    };

    const openOpponentLostZonePopup = async (): Promise<void> => {
        if (opponentLostZonePopupGroup) return;
        // Modal mutex — close any other centred popup first so they don't stack.
        if (lostZonePopupGroup) closeLostZonePopup();
        if (tombPopupGroup) closeTombPopup();
        if (opponentTombPopupGroup) closeOpponentTombPopup();
        opponentLostZonePopupGroup = await buildOpponentLostZonePopupForCurrentPage();
        scene.add(opponentLostZonePopupGroup);
    };

    const closeOpponentLostZonePopup = (): void => {
        if (!opponentLostZonePopupGroup) return;
        scene.remove(opponentLostZonePopupGroup);
        opponentLostZonePopupRenderer.dispose(opponentLostZonePopupGroup);
        opponentLostZonePopupGroup = null;
        opponentLostZonePage = 0;
    };

    const reloadOpponentLostZonePopup = async (): Promise<void> => {
        if (!opponentLostZonePopupGroup) return;
        scene.remove(opponentLostZonePopupGroup);
        opponentLostZonePopupRenderer.dispose(opponentLostZonePopupGroup);
        opponentLostZonePopupGroup = await buildOpponentLostZonePopupForCurrentPage();
        scene.add(opponentLostZonePopupGroup);
    };

    const opponentLostZoneTotalPages = (): number =>
        Math.max(1, Math.ceil(opponentLostZoneRepo.getCards().length / opponentLostZoneCardsPerPage));

    // ── Your Tomb — gravestone-shaped panel + popup (same as Your Lost Zone). ─────────
    const tombPanelFrame = createDefaultYourTombPanelFrame();
    const tombPopupFrame = createDefaultYourTombPopupFrame();
    const tombPanelRenderer = new YourTombPanelRendererV2();
    // Reuses the generic lost-zone popup renderer — popup rendering is stateless.
    const tombPopupRenderer = new YourLostZonePopupRendererV2();
    const tombPanelGroup = await tombPanelRenderer.build(tombPanelFrame);
    scene.add(tombPanelGroup);

    const tombRepo = YourTombRepositoryImpl.getInstance();
    // Pilot-only dummy seed for testing pagination; production seed will come from network.
    for (const id of [31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8]) tombRepo.addCard(id);

    let tombPopupGroup: THREE.Group | null = null;
    let tombPage = 0;
    const tombCardsPerPage = tombPopupFrame.cardColumns * tombPopupFrame.rowsPerPage;

    const buildTombPopupForCurrentPage = async (): Promise<THREE.Group> => {
        const all = [...tombRepo.getCards()];
        const start = tombPage * tombCardsPerPage;
        const slice = all.slice(start, start + tombCardsPerPage);
        const resolved = resolveCards(slice, 'tomb');
        return tombPopupRenderer.build(tombPopupFrame, resolved);
    };

    const openTombPopup = async (): Promise<void> => {
        if (tombPopupGroup) return;
        // Modal mutex — close every other centred popup first.
        if (lostZonePopupGroup) closeLostZonePopup();
        if (opponentLostZonePopupGroup) closeOpponentLostZonePopup();
        if (opponentTombPopupGroup) closeOpponentTombPopup();
        tombPopupGroup = await buildTombPopupForCurrentPage();
        scene.add(tombPopupGroup);
    };

    const closeTombPopup = (): void => {
        if (!tombPopupGroup) return;
        scene.remove(tombPopupGroup);
        tombPopupRenderer.dispose(tombPopupGroup);
        tombPopupGroup = null;
        tombPage = 0;
    };

    const reloadTombPopup = async (): Promise<void> => {
        if (!tombPopupGroup) return;
        scene.remove(tombPopupGroup);
        tombPopupRenderer.dispose(tombPopupGroup);
        tombPopupGroup = await buildTombPopupForCurrentPage();
        scene.add(tombPopupGroup);
    };

    const tombTotalPages = (): number =>
        Math.max(1, Math.ceil(tombRepo.getCards().length / tombCardsPerPage));

    // ── Opponent Tomb — 180° mirror of Your Tomb. Same popup reuse pattern as opp LZ. ──
    const opponentTombPanelFrame = createDefaultOpponentTombPanelFrame();
    const opponentTombPopupFrame = createDefaultOpponentTombPopupFrame();
    const opponentTombPanelRenderer = new OpponentTombPanelRendererV2();
    const opponentTombPopupRenderer = new YourLostZonePopupRendererV2();
    const opponentTombPanelGroup = await opponentTombPanelRenderer.build(opponentTombPanelFrame);
    scene.add(opponentTombPanelGroup);

    const opponentTombRepo = OpponentTombRepositoryImpl.getInstance();
    // Pilot-only dummy seed for testing pagination (12 cards = 2 pages).
    for (const id of [31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8]) opponentTombRepo.addCard(id);

    let opponentTombPopupGroup: THREE.Group | null = null;
    let opponentTombPage = 0;
    const opponentTombCardsPerPage =
        opponentTombPopupFrame.cardColumns * opponentTombPopupFrame.rowsPerPage;

    const buildOpponentTombPopupForCurrentPage = async (): Promise<THREE.Group> => {
        const all = [...opponentTombRepo.getCards()];
        const start = opponentTombPage * opponentTombCardsPerPage;
        const slice = all.slice(start, start + opponentTombCardsPerPage);
        const resolved = resolveCards(slice, 'opponent-tomb');
        return opponentTombPopupRenderer.build(opponentTombPopupFrame, resolved);
    };

    const openOpponentTombPopup = async (): Promise<void> => {
        if (opponentTombPopupGroup) return;
        // Modal mutex — close every other centred popup first.
        if (lostZonePopupGroup) closeLostZonePopup();
        if (opponentLostZonePopupGroup) closeOpponentLostZonePopup();
        if (tombPopupGroup) closeTombPopup();
        opponentTombPopupGroup = await buildOpponentTombPopupForCurrentPage();
        scene.add(opponentTombPopupGroup);
    };

    const closeOpponentTombPopup = (): void => {
        if (!opponentTombPopupGroup) return;
        scene.remove(opponentTombPopupGroup);
        opponentTombPopupRenderer.dispose(opponentTombPopupGroup);
        opponentTombPopupGroup = null;
        opponentTombPage = 0;
    };

    const reloadOpponentTombPopup = async (): Promise<void> => {
        if (!opponentTombPopupGroup) return;
        scene.remove(opponentTombPopupGroup);
        opponentTombPopupRenderer.dispose(opponentTombPopupGroup);
        opponentTombPopupGroup = await buildOpponentTombPopupForCurrentPage();
        scene.add(opponentTombPopupGroup);
    };

    const opponentTombTotalPages = (): number =>
        Math.max(1, Math.ceil(opponentTombRepo.getCards().length / opponentTombCardsPerPage));

    // Burial helper — whenever an opponent unit dies on the field (HP ≤ 0), look up its
    // cardId by cardIndex and push it into the Opponent Tomb repo. Call at every death
    // site (scythe, energy-burn, doom-contract, AoE skill, single-target attack) right
    // next to the existing opponentAliveOrder.splice(aliveIdx, 1).
    const buryOpponentUnit = (cardIndex: number): void => {
        const card = opponentCards[cardIndex];
        if (!card) return;
        opponentTombRepo.addCard(card.cardId);
        console.log(`[tomb] opponent cardId=${card.cardId} (idx=${cardIndex}) → opponent tomb`);
    };

    // Popup is built on demand when panel is clicked; null when hidden.
    let lostZonePopupGroup: THREE.Group | null = null;
    let lostZonePage = 0;
    const lostZoneCardsPerPage = lostZonePopupFrame.cardColumns * lostZonePopupFrame.rowsPerPage;

    const buildLostZonePopupForCurrentPage = async (): Promise<THREE.Group> => {
        const all = [...lostZoneRepo.getCards()];
        const start = lostZonePage * lostZoneCardsPerPage;
        const slice = all.slice(start, start + lostZoneCardsPerPage);
        const resolved = resolveCards(slice, 'lost-zone');
        return lostZonePopupRenderer.build(lostZonePopupFrame, resolved);
    };

    const openLostZonePopup = async (): Promise<void> => {
        if (lostZonePopupGroup) return;
        // Modal mutex — only one centred popup at a time.
        if (opponentLostZonePopupGroup) closeOpponentLostZonePopup();
        if (tombPopupGroup) closeTombPopup();
        if (opponentTombPopupGroup) closeOpponentTombPopup();
        lostZonePopupGroup = await buildLostZonePopupForCurrentPage();
        scene.add(lostZonePopupGroup);
    };

    const closeLostZonePopup = (): void => {
        if (!lostZonePopupGroup) return;
        scene.remove(lostZonePopupGroup);
        lostZonePopupRenderer.dispose(lostZonePopupGroup);
        lostZonePopupGroup = null;
        // Reset to first page when closing so the next open starts fresh.
        lostZonePage = 0;
    };

    const reloadLostZonePopup = async (): Promise<void> => {
        if (!lostZonePopupGroup) return;
        scene.remove(lostZonePopupGroup);
        lostZonePopupRenderer.dispose(lostZonePopupGroup);
        lostZonePopupGroup = await buildLostZonePopupForCurrentPage();
        scene.add(lostZonePopupGroup);
    };

    const lostZoneTotalPages = (): number =>
        Math.max(1, Math.ceil(lostZoneRepo.getCards().length / lostZoneCardsPerPage));

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
    // Green neon for ally-targeting items (사기 전환): highlights YOUR field units as
    // potential drop targets when the item is picked up.
    const allyTargetNeonEffect = new NeonBorderEffect(createAllyTargetingNeonBorderFrame());

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
    // DoomContract takes extra deps: it uses a render-target + warp shader pipeline, which
    // needs the WebGLRenderer, the active camera, and a hook into AnimationLoop's render
    // path (setRenderOverride) to intercept per-frame rendering during the warp phase.
    const doomContractEffect = new DoomContractEffect(
        scene,
        rendererManager.getRenderer(),
        camera,
        animationLoop,
    );
    const moraleConvertEffect = new MoraleConvertEffect(scene);
    const overflowMoraleEffect = new OverflowMoraleEffect(scene);
    const swampEffect = new SwampEffect(scene);

    animationLoop.setCustomUpdate(() => {
        if (typeof TWEEN !== 'undefined') TWEEN.update();
        neonEffect.updateAnimation();
        enemyNeonEffect.updateAnimation();
        allyTargetNeonEffect.updateAnimation();
        turnEndButtonRenderer.updateAnimation(turnEndButtonGroup, turnEndButtonFrame);
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

    // Lost-Zone click — registered in CAPTURE phase so when a popup is open we can
    // consume the click before hand/opponent/page handlers run. Screen → world coords:
    //   world_x = clientX - width/2     (OrthographicCamera centered at 0, width full-span)
    //   world_y = height/2 - clientY    (y flipped: screen y grows down, world y grows up)
    rendererManager.getDomElement().addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button !== 0) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const worldX = e.clientX - w / 2;
        const worldY = h / 2 - e.clientY;

        // ── 0) Turn-end button (hexagon) ───────────────────────────────────────────
        // Only active while NO popup is open (popup checks below handle their own consume).
        // Only effective while it's YOUR turn — idempotent otherwise. Hit-test is a true
        // point-in-hexagon check, not a bounding rect — clicks just outside the hex corners
        // don't register. On a real transfer, the 60-second hourglass restarts from the top
        // so the new turn owner (the opponent) gets a fresh budget.
        if (!lostZonePopupGroup && !opponentLostZonePopupGroup) {
            if (isPointInsideTurnEndButton(worldX, worldY, turnEndButtonFrame, w, h)) {
                e.stopImmediatePropagation();
                if (turnStateRepo.getOwner() === 'your') {
                    turnStateRepo.setOwner('opponent');
                    timerRenderer.reset(timerElement);
                }
                return;
            }
        }

        // ── 1) Your Lost Zone panel ────────────────────────────────────────────────
        const yourPanelBounds = computeYourLostZonePanelBounds(lostZonePanelFrame, w, h);
        const onYourPanel =
            worldX >= yourPanelBounds.minX && worldX <= yourPanelBounds.maxX &&
            worldY >= yourPanelBounds.minY && worldY <= yourPanelBounds.maxY;
        if (onYourPanel) {
            e.stopImmediatePropagation();
            if (lostZonePopupGroup) closeLostZonePopup();
            else void openLostZonePopup();
            return;
        }

        // ── 2) Opponent Lost Zone panel ────────────────────────────────────────────
        const oppPanelBounds = computeOpponentLostZonePanelBounds(opponentLostZonePanelFrame, w, h);
        const onOppPanel =
            worldX >= oppPanelBounds.minX && worldX <= oppPanelBounds.maxX &&
            worldY >= oppPanelBounds.minY && worldY <= oppPanelBounds.maxY;
        if (onOppPanel) {
            e.stopImmediatePropagation();
            if (opponentLostZonePopupGroup) closeOpponentLostZonePopup();
            else void openOpponentLostZonePopup();
            return;
        }

        // ── 2b) Your Tomb panel (tombstone-shaped) ────────────────────────────────
        if (isPointInsideYourTomb(worldX, worldY, tombPanelFrame, w, h)) {
            e.stopImmediatePropagation();
            if (tombPopupGroup) closeTombPopup();
            else void openTombPopup();
            return;
        }

        // ── 2c) Opponent Tomb panel (inverted tombstone) ──────────────────────────
        if (isPointInsideOpponentTomb(worldX, worldY, opponentTombPanelFrame, w, h)) {
            e.stopImmediatePropagation();
            if (opponentTombPopupGroup) closeOpponentTombPopup();
            else void openOpponentTombPopup();
            return;
        }

        // ── 3) A popup is open → consume the click, check buttons, close on outside ─
        // Only one popup can be open at a time (opens are modal-mutex'd above), so exactly
        // one of these branches runs.
        if (lostZonePopupGroup) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            const hits = sharedRaycaster.intersectObjects(lostZonePopupGroup.children, true);
            for (const hit of hits) {
                const bt = hit.object.userData.buttonType;
                if (bt === 'prev') {
                    if (lostZonePage > 0) { lostZonePage--; void reloadLostZonePopup(); }
                    return;
                }
                if (bt === 'next') {
                    if (lostZonePage < lostZoneTotalPages() - 1) { lostZonePage++; void reloadLostZonePopup(); }
                    return;
                }
            }

            const popupBounds = computeYourLostZonePopupBounds(lostZonePopupFrame, w, h);
            const onPopup =
                worldX >= popupBounds.minX && worldX <= popupBounds.maxX &&
                worldY >= popupBounds.minY && worldY <= popupBounds.maxY;
            if (!onPopup) closeLostZonePopup();
            return;
        }

        if (opponentLostZonePopupGroup) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            const hits = sharedRaycaster.intersectObjects(opponentLostZonePopupGroup.children, true);
            for (const hit of hits) {
                const bt = hit.object.userData.buttonType;
                if (bt === 'prev') {
                    if (opponentLostZonePage > 0) { opponentLostZonePage--; void reloadOpponentLostZonePopup(); }
                    return;
                }
                if (bt === 'next') {
                    if (opponentLostZonePage < opponentLostZoneTotalPages() - 1) {
                        opponentLostZonePage++; void reloadOpponentLostZonePopup();
                    }
                    return;
                }
            }

            // Opponent popup uses the SAME world bounds as Your popup (both centered, same size).
            const popupBounds = computeYourLostZonePopupBounds(opponentLostZonePopupFrame, w, h);
            const onPopup =
                worldX >= popupBounds.minX && worldX <= popupBounds.maxX &&
                worldY >= popupBounds.minY && worldY <= popupBounds.maxY;
            if (!onPopup) closeOpponentLostZonePopup();
            return;
        }

        if (tombPopupGroup) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            const hits = sharedRaycaster.intersectObjects(tombPopupGroup.children, true);
            for (const hit of hits) {
                const bt = hit.object.userData.buttonType;
                if (bt === 'prev') {
                    if (tombPage > 0) { tombPage--; void reloadTombPopup(); }
                    return;
                }
                if (bt === 'next') {
                    if (tombPage < tombTotalPages() - 1) { tombPage++; void reloadTombPopup(); }
                    return;
                }
            }

            // Tomb popup shares the lost-zone popup's world bounds (centred, same size).
            const popupBounds = computeYourLostZonePopupBounds(tombPopupFrame, w, h);
            const onPopup =
                worldX >= popupBounds.minX && worldX <= popupBounds.maxX &&
                worldY >= popupBounds.minY && worldY <= popupBounds.maxY;
            if (!onPopup) closeTombPopup();
            return;
        }

        if (opponentTombPopupGroup) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            const hits = sharedRaycaster.intersectObjects(opponentTombPopupGroup.children, true);
            for (const hit of hits) {
                const bt = hit.object.userData.buttonType;
                if (bt === 'prev') {
                    if (opponentTombPage > 0) { opponentTombPage--; void reloadOpponentTombPopup(); }
                    return;
                }
                if (bt === 'next') {
                    if (opponentTombPage < opponentTombTotalPages() - 1) {
                        opponentTombPage++; void reloadOpponentTombPopup();
                    }
                    return;
                }
            }

            const popupBounds = computeYourLostZonePopupBounds(opponentTombPopupFrame, w, h);
            const onPopup =
                worldX >= popupBounds.minX && worldX <= popupBounds.maxX &&
                worldY >= popupBounds.minY && worldY <= popupBounds.maxY;
            if (!onPopup) closeOpponentTombPopup();
        }
    }, true);

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
                                        buryOpponentUnit(capturedIdx);
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
                            buryOpponentUnit(targetIdx);
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

    // Shared renderer for per-card energy visuals (icon + count text + the global Count HUD).
    // Used by attachEnergyToCard (field-energy → card) AND by the overflow-morale flow
    // (deck-energy → card). Source-of-energy tracking is the CALLER's responsibility.
    async function updateCardEnergyVisual(entry: HandEntry, newCount: number): Promise<void> {
        placedCardEnergy.set(entry, newCount);

        countRenderer.setCount(newCount);
        countRenderer.update(countFrame, countElement, window.innerWidth, window.innerHeight);

        const group = entry.group;
        const userData = group.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cardW = userData.baseCardWidth ?? 100;
        const cardH = userData.baseCardHeight ?? 160;
        const eSlot = handCardFrame.slots.energy;
        const eX = eSlot.offsetXRatio * cardW;
        const eY = eSlot.offsetYRatio * cardH;

        const existing = cardEnergyMeshes.get(entry);
        if (existing) {
            group.remove(existing.textMesh);
            existing.textMesh.geometry.dispose();
            (existing.textMesh.material as THREE.MeshBasicMaterial).dispose();
            const newText = createEnergyCanvasText(newCount, eX, eY, handCardFrame.cardWidthRatio * 0.2 * window.innerWidth);
            group.add(newText);
            cardEnergyMeshes.set(entry, { iconMesh: existing.iconMesh, textMesh: newText });
        } else {
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

            const textMesh = createEnergyCanvasText(newCount, eX, eY, handCardFrame.cardWidthRatio * 0.2 * window.innerWidth);
            group.add(textMesh);

            cardEnergyMeshes.set(entry, { iconMesh, textMesh });
        }
    }

    async function attachEnergyToCard(entry: HandEntry): Promise<void> {
        if (availableEnergy <= 0) return;
        if (!placedOrder.includes(entry)) return;

        availableEnergy--;
        const cardEnergy = (placedCardEnergy.get(entry) ?? 0) + 1;

        energyRenderer.setEnergy(availableEnergy);
        energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
        await updateCardEnergyVisual(entry, cardEnergy);

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

    // 사기 전환 (Morale Conversion, cardId 35) — ITEM that targets YOUR OWN placed units.
    // On drop onto an ally: gain floor(ally_hp / 5) field energy, and the ally goes to the
    // tomb. Picking up the card highlights all placed allies with a green neon border.
    const MORALE_CONVERT_CARD_ID = 35;

    // 넘쳐흐르는 사기 (Overflowing Morale, cardId 2) — SUPPORT that targets YOUR OWN placed units.
    // On drop onto an ally: search the deck for death-energy (cardId 93), remove up to 2 of
    // them, and attach that many energy to the target. Pickup highlights placed allies same
    // as 사기 전환 (green neon); the card is SUPPORT not ITEM but the pickup branch below is
    // cardId-gated, not kind-gated, so the list name is historical.
    const OVERFLOW_MORALE_CARD_ID = 2;
    const DEATH_ENERGY_CARD_ID = 93;
    const OVERFLOW_MORALE_MAX = 2;

    // Death-energy (ENERGY kind) also targets placed allies when picked up — same
    // green-neon highlight + hitAllyAt drop test, just with its own ENERGY branch below.
    const ALLY_TARGETING_ITEM_IDS: readonly number[] = [
        MORALE_CONVERT_CARD_ID,
        OVERFLOW_MORALE_CARD_ID,
        DEATH_ENERGY_CARD_ID,
    ];

    // 망자의 늪 (Swamp of the Dead, cardId 20) — SUPPORT card. Pickup puts a green neon
    // border on the WHOLE YOUR FIELD AREA. Drop onto your field → draw 3 from your deck.
    const SWAMP_OF_DEAD_CARD_ID = 20;
    const SWAMP_DRAW_COUNT = 3;

    // 파멸의 계약 (Contract of Doom, cardId 25) — ITEM that targets the OPPONENT FIELD
    // AS A WHOLE (neon border on the field area rectangle, not individual units). On drop
    // it deals 15 dmg to every alive opponent unit + the opponent master body, and moves
    // 1 card from the player's deck into the lost zone. No visual effect this step.
    const DOOM_CONTRACT_CARD_ID = 25;
    const DOOM_CONTRACT_DAMAGE = 15;
    const FIELD_NEON_ENTITY_ID = -1;  // sentinel — distinct from any card.cardIndex

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
            if (aliveIdx >= 0) {
                buryOpponentUnit(targetIdx);
                opponentAliveOrder.splice(aliveIdx, 1);
            }
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
            if (aliveIdx >= 0) {
                buryOpponentUnit(targetIdx);
                opponentAliveOrder.splice(aliveIdx, 1);
            }
            reflowOpponentField();
        }
    };

    // Used when an ITEM card from Your Hand resolves its effect — the spent card moves
    // into Your Tomb before the mesh is disposed. All current call sites are ITEM drops
    // (scythe, energy burn, doom contract, morale convert), so the burial is unconditional.
    const consumeHandCard = (entry: HandEntry, idx: number): void => {
        tombRepo.addCard(entry.card.cardId);
        console.log(`[tomb] your cardId=${entry.card.cardId} → your tomb (used from hand)`);
        handOrder.splice(idx, 1);
        handGroup.remove(entry.group);
        handRenderer.getCardRenderer().dispose(entry.group);
    };

    // 파멸의 계약:
    //   1) 15 dmg to every alive opponent unit (HP state + death reflow)
    //   2) 15 dmg to the opponent master body
    //   3) Draw 1 card from the OPPONENT's deck → push to the OPPONENT's lost zone.
    //      (Not Your deck. In production this source will be the server-driven opponent
    //      deck snapshot; see OpponentDeckRepositoryImpl's comment.)
    // State mutations are timed to the effect's BOOM phase (~1400ms in) so the numbers
    // change on-screen the same beat the grimoire explodes.
    const applyStateChangesForDoomContract = (): void => {
        console.log(`[doom-contract] AoE ${DOOM_CONTRACT_DAMAGE} dmg to all opponent units + master; opponent deck → opponent lost zone`);

        for (const idx of [...opponentAliveOrder]) {
            const currentHp = opponentHpState.get(idx) ?? 0;
            const newHp = Math.max(0, currentHp - DOOM_CONTRACT_DAMAGE);
            opponentHpState.set(idx, newHp);
            console.log(`  opponent idx=${idx} HP: ${currentHp} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
            if (newHp <= 0) {
                const aliveIdx = opponentAliveOrder.indexOf(idx);
                if (aliveIdx >= 0) {
                    buryOpponentUnit(idx);
                    opponentAliveOrder.splice(aliveIdx, 1);
                }
            }
        }
        reflowOpponentField();

        const masterBefore = opponentMasterHp;
        opponentMasterHp = Math.max(0, opponentMasterHp - DOOM_CONTRACT_DAMAGE);
        console.log(`  opponent master HP: ${masterBefore} → ${opponentMasterHp}`);

        const oppDeck = OpponentDeckRepositoryImpl.getInstance();
        const drawn = oppDeck.drawCard();
        if (drawn != null) {
            OpponentLostZoneRepositoryImpl.getInstance().addCard(drawn);
            console.log(`  opponent deck → opponent lost zone: cardId ${drawn} (opp deck remaining: ${oppDeck.getRemainingCount()})`);
        } else {
            console.log(`  opponent deck empty — nothing to send to lost zone`);
        }
    };

    const applyDoomContractEffect = async (): Promise<void> => {
        // Effect timeline (DoomContractEffect.play phases): emerge 350 + shake 500 + suck
        // 500 + boom 300 + fade 400 ≈ 2050ms. The BOOM begins ~1350ms in — schedule mechanics
        // to land at that moment so units visibly die / deck count drops with the flash.
        const boomMs = 1380;
        const effectPromise = doomContractEffect.play();
        setTimeout(applyStateChangesForDoomContract, boomMs);
        await effectPromise;
    };

    // 망자의 늪 — swamp + wraiths + spectral cards visual. Pre-draws cardIds from the
    // deck, then plays SwampEffect. Each spectral card's arrival at the hand triggers
    // `onCardArrive`, which resolves the real card and appends it to Your Hand. If the
    // deck runs dry at < 3 cards, only that many wraiths/cards spawn.
    // Async, fire-and-forget from onDrop.
    const applySwampEffect = async (): Promise<void> => {
        const drawnIds: number[] = [];
        for (let i = 0; i < SWAMP_DRAW_COUNT; i++) {
            const id = deckRepo.drawCard();
            if (id == null) break;
            drawnIds.push(id);
        }
        if (drawnIds.length === 0) {
            console.log(`[swamp] deck empty — effect skipped`);
            return;
        }
        console.log(`[swamp] drawing ${drawnIds.length}/${SWAMP_DRAW_COUNT}: cardIds=${drawnIds.join(',')}`);

        // Swamp plays over the your-field rectangle.
        const fieldCenter = new THREE.Vector3(
            yourFieldAreaFrame.xPercent * window.innerWidth,
            yourFieldAreaFrame.yPercent * window.innerHeight,
            2,
        );
        const fieldW = yourFieldAreaFrame.widthPercent  * window.innerWidth;
        const fieldH = yourFieldAreaFrame.heightPercent * window.innerHeight;

        // Deck world position — sits LEFT of the Field Energy HUD (HUD centre at
        // screen ~0.940). Screen (0.81, 0.87) puts the deck visibly left of the big
        // energy number, in the bottom-right cluster.
        const deckPos = new THREE.Vector3(
            (0.81 - 0.5) * window.innerWidth,
            (0.5 - 0.87) * window.innerHeight,
            2,
        );

        // Spectral cards fly to the Your Hand area. Use the hand layout's baseline for a
        // reasonable centre destination. The actual cards land wherever appendCard + reflow
        // places them (page overflow handled separately).
        const handDest = new THREE.Vector3(
            0,
            handLayoutFrame.baselineYHeightRatio * window.innerHeight +
                handLayoutFrame.baselineYWidthOffsetRatio * window.innerWidth,
            2,
        );

        await swampEffect.play(
            fieldCenter,
            fieldW,
            fieldH,
            deckPos,
            handDest,
            drawnIds,
            (cardId) => {
                const resolved = resolveCards([cardId], 'swamp-draw');
                if (resolved.length === 0) return;
                // handRenderer.appendCard returns a Promise; we fire-and-forget and let the
                // texture load asynchronously. handOrder push happens once the append resolves.
                void handRenderer.appendCard(handGroup, resolved[0], handCardFrame).then((newEntry) => {
                    handOrder.push(newEntry);
                    reflowHandAndPlaced();
                });
                console.log(`  swamp card landed — cardId=${cardId}`);
            },
        );
    };

    // Hit-test for a placed ally card at world coords — used by 사기 전환 drops.
    const hitAllyAt = (x: number, y: number): HandEntry | null => {
        for (const entry of placedOrder) {
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

    // 사기 전환 — sacrifice a placed ally for field energy, with a death-energy transfer
    // animation: a violet/green aura blooms where the ally was, then N motes (N = energy
    // gain) arc along a bezier toward the Field Energy HUD. Each mote's arrival bumps the
    // displayed energy count by 1 — so the number climbs visibly in sync with the flow.
    //
    // Fire-and-forget from the pilot's perspective (onDrop doesn't await it).
    const applyMoraleConvertEffect = async (target: HandEntry): Promise<void> => {
        const card = getCardById(target.card.cardId);
        const rawHp = card?.체력;
        const hpNum = typeof rawHp === 'number' ? rawHp : parseInt(String(rawHp ?? 0), 10) || 0;
        const energyGain = Math.floor(hpNum / 5);

        // Capture the source world position BEFORE removing the mesh.
        const sourceWorld = new THREE.Vector3(
            target.group.position.x,
            target.group.position.y,
            5,
        );

        // Remove target mesh immediately — the aura will bloom where it was. Target goes
        // to the tomb up front; the energy gain is deferred to mote arrivals.
        tombRepo.addCard(target.card.cardId);
        const placedIdx = placedOrder.indexOf(target);
        if (placedIdx >= 0) {
            placedOrder.splice(placedIdx, 1);
            handGroup.remove(target.group);
            handRenderer.getCardRenderer().dispose(target.group);
        }
        reflowHandAndPlaced();

        console.log(`[morale-convert] target cardId=${target.card.cardId} HP=${hpNum} → +${energyGain} energy pending (via animation); target → tomb`);

        if (energyGain <= 0) return;  // nothing to tick (HP 0-4)

        // Field Energy HUD destination in world coords. The HUD is a DOM element positioned
        // via createDefaultFieldEnergyHudFrame — bottom-right corner, NOT top-right where
        // the sand timer lives:
        //   leftPercent '90.4%', widthPercent '7.2%'  → x-centre ≈ 0.940 of viewport width
        //   topPercent  '82.4%' + (~7.2% height since image is squarish) → y-centre ≈ 0.89
        const destWorld = new THREE.Vector3(
            (0.940 - 0.5) * window.innerWidth,
            (0.5 - 0.89)  * window.innerHeight,
            5,
        );

        // One mote per unit of energy gain. Arrival bumps the counter + updates the HUD.
        await moraleConvertEffect.play(sourceWorld, destWorld, energyGain, () => {
            availableEnergy += 1;
            energyRenderer.setEnergy(availableEnergy);
            energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
        });

        console.log(`[morale-convert] effect complete; total field energy = ${availableEnergy}`);
    };

    // 넘쳐흐르는 사기 — drop on a placed ally to pull up to OVERFLOW_MORALE_MAX copies of
    // death-energy (cardId 93) out of the deck and attach them to that ally. If the deck
    // has fewer than MAX, attach however many were available (0-2). The card itself still
    // gets consumed (moved to tomb) regardless of how many energies were pulled — matches
    // the card's passive text "덱에서 찾아 최대 0~2개를 선택하여 유닛에게 수급".
    const applyOverflowMoraleEffect = async (target: HandEntry): Promise<void> => {
        const pulled = deckRepo.drawMatching(DEATH_ENERGY_CARD_ID, OVERFLOW_MORALE_MAX);
        const attached = pulled.length;
        console.log(`[overflow-morale] target cardId=${target.card.cardId} → pulled ${attached} death-energy from deck (deck remaining=${deckRepo.getRemainingCount()})`);

        // Deck world-position — same convention as SwampEffect (screen 0.81, 0.87),
        // sitting left of the Field Energy HUD.
        const deckPos = new THREE.Vector3(
            (0.81 - 0.5) * window.innerWidth,
            (0.5 - 0.87) * window.innerHeight,
            5,
        );
        // Target is the placed ally the card was dropped on.
        const targetPos = new THREE.Vector3(
            target.group.position.x,
            target.group.position.y,
            5,
        );

        // Each mote's arrival bumps the target's energy count by 1 so the icon + HUD
        // tick in sync with the visible absorption. If attached === 0 the effect still
        // plays the gather aura (deck "searched", nothing found) and fades — no motes.
        await overflowMoraleEffect.play(deckPos, targetPos, attached, () => {
            const newCount = (placedCardEnergy.get(target) ?? 0) + 1;
            void updateCardEnergyVisual(target, newCount);
        });

        // Consumed energy cards go to the tomb after the flow resolves.
        for (const energyId of pulled) tombRepo.addCard(energyId);
    };

    // Pilot C — click / drag / drop
    const bridge = new HandInteractionBridge(
        rendererManager.getDomElement(),
        camera,
        scene,
        {
            // Hand is locked during the opponent's turn — no card can leave Your Hand.
            // Returning false cancels the pickup before any drag starts, so the card
            // doesn't visually "lift" at all.
            canPickup: () => turnStateRepo.getOwner() === 'your',
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

                // 파멸의 계약 → red targeting border on the opponent FIELD AREA AS A WHOLE
                // (not individual units). Uses a dedicated wrapper host with the right
                // userData keys so NeonBorderEffect sizes the glow to the field rectangle.
                if (pickedCardId === DOOM_CONTRACT_CARD_ID) {
                    enemyNeonEffect.attach(FIELD_NEON_ENTITY_ID, opponentFieldNeonHost);
                }

                // Ally-targeting items (사기 전환) → green targeting border on every placed
                // ally unit on YOUR field. placedOrder holds each HandEntry whose group
                // already lives in handGroup at the placed position.
                if (pickedCardId != null && ALLY_TARGETING_ITEM_IDS.includes(pickedCardId)) {
                    for (let i = 0; i < placedOrder.length; i++) {
                        const entry = placedOrder[i];
                        if (entry.group.visible) {
                            // Use the placed index as the neon entityId (distinct from card.cardId,
                            // which may duplicate across placed allies).
                            allyTargetNeonEffect.attach(i, entry.group);
                        }
                    }
                }

                // 망자의 늪 → green targeting border on the WHOLE YOUR FIELD AREA (not
                // individual placed cards). Same wrapper-host trick as doom contract's
                // opponent-field highlight, just on the player side with green neon.
                if (pickedCardId === SWAMP_OF_DEAD_CARD_ID) {
                    allyTargetNeonEffect.attach(FIELD_NEON_ENTITY_ID, yourFieldNeonHost);
                }
            },
            onDrop: (_entityId, group, worldX, worldY) => {
                group.renderOrder = 0;
                group.position.z = 0;

                const droppedEntry = findEntryByGroup(group);
                const handIndex = droppedEntry ? handOrder.indexOf(droppedEntry) : -1;

                // Always clear ALL targeting borders on release (red enemy border for scythe/
                // energy-burn/doom contract, green ally border for 사기 전환).
                enemyNeonEffect.detachAll();
                allyTargetNeonEffect.detachAll();

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
                    const isOpponentTargeting = OPPONENT_TARGETING_ITEM_IDS.includes(cardId);
                    const opponentTarget = isOpponentTargeting ? hitOpponentAt(dropCx, dropCy) : null;
                    if (opponentTarget) {
                        if (cardId === SCYTHE_CARD_ID) {
                            applyScytheEffect(opponentTarget);
                        } else if (cardId === ENERGY_BURN_CARD_ID) {
                            applyEnergyBurnEffect(opponentTarget);
                        }
                        consumeHandCard(droppedEntry, handIndex);
                    } else if (cardId === DOOM_CONTRACT_CARD_ID) {
                        // AoE + deck drain — MUST land on the OPPONENT field area. Dropping
                        // on your own field or somewhere on the hand leaves it unused (snap
                        // back). Bounds inlined from opponentFieldAreaFrame's percent values
                        // (same formula as computeYourFieldAreaBounds).
                        const oHalfW = (opponentFieldAreaFrame.widthPercent  * window.innerWidth)  / 2;
                        const oHalfH = (opponentFieldAreaFrame.heightPercent * window.innerHeight) / 2;
                        const oCX = opponentFieldAreaFrame.xPercent * window.innerWidth;
                        const oCY = opponentFieldAreaFrame.yPercent * window.innerHeight;
                        const insideOppField =
                            dropCx >= oCX - oHalfW && dropCx <= oCX + oHalfW &&
                            dropCy >= oCY - oHalfH && dropCy <= oCY + oHalfH;
                        if (insideOppField) {
                            applyDoomContractEffect();
                            consumeHandCard(droppedEntry, handIndex);
                        }
                    } else if (cardId === MORALE_CONVERT_CARD_ID) {
                        // 사기 전환 — MUST land on a placed ally, else snap back unused.
                        const allyTarget = hitAllyAt(dropCx, dropCy);
                        if (allyTarget) {
                            applyMoraleConvertEffect(allyTarget);
                            consumeHandCard(droppedEntry, handIndex);
                        }
                    }
                    neonEffect.detachAll();
                    selectedAttackerEntry = null;
                    interactionState = 'idle';
                    reflowHandAndPlaced();
                    return;
                }

                // UNIT → YourField placement. SUPPORT (망자의 늪) also requires being dropped
                // onto YOUR field area to activate; other SUPPORT/ENERGY/TRAP fall through to
                // snap back — matches legacy MouseDropHandler's no-op handlers.
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
                } else if (inside && kind === CardKind.SUPPORT && cardId === SWAMP_OF_DEAD_CARD_ID) {
                    // 망자의 늪 — draw 3 and consume (goes to tomb via consumeHandCard).
                    void applySwampEffect();
                    consumeHandCard(droppedEntry, handIndex);
                } else if (kind === CardKind.SUPPORT && cardId === OVERFLOW_MORALE_CARD_ID) {
                    // 넘쳐흐르는 사기 — MUST land on a placed ally, else snap back unused.
                    // Uses the card's visual centre (same convention as the ITEM ally-target
                    // branch above) instead of the cursor for a more natural drop feel.
                    const dropCx = group.position.x;
                    const dropCy = group.position.y;
                    const allyTarget = hitAllyAt(dropCx, dropCy);
                    if (allyTarget) {
                        void applyOverflowMoraleEffect(allyTarget);
                        consumeHandCard(droppedEntry, handIndex);
                    }
                } else if (kind === CardKind.ENERGY && cardId === DEATH_ENERGY_CARD_ID) {
                    // 죽음의 에너지 — drop onto a placed ally to attach 1 energy. The card
                    // itself is consumed (handled by consumeHandCard → tomb). No field
                    // energy is spent; this is a hand-to-unit direct attach.
                    const dropCx = group.position.x;
                    const dropCy = group.position.y;
                    const allyTarget = hitAllyAt(dropCx, dropCy);
                    if (allyTarget) {
                        const newCount = (placedCardEnergy.get(allyTarget) ?? 0) + 1;
                        void updateCardEnergyVisual(allyTarget, newCount);
                        consumeHandCard(droppedEntry, handIndex);
                        console.log(`[death-energy] attached 1 energy → placed cardId=${allyTarget.card.cardId} total=${newCount}`);
                    }
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

    // ── 'f' key: opponent → your turn. Each full opponent→your cycle counts as one turn,
    // so we (a) increment TURN, (b) bump the main FIELD ENERGY by 1, (c) restart the 60 s
    // hourglass, and (d) DRAW one card from your deck into your hand (standard turn-start
    // draw). No-op if it's already your turn (idempotent).
    let currentTurn = 1;  // matches TurnHudRendererV2's initial
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
        if (e.key !== 'f' && e.key !== 'F') return;
        if (turnStateRepo.getOwner() !== 'opponent') {
            console.log(`[turn-state] 'f' ignored — already your turn`);
            return;
        }
        turnStateRepo.setOwner('your');

        currentTurn += 1;
        turnRenderer.setTurn(currentTurn);
        turnRenderer.update(turnFrame, turnElement, window.innerWidth, window.innerHeight);

        // Field Energy total (the big number, 19 → 20 → …), tracked by `availableEnergy`.
        // NOT the small `fieldEnergyChargeCount` above the Race marker — that one is a
        // per-card charge selector driven by prev/next hover zones.
        availableEnergy += 1;
        energyRenderer.setEnergy(availableEnergy);
        energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);

        timerRenderer.reset(timerElement);

        // Turn-start deck draw — mirrors the 'd'-key handler but runs automatically.
        const drawnId = deckRepo.drawCard();
        if (drawnId != null) {
            const resolved = resolveCards([drawnId], 'turn-start-draw');
            if (resolved.length > 0) {
                const newEntry = await handRenderer.appendCard(handGroup, resolved[0], handCardFrame);
                handOrder.push(newEntry);
                reflowHandAndPlaced();
                console.log(`[deck] turn-start drew cardId=${drawnId}. Remaining: ${deckRepo.getRemainingCount()}`);
            }
        } else {
            console.log(`[deck] empty — no turn-start draw`);
        }

        console.log(`[turn-state] opponent → your · TURN ${currentTurn} · field energy ${availableEnergy}`);
    });

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
