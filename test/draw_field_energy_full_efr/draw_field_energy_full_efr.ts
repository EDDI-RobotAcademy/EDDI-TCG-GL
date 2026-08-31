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
import { YourDeckRepositoryImpl } from "../../src/battle/zone/your_deck/repository/YourDeckRepositoryImpl";
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
import { CardRace } from "../../src/card/race";
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

import { createDefaultActivePanelFrame, ActivePanelButtonSpec } from "../../src/battle/active_panel/frame/ActivePanelFrame";
import { ActivePanelRendererV2 } from "../../src/battle/active_panel/renderer/ActivePanelRendererV2";
import { AttackAnimationV2 } from "../../src/general_attack/animation/AttackAnimationV2";
import { FrozenBurningOverlayEffect } from "../../src/animation/cold_dark_energy/FrozenBurningOverlayEffect";
import { ColdDarkTraitMarkEffect } from "../../src/animation/cold_dark_energy/ColdDarkTraitMarkEffect";
import { ScytheCutEffect } from "../../src/animation/scythe/ScytheCutEffect";
import { EnergyBurnEffect } from "../../src/animation/energy_burn/EnergyBurnEffect";
import { DoomContractEffect } from "../../src/animation/doom_contract/DoomContractEffect";
import { CorpseExplosionEffect } from "../../src/animation/corpse_explosion/CorpseExplosionEffect";
import { DeadLandsEffect } from "../../src/animation/dead_lands/DeadLandsEffect";
import { LeonikSummonEffect } from "../../src/animation/leonik_summon/LeonikSummonEffect";
import { NetherBladeEntranceEffect } from "../../src/animation/nether_blade_entrance/NetherBladeEntranceEffect";
import { NetherBladeFirstPassiveEffect } from "../../src/animation/nether_blade/NetherBladeFirstPassiveEffect";
import { NetherBladeSecondPassiveEffect } from "../../src/animation/nether_blade/NetherBladeSecondPassiveEffect";
import { MoraleConvertEffect } from "../../src/animation/morale_convert/MoraleConvertEffect";
import { OverflowMoraleEffect } from "../../src/animation/overflow_morale/OverflowMoraleEffect";
import { SwampEffect } from "../../src/animation/swamp/SwampEffect";

import { YourLostZoneRepositoryImpl } from "../../src/battle/zone/your_lost_zone/repository/YourLostZoneRepositoryImpl";
import {
    createDefaultYourLostZonePanelFrame,
    computeYourLostZonePanelBounds,
} from "../../src/battle/zone/your_lost_zone/frame/YourLostZonePanelFrame";
import {
    createDefaultYourLostZonePopupFrame,
} from "../../src/battle/zone/your_lost_zone/frame/YourLostZonePopupFrame";
import { computeCardGridPopupBounds } from "../../src/battle/card_grid_popup/frame/CardGridPopupFrame";
import { YourLostZonePanelRendererV2 } from "../../src/battle/zone/your_lost_zone/renderer/YourLostZonePanelRendererV2";
import { CardGridPopupRenderer } from "../../src/battle/card_grid_popup/renderer/CardGridPopupRenderer";

import {
    createDefaultOpponentLostZonePanelFrame,
    computeOpponentLostZonePanelBounds,
} from "../../src/battle/zone/opponent_lost_zone/frame/OpponentLostZonePanelFrame";

import {
    createDefaultYourTombPanelFrame,
    isPointInsideYourTomb,
} from "../../src/battle/zone/your_tomb/frame/YourTombPanelFrame";
import { createDefaultYourTombPopupFrame } from "../../src/battle/zone/your_tomb/frame/YourTombPopupFrame";
import { YourTombPanelRendererV2 } from "../../src/battle/zone/your_tomb/renderer/YourTombPanelRendererV2";
import { YourTombRepositoryImpl } from "../../src/battle/zone/your_tomb/repository/YourTombRepositoryImpl";

import {
    createDefaultOpponentTombPanelFrame,
    isPointInsideOpponentTomb,
} from "../../src/battle/zone/opponent_tomb/frame/OpponentTombPanelFrame";
import { createDefaultOpponentTombPopupFrame } from "../../src/battle/zone/opponent_tomb/frame/OpponentTombPopupFrame";
import { OpponentTombPanelRendererV2 } from "../../src/battle/zone/opponent_tomb/renderer/OpponentTombPanelRendererV2";
import {
    computeOpponentFieldEnergyBounds,
    createDefaultOpponentFieldEnergyAreaFrame,
} from "../../src/opponent_field_energy/frame/OpponentFieldEnergyAreaFrame";
import { OpponentFieldEnergyAreaRendererV2 } from "../../src/opponent_field_energy/renderer/OpponentFieldEnergyAreaRendererV2";
import { OpponentTombRepositoryImpl } from "../../src/battle/zone/opponent_tomb/repository/OpponentTombRepositoryImpl";
import { createDefaultOpponentLostZonePopupFrame } from "../../src/battle/zone/opponent_lost_zone/frame/OpponentLostZonePopupFrame";
import { OpponentLostZonePanelRendererV2 } from "../../src/battle/zone/opponent_lost_zone/renderer/OpponentLostZonePanelRendererV2";
import { OpponentLostZoneRepositoryImpl } from "../../src/battle/zone/opponent_lost_zone/repository/OpponentLostZoneRepositoryImpl";
import { OpponentDeckRepositoryImpl } from "../../src/battle/zone/opponent_deck/repository/OpponentDeckRepositoryImpl";

import {
    createDefaultTurnEndButtonFrame,
    isPointInsideTurnEndButton,
} from "../../src/turn_end_button/frame/TurnEndButtonFrame";
import { TurnEndButtonRendererV2 } from "../../src/turn_end_button/renderer/TurnEndButtonRendererV2";
import { TurnStateRepositoryImpl } from "../../src/turn_state/repository/TurnStateRepositoryImpl";
import {
    createDefaultMasterHpFrame,
    createOpponentMasterHpFrame,
} from "../../src/master_hp/frame/MasterHpFrame";
import { MasterHpRendererV2 } from "../../src/master_hp/renderer/MasterHpRendererV2";

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

    // 상대 본체 HP. 내 본체와 대칭이 되도록 100에서 시작한다.
    let opponentMasterHp = 100;

    const opponentMasterHpFrame = createOpponentMasterHpFrame();
    const opponentMasterHpRenderer = new MasterHpRendererV2();
    const opponentMasterHpGroup = await opponentMasterHpRenderer.build(opponentMasterHpFrame);
    scene.add(opponentMasterHpGroup);

    // 상대 본체 HP를 바꾸는 **유일한** 지점. 여러 카드 효과가 제각기 값을 건드리면
    // 표기 갱신을 빠뜨리기 쉬우므로 여기로 모은다. 반환값은 갱신 후 HP.
    function setOpponentMasterHp(next: number, reason: string): number {
        const clamped = Math.max(0, next);
        if (clamped !== opponentMasterHp) {
            const prev = opponentMasterHp;
            opponentMasterHp = clamped;
            void opponentMasterHpRenderer.setHp(
                opponentMasterHpGroup, opponentMasterHpFrame, clamped,
            );
            console.log(`[opponent-master-hp] ${reason} → ${prev} → ${clamped}${clamped <= 0 ? ' (defeated)' : ''}`);
        }
        return opponentMasterHp;
    }

    // ── 메인 캐릭터(본체) HP ──────────────────────────────────────────────────
    // 수치는 hp/{n}.png 이미지에 새겨져 있고, 렌더러가 HP가 바뀔 때마다 텍스처를
    // 갈아 끼운다. 100에서 시작한다.
    const masterHpFrame = createDefaultMasterHpFrame();
    const masterHpRenderer = new MasterHpRendererV2();
    const masterHpGroup = await masterHpRenderer.build(masterHpFrame);
    scene.add(masterHpGroup);
    let yourMasterHp = masterHpFrame.maxHp;

    // 메인 캐릭터가 피해를 입는 유일한 지점. 표기 갱신까지 여기서 함께 한다.
    function damageYourMaster(amount: number, reason: string): void {
        if (amount <= 0 || yourMasterHp <= 0) return;
        const prev = yourMasterHp;
        yourMasterHp = Math.max(0, prev - amount);
        void masterHpRenderer.setHp(masterHpGroup, masterHpFrame, yourMasterHp);
        console.log(`[master-hp] ${reason} → ${prev} → ${yourMasterHp}${yourMasterHp <= 0 ? ' (defeated)' : ''}`);
    }

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
    handMapRepo.addBattleFieldHand(36);  // 죽음의 대지 (ITEM) — drain 2 opponent field energy
    handMapRepo.addBattleFieldHand(30);  // 레오닉의 부름 (SUPPORT) — pick 2 hero-or-below UNITs from deck
    handMapRepo.addBattleFieldHand(33);  // 시체 폭발 (ITEM) — sacrifice undead ally → 2x10 dmg to enemies
    const handCardIds = handMapRepo.getBattleFieldHandList();
    const hand = resolveCards(handCardIds, 'hand');

    // Draw pile — remaining 35 cards after subtracting 1 of each of (2, 19, 26, 27, 93) from
    // the 40-card deck spec. Array order is draw order (index 0 = next draw).
    const deckRepo = YourDeckRepositoryImpl.getInstance();
    deckRepo.seed([
        8, 8, 8,          // 죽음의 낫 x3 (legendary)
        9, 9,             // 에너지 번 x2 (hero)
        25, 25, 25,       // 파멸의 계약 x3 (hero)
        27, 27, 27,       // 영혼 수확자 벨른 x3 (hero)
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
    // 출격 멀미(summoning sickness) — 유닛이 필드에 나온 턴 번호. 같은 턴에는 공격/스킬을
    // 쓸 수 없다. HandEntry로 키잉해 중복 cardId 사본이 서로의 상태를 공유하지 않게 한다
    // (placedCardEnergy와 동일한 이유).
    const deployedTurn = new Map<HandEntry, number>();
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
    // 2 copies for testing duplicate-target picks (e.g., 시체 폭발) + multi-NB scenarios.
    OpponentFieldMapRepositoryImpl.getInstance().addOpponentField(19);
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
    const lostZonePopupRenderer = new CardGridPopupRenderer();
    const lostZonePanelGroup = await lostZonePanelRenderer.build(lostZonePanelFrame);
    scene.add(lostZonePanelGroup);

    // ── Opponent Lost Zone — mirror of Your Lost Zone, with its own panel, popup, and repo.
    const opponentLostZonePanelFrame = createDefaultOpponentLostZonePanelFrame();
    const opponentLostZonePopupFrame = createDefaultOpponentLostZonePopupFrame();
    const opponentLostZonePanelRenderer = new OpponentLostZonePanelRendererV2();
    // Popup reuses CardGridPopupRenderer — popup rendering is generic (takes frame +
    // cards), so both lost zones share the same renderer. Keeps card layout identical.
    const opponentLostZonePopupRenderer = new CardGridPopupRenderer();
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
    // Declared here (not next to the 'f' handler that increments it) because the drop
    // handler stamps deployedTurn with it and the right-click handler compares against it —
    // both run earlier in the file.
    let currentTurn = 1;  // matches TurnHudRendererV2's initial

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
    const tombPopupRenderer = new CardGridPopupRenderer();
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
    const opponentTombPopupRenderer = new CardGridPopupRenderer();
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

    // cardData의 "스킬N {언데드|휴먼|트런트}필요에너지" 3개 열 = 그 스킬의 종족별 비용.
    // 0인 종족은 담지 않으므로, 빈 Map이면 비용 없는 스킬이다.
    function skillEnergyCost(cardAny: any, btnType: string): Map<CardRace, number> {
        const cost = new Map<CardRace, number>();
        const n = btnType === 'skill1' ? 1 : btnType === 'skill2' ? 2 : 0;
        if (n === 0 || !cardAny) return cost;
        const columns: ReadonlyArray<readonly [CardRace, string]> = [
            [CardRace.UNDEAD, `스킬${n} 언데드필요에너지`],
            [CardRace.HUMAN, `스킬${n} 휴먼필요에너지`],
            [CardRace.TRENT, `스킬${n} 트런트필요에너지`],
        ];
        for (const [race, column] of columns) {
            const amount = cardAny[column] ?? 0;
            if (amount > 0) cost.set(race, amount);
        }
        return cost;
    }

    // 비용을 종족별로 하나씩 대조해 처음 모자란 종족을 돌려준다. 전부 충족하면 null.
    // 총량 비교로는 "언데드 2 필요 / 휴먼 2 보유"를 통과시켜 버리므로 반드시 종족별로 본다.
    function findMissingSkillEnergy(
        entry: HandEntry,
        cost: Map<CardRace, number>,
    ): { race: CardRace; need: number; have: number } | null {
        for (const [race, need] of cost) {
            const have = cardEnergyOfRace(entry, race);
            if (have < need) return { race, need, have };
        }
        return null;
    }

    function clearAllSelection(): void {
        clearActivePanel();
        neonEffect.detachAll();
        selectedAttackerEntry = null;
        interactionState = 'idle';
    }

    // ── 모래시계 만료 시의 턴 넘김 조정 ──────────────────────────────────────────
    // 만료 시점의 상태를 두 가지로 구분한다.
    //   · 타겟팅 중(선택 미완료) — 아무것도 하지 못한 상태로 즉시 턴을 넘긴다.
    //   · 선택 완료 후 동작 진행 중 — 동작이 전부 끝난 뒤에 넘기고, 그 시점부터 타이머를
    //     다시 돌린다 (endYourTurn/beginYourTurn이 각자 reset을 호출하므로 자동).
    let resolvingDepth = 0;           // >0 이면 되돌릴 수 없는 동작이 진행 중
    let turnPassDeferred = false;     // 만료됐지만 동작 종료를 기다리는 중
    let passiveChainAborted = false;  // 턴이 넘어가 네더 블레이드 체인을 중단해야 함

    // 선택 완료 이후의 비가역 동작을 감싼다. 진행 중 만료가 걸리면 끝난 직후 턴을 넘긴다.
    async function runResolving<T>(work: () => Promise<T>): Promise<T> {
        resolvingDepth += 1;
        try {
            return await work();
        } finally {
            resolvingDepth -= 1;
            if (resolvingDepth === 0 && turnPassDeferred) {
                turnPassDeferred = false;
                console.log('[turn-state] 동작 완료 — 보류했던 턴 넘김 실행');
                passTurnOnExpiry('timer expired (deferred)');
            }
        }
    }

    // 리스너 전체를 한 단위로 묶어 "선택 완료 → 동작 실행 → 뒷정리"가 중간에 끊기지 않게
    // 한다. 리스너가 끝나기 전에는 보류된 턴 넘김이 실행되지 않는다.
    const withResolving = (handler: (e: MouseEvent) => Promise<void>) =>
        (e: MouseEvent): void => { void runResolving(() => handler(e)); };

    // 아직 선택이 끝나지 않은 타겟팅을 전부 취소한다. 되돌릴 상태만 정리하므로 희생 유닛은
    // 필드에, 시전 카드는 손패에 그대로 남는다 — 말 그대로 아무것도 하지 못한 상태.
    function cancelPendingTargeting(): void {
        if (netherBladePassive2State !== null) {
            const state = netherBladePassive2State;
            netherBladePassive2State = null;
            // await 중인 체인이 영원히 멈추지 않도록 반드시 resolve하되, 중단 플래그를 세워
            // 다음 네더 블레이드의 AoE로 넘어가지 않게 한다.
            passiveChainAborted = true;
            state.onResolve();
            console.log('[nether-blade] passive 2 픽 미완료 — 취소하고 턴 넘김');
        }
        if (corpseExplosionState !== null) {
            corpseExplosionState = null;
            console.log('[corpse-explosion] 타겟 선택 미완료 — 취소 (희생 유닛·시전 카드 유지)');
        }
        // 패널 / attackMode 타겟팅 + 선택 네온까지 한 번에 정리.
        clearAllSelection();
    }

    function passTurnOnExpiry(reason: string): void {
        cancelPendingTargeting();
        if (turnStateRepo.getOwner() === 'your') {
            endYourTurn(reason);
        } else {
            void beginYourTurn(reason);
        }
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
    const corpseExplosionEffect = new CorpseExplosionEffect(scene);
    const deadLandsEffect = new DeadLandsEffect(scene);
    const leonikSummonEffect = new LeonikSummonEffect(scene);
    const netherBladeEntranceEffect = new NetherBladeEntranceEffect(scene);
    const moraleConvertEffect = new MoraleConvertEffect(scene);
    const overflowMoraleEffect = new OverflowMoraleEffect(scene);
    const swampEffect = new SwampEffect(scene);
    // 빙결 / 암흑 화염 지속 오버레이 — 상대 유닛 카드 그룹에 직접 얹힌다.
    const frozenBurningEffect = new FrozenBurningOverlayEffect();
    // 보유 유닛에 붙는 두 상태 마크 — 셰이더 배지라 매 프레임 갱신이 필요하다.
    const traitMarkEffect = new ColdDarkTraitMarkEffect();

    animationLoop.setCustomUpdate((delta, elapsed) => {
        if (typeof TWEEN !== 'undefined') TWEEN.update();
        neonEffect.updateAnimation();
        enemyNeonEffect.updateAnimation();
        allyTargetNeonEffect.updateAnimation();
        turnEndButtonRenderer.updateAnimation(turnEndButtonGroup, turnEndButtonFrame);
        frozenBurningEffect.updateAnimation(elapsed, delta);
        traitMarkEffect.updateAnimation(elapsed);
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

        // ── -1) LEONIK popup — full modal lock ─────────────────────────────────────
        // The Leonik picker is a committed-action popup: until the user clicks CONFIRM
        // (or explicitly aborts via a future escape), NO other click can fire. Panels,
        // turn-end, cards — all intercepted. Clicks inside the popup route to card
        // selection or pagination/confirm buttons; clicks outside are a no-op.
        if (leonikPopupGroup) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            const hits = sharedRaycaster.intersectObjects(leonikPopupGroup.children, true);
            for (const hit of hits) {
                const bt = hit.object.userData.buttonType;
                if (bt === 'prev') {
                    if (leonikPopupPage > 0) { leonikPopupPage--; void reloadLeonikPopup(); }
                    return;
                }
                if (bt === 'next') {
                    if (leonikPopupPage < leonikTotalPages() - 1) {
                        leonikPopupPage++; void reloadLeonikPopup();
                    }
                    return;
                }
                if (bt === 'confirm') {
                    void confirmLeonikSummon();
                    return;
                }
            }

            // Card-cell hit test — toggle selection with LEONIK_MAX_PICK cap. Clicking
            // an already-selected card deselects. Clicking a fresh card when the cap
            // is reached is a no-op (user must deselect one first). Incremental border
            // add/remove (no popup rebuild) — avoids the one-frame blank flicker.
            const absIdx = hitLeonikPopupCard(worldX, worldY);
            if (absIdx >= 0) {
                if (leonikSelectedPopupIndices.has(absIdx)) {
                    leonikSelectedPopupIndices.delete(absIdx);
                    removeLeonikBorder(absIdx);
                } else if (leonikSelectedPopupIndices.size < LEONIK_MAX_PICK) {
                    leonikSelectedPopupIndices.add(absIdx);
                    addLeonikBorder(absIdx);
                }
                updateLeonikConfirmState();
                return;
            }
            // Outside popup bounds → absorbed, no-op.
            return;
        }

        // ── -0.5) Corpse Explosion 2-pick targeting state ─────────────────────────
        // Clicks on opponent units / master are RECORDED silently — NO flash/shake or
        // any visual mutation per click. Hit feedback (flash+shake), damage, kills,
        // hide, and reflow ALL run inside applyCorpseExplosionDamage after the user
        // has spent both picks, so the shake's position-restore can't race the reflow.
        // Clicks elsewhere are absorbed (modal). Targets stay alive through both picks.
        if (corpseExplosionState !== null) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);

            const recordPick = (pick: CorpseExplosionPick): void => {
                if (!corpseExplosionState) return;
                corpseExplosionState.picks.push(pick);
                console.log(`[corpse-explosion] pick ${corpseExplosionState.picks.length}/${CORPSE_EXPLOSION_PICKS} → ${pick.kind}${pick.kind === 'opponent' ? ` idx=${pick.cardIndex}` : ''}`);
                if (corpseExplosionState.picks.length >= CORPSE_EXPLOSION_PICKS) {
                    // Detach red neon at pick completion so the targeting borders go
                    // away the instant the corpse starts flying (not after the effect
                    // resolves) — keeps the visual focus on the corpse + projectiles.
                    enemyNeonEffect.detachAll();
                    void runResolving(() => resolveCorpseExplosion());
                }
            };

            // Master first (smaller target; raycast doesn't intersect opponent group).
            if (opponentMasterHp > 0) {
                const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
                if (masterHits.length > 0) {
                    recordPick({ kind: 'master' });
                    return;
                }
            }

            // Opponent units — visible only. Walk up to the entry group like attackMode.
            const oppHits = sharedRaycaster.intersectObjects(opponentGroup.children, true);
            for (const hit of oppHits) {
                let walkGroup: THREE.Object3D | null = hit.object;
                while (walkGroup && walkGroup.parent !== opponentGroup) {
                    walkGroup = walkGroup.parent;
                }
                if (!(walkGroup instanceof THREE.Group) || !walkGroup.visible) continue;
                const targetEntry = opponentEntries.find((oe) => oe.group === walkGroup);
                if (!targetEntry) continue;
                recordPick({ kind: 'opponent', cardIndex: targetEntry.cardIndex });
                return;
            }

            // Click off any valid target — absorb, no-op.
            return;
        }

        // ── -0.4) Nether Blade passive 2 single-pick targeting state ───────────────
        // Auto-entered after passive 1 resolves on deployment. Modal: only clicks on a
        // visible opponent or the master register; everything else is absorbed. On a
        // valid pick, resolveNetherBladePassive2 fires the move-and-return motion +
        // applies 20 dmg to that target.
        if (netherBladePassive2State !== null) {
            e.stopImmediatePropagation();

            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);

            // Master first (own raycast tree).
            if (opponentMasterHp > 0) {
                const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
                if (masterHits.length > 0) {
                    void runResolving(() => resolveNetherBladePassive2({ kind: 'master' }));
                    return;
                }
            }
            // Opponent units.
            const oppHits = sharedRaycaster.intersectObjects(opponentGroup.children, true);
            for (const hit of oppHits) {
                let walkGroup: THREE.Object3D | null = hit.object;
                while (walkGroup && walkGroup.parent !== opponentGroup) {
                    walkGroup = walkGroup.parent;
                }
                if (!(walkGroup instanceof THREE.Group) || !walkGroup.visible) continue;
                const target = opponentEntries.find((oe) => oe.group === walkGroup);
                if (!target) continue;
                void runResolving(() => resolveNetherBladePassive2({ kind: 'opponent', cardIndex: target.cardIndex }));
                return;
            }
            // Click off any valid target — absorb, no-op.
            return;
        }

        // ── 0) Turn-end button (hexagon) ───────────────────────────────────────────
        // Only active while NO popup is open (popup checks below handle their own consume).
        // Only effective while it's YOUR turn — idempotent otherwise. Hit-test is a true
        // point-in-hexagon check, not a bounding rect — clicks just outside the hex corners
        // don't register. On a real transfer, the 60-second hourglass restarts from the top
        // so the new turn owner (the opponent) gets a fresh budget, and the guide banner
        // announces the handover the same way the drag hint greets you on entry — all of
        // which lives in endYourTurn(), shared with the hourglass-expiry trigger.
        if (!lostZonePopupGroup && !opponentLostZonePopupGroup) {
            if (isPointInsideTurnEndButton(worldX, worldY, turnEndButtonFrame, w, h)) {
                e.stopImmediatePropagation();
                endYourTurn('turn-end button');
                return;
            }
        }

        // ── 1) Your Lost Zone panel ────────────────────────────────────────────────
        // 네 패널(내/상대 × 로스트 존/무덤)은 아이콘만으로 구분이 어려워, 팝업을 여는
        // 순간 어느 영역인지 배너로 알린다. 닫을 때는 띄우지 않는다 — 사라지는 팝업의
        // 이름을 알리는 건 노이즈다.
        const yourPanelBounds = computeYourLostZonePanelBounds(lostZonePanelFrame, w, h);
        const onYourPanel =
            worldX >= yourPanelBounds.minX && worldX <= yourPanelBounds.maxX &&
            worldY >= yourPanelBounds.minY && worldY <= yourPanelBounds.maxY;
        if (onYourPanel) {
            e.stopImmediatePropagation();
            if (lostZonePopupGroup) {
                closeLostZonePopup();
            } else {
                guideRenderer.show(guideElement, '당신의 로스트 존입니다.', 3000);
                void openLostZonePopup();
            }
            return;
        }

        // ── 2) Opponent Lost Zone panel ────────────────────────────────────────────
        const oppPanelBounds = computeOpponentLostZonePanelBounds(opponentLostZonePanelFrame, w, h);
        const onOppPanel =
            worldX >= oppPanelBounds.minX && worldX <= oppPanelBounds.maxX &&
            worldY >= oppPanelBounds.minY && worldY <= oppPanelBounds.maxY;
        if (onOppPanel) {
            e.stopImmediatePropagation();
            if (opponentLostZonePopupGroup) {
                closeOpponentLostZonePopup();
            } else {
                guideRenderer.show(guideElement, '상대방의 로스트 존입니다.', 3000);
                void openOpponentLostZonePopup();
            }
            return;
        }

        // ── 2b) Your Tomb panel (tombstone-shaped) ────────────────────────────────
        if (isPointInsideYourTomb(worldX, worldY, tombPanelFrame, w, h)) {
            e.stopImmediatePropagation();
            if (tombPopupGroup) {
                closeTombPopup();
            } else {
                guideRenderer.show(guideElement, '당신의 무덤입니다.', 3000);
                void openTombPopup();
            }
            return;
        }

        // ── 2c) Opponent Tomb panel (inverted tombstone) ──────────────────────────
        if (isPointInsideOpponentTomb(worldX, worldY, opponentTombPanelFrame, w, h)) {
            e.stopImmediatePropagation();
            if (opponentTombPopupGroup) {
                closeOpponentTombPopup();
            } else {
                guideRenderer.show(guideElement, '상대방의 무덤입니다.', 3000);
                void openOpponentTombPopup();
            }
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

            const popupBounds = computeCardGridPopupBounds(lostZonePopupFrame, w, h);
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
            const popupBounds = computeCardGridPopupBounds(opponentLostZonePopupFrame, w, h);
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
            const popupBounds = computeCardGridPopupBounds(tombPopupFrame, w, h);
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

            const popupBounds = computeCardGridPopupBounds(opponentTombPopupFrame, w, h);
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

    // "Move to skill panel + run effect + return" motion. Sequence:
    //   • ease card from current pos → skill-panel slot
    //   • run effectCallback (passed the panel-slot world pos so callers can
    //     spawn meshes there); if no callback is given, hold ~300 ms instead
    //   • ease back to the original slot
    // Skill-panel slot coords mirror AttackAnimationV2.playAoESkill (x=0,
    // y=(0.5-0.78221649)*h) so the visual lines up with where 벨른's full
    // animation parks.
    const playSkillPanelMoveOnly = async (
        group: THREE.Group,
        effectCallback?: (panelPos: THREE.Vector3) => Promise<void>,
    ): Promise<void> => {
        const h = window.innerHeight;
        const skillPanelX = 0;
        const skillPanelY = (0.5 - 0.78221649) * h;
        const origPos = group.position.clone();

        const moveTo = (tx: number, ty: number, tz: number, durMs: number): Promise<void> => {
            const startMs = performance.now();
            const fromX = group.position.x;
            const fromY = group.position.y;
            const fromZ = group.position.z;
            return new Promise<void>((resolve) => {
                const step = () => {
                    const t = Math.min(1, (performance.now() - startMs) / durMs);
                    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    group.position.set(
                        fromX + (tx - fromX) * e,
                        fromY + (ty - fromY) * e,
                        fromZ + (tz - fromZ) * e,
                    );
                    if (t < 1) requestAnimationFrame(step);
                    else resolve();
                };
                requestAnimationFrame(step);
            });
        };

        // Forward: lift z by +1 so the card draws above other field meshes during travel.
        await moveTo(skillPanelX, skillPanelY, origPos.z + 1, 700);
        // Cast — run the effect at the panel slot, or just hold briefly.
        if (effectCallback) {
            const panelPos = new THREE.Vector3(skillPanelX, skillPanelY, origPos.z + 1);
            try {
                await effectCallback(panelPos);
            } catch (err) {
                console.error('[nether-blade] panel effect failed:', err);
            }
        } else {
            await new Promise<void>((r) => setTimeout(r, 300));
        }
        // Return to original slot.
        await moveTo(origPos.x, origPos.y, origPos.z, 700);
        // Snap to exact original to avoid sub-pixel drift.
        group.position.copy(origPos);
    };

    // 출격 시 두번째 패시브 (단일기) — auto-entered after passive 1 resolves. User picks
    // ONE opponent unit OR the master; the deployed unit then performs the same move-
    // and-return motion before damage applies. State is null when not active.
    type NetherBladePassive2Pick =
        | { readonly kind: 'master' }
        | { readonly kind: 'opponent'; readonly cardIndex: number };
    // State carries the resolver of the Promise returned by enterNetherBladePassive2 —
    // resolve() fires after the picker's damage application so chained callers (deploy
    // chain + turn-start loop) can sequentially `await` multiple Nether Blade passes.
    let netherBladePassive2State: {
        deployedEntry: HandEntry;
        onResolve: () => void;
    } | null = null;

    const enterNetherBladePassive2 = (deployedEntry: HandEntry): Promise<void> => {
        return new Promise<void>((resolve) => {
            const hasOpponents = opponentAliveOrder.length > 0 &&
                opponentEntries.some((oe) =>
                    oe.group.visible && opponentAliveOrder.includes(oe.cardIndex),
                );
            const hasMaster = opponentMasterHp > 0;
            if (!hasOpponents && !hasMaster) {
                console.log('[nether-blade] passive 2 → no valid targets, skipped');
                resolve();
                return;
            }

            for (const oe of opponentEntries) {
                if (oe.group.visible && opponentAliveOrder.includes(oe.cardIndex)) {
                    enemyNeonEffect.attach(oe.cardIndex, oe.group);
                }
            }
            if (hasMaster) {
                enemyNeonEffect.attach(FIELD_NEON_ENTITY_ID, masterGroup);
            }
            netherBladePassive2State = { deployedEntry, onResolve: resolve };
            console.log('[nether-blade] passive 2 → choose opponent unit or master (red highlights)');
        });
    };

    const resolveNetherBladePassive2 = async (pick: NetherBladePassive2Pick): Promise<void> => {
        if (!netherBladePassive2State) return;
        const state = netherBladePassive2State;
        // Detach neons + null state up-front so the modal lock releases immediately
        // (the await below yields to the event loop and we don't want re-entry).
        enemyNeonEffect.detachAll();
        netherBladePassive2State = null;

        // Capture the picked target's world position BEFORE the cast so the slash
        // flies to where the unit currently sits.
        let singleTarget: THREE.Vector3 | null = null;
        if (pick.kind === 'master') {
            if (opponentMasterHp > 0) {
                singleTarget = masterGroup.getWorldPosition(new THREE.Vector3());
            }
        } else {
            const target = opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex);
            if (target && target.group.visible) {
                singleTarget = target.group.getWorldPosition(new THREE.Vector3());
            }
        }
        const canvasEl = document.querySelector('canvas') as HTMLElement | null;
        // 조각낼 대상. 본체는 투명 히트박스라 찢을 아트가 없으므로 null로 넘긴다.
        const ripTarget = pick.kind === 'opponent'
            ? opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex) ?? null
            : null;

        // 치명타 여부를 **연출 전에** 계산한다. 죽는 일격이면 갈라진 카드를 되돌리지
        // 않아, 조각이 흩어진 자리가 그대로 사망이 된다. 연출이 끝난 뒤 되살아났다가
        // 아래 데미지 처리로 사라지면 카드가 깜빡이는 것처럼 보인다.
        const lethal = pick.kind === 'opponent'
            && (opponentHpState.get(pick.cardIndex) ?? 0) - NETHER_BLADE_PASSIVE2_DAMAGE <= 0;

        await playSkillPanelMoveOnly(state.deployedEntry.group, async (_panelPos) => {
            if (!canvasEl || !singleTarget) {
                await new Promise<void>((r) => setTimeout(r, 300));
                return;
            }
            // 단일기 — gather/hold는 광역기와 공유하고, 그 뒤로 화면 전체를 가로지르는
            // 검풍이 날아간 다음 지정한 카드로 모여들어 그 카드를 조각낸다.
            const effect = new NetherBladeSecondPassiveEffect(scene);
            await effect.play(
                singleTarget,
                ripTarget ? ripTarget.group : null,
                canvasEl,
                rendererManager.getRenderer(),
                camera,
                undefined,
                lethal,
            );
        });

        const dmg = NETHER_BLADE_PASSIVE2_DAMAGE;
        if (pick.kind === 'master') {
            if (opponentMasterHp > 0) {
                setOpponentMasterHp(opponentMasterHp - dmg, 'nether-blade passive 2');
                if (opponentMasterHp <= 0) {
                    masterGroup.visible = false;
                    console.log('[nether-blade] opponent MASTER defeated by passive 2!');
                }
            }
        } else {
            // Opponent unit pick.
            const target = opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex);
            if (target && target.group.visible) {
                const prev = opponentHpState.get(pick.cardIndex) ?? 0;
                const newHp = Math.max(0, prev - dmg);
                opponentHpState.set(pick.cardIndex, newHp);
                // 패시브도 이 유닛의 공격이다 — 보유자면 암흑 화염 + 빙결이 실린다.
                if (newHp > 0) applyColdDarkTraits(state.deployedEntry, pick.cardIndex);
                console.log(`[nether-blade] passive 2 → opponent idx=${pick.cardIndex} cardId=${target.card.cardId} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                if (newHp <= 0) {
                    buryOpponentUnit(pick.cardIndex);
                    opponentAliveOrder.splice(opponentAliveOrder.indexOf(pick.cardIndex), 1);
                    target.group.visible = false;
                    reflowOpponentField();
                }
            }
        }

        // Settle window — mirrors AoE's pause so the picked-target damage lands and
        // the field reflows visibly before the next placed Nether Blade (if any) takes
        // its turn at the skill panel.
        await new Promise<void>((r) => setTimeout(r, NETHER_BLADE_PHASE_SETTLE_MS));

        // Signal completion to whatever caller was awaiting enterNetherBladePassive2.
        state.onResolve();
    };

    // 광역기 패시브 (passive 1, AoE EveryUnitField) — extracted so it can be invoked
    // independently from BOTH on-deploy AND every turn-start ('f' key). Card travels
    // to the skill-panel slot, holds, returns, applies 10 dmg to every visible opponent
    // unit (master excluded), then reflows the opponent field, then awaits a short
    // SETTLE window so the field state-change visibly lands BEFORE the next phase
    // (passive 2 picker) starts. This guarantees the user sees AoE → damage → reflow
    // before the single-target picker comes up — the damage isn't visually merged
    // into "after both passives".
    const NETHER_BLADE_PHASE_SETTLE_MS = 450;
    const triggerNetherBladeAoEPassive = async (deployedEntry: HandEntry): Promise<void> => {
        // Yield once so any pending sync layout work (e.g., onDrop's trailing reflow)
        // lands before we capture origPos inside playSkillPanelMoveOnly.
        await Promise.resolve();

        // Capture target world positions BEFORE the move, while opponent units are
        // still in their grid slots. The slash mesh will fly from the panel slot to
        // each captured position.
        const aoeTargets: THREE.Vector3[] = [];
        for (const idx of [...opponentAliveOrder]) {
            const target = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (!target || !target.group.visible) continue;
            aoeTargets.push(target.group.getWorldPosition(new THREE.Vector3()));
        }
        const canvasEl = document.querySelector('canvas') as HTMLElement | null;

        await playSkillPanelMoveOnly(deployedEntry.group, async (panelPos) => {
            if (!canvasEl || aoeTargets.length === 0) {
                // Fall back to the brief hold if we can't render visuals.
                await new Promise<void>((r) => setTimeout(r, 300));
                return;
            }
            // Wave 2 + shatter run FULLSCREEN over the entire battle screen
            // — same scale as wave 1 — so the cuts tear across the whole
            // field, not just the opponent's row.
            const effect = new NetherBladeFirstPassiveEffect(scene);
            await effect.play(
                panelPos, aoeTargets, canvasEl, () => { /* per-strike SFX hook */ },
                rendererManager.getRenderer(), camera,
            );
        });

        const dmg = NETHER_BLADE_PASSIVE_DAMAGE;
        const deadIndices: number[] = [];
        for (const idx of [...opponentAliveOrder]) {
            const target = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (!target || !target.group.visible) continue;
            const prev = opponentHpState.get(idx) ?? 0;
            const newHp = Math.max(0, prev - dmg);
            opponentHpState.set(idx, newHp);
            // 패시브도 이 유닛의 공격이다 — 보유자면 암흑 화염 + 빙결이 실린다.
            if (newHp > 0) applyColdDarkTraits(deployedEntry, idx);
            console.log(`[nether-blade] AoE → opponent idx=${idx} cardId=${target.card.cardId} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
            if (newHp <= 0) {
                buryOpponentUnit(idx);
                opponentAliveOrder.splice(opponentAliveOrder.indexOf(idx), 1);
                deadIndices.push(idx);
            }
        }
        for (const idx of deadIndices) {
            const e = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (e) e.group.visible = false;
        }
        if (deadIndices.length > 0) reflowOpponentField();

        // Phase-settle window — gives the user time to read the new field state
        // before passive 2's picker enters.
        await new Promise<void>((r) => setTimeout(r, NETHER_BLADE_PHASE_SETTLE_MS));
    };

    // 출격 시 패시브 풀체인 — passive 1 (AoE) → passive 2 (single-target picker, awaited).
    // Same chain runs every turn-start while the unit is alive; this wrapper is shared
    // so deploy and turn-start use identical logic.
    const triggerNetherBladePassive = async (deployedEntry: HandEntry): Promise<void> => {
        await runResolving(() => triggerNetherBladeAoEPassive(deployedEntry));
        // 만료로 턴이 넘어갔으면 픽 단계로 들어가지 않는다.
        if (passiveChainAborted) return;
        await enterNetherBladePassive2(deployedEntry);
    };

    // Active panel button click + opponent card click (attack targeting).
    // stopImmediatePropagation prevents HandInteractionBridge from stealing the same click.
    rendererManager.getDomElement().addEventListener('mousedown', withResolving(async (e: MouseEvent) => {
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

                    // ── 스킬 에너지 요구량 검사 ────────────────────────────────
                    // cardData의 "스킬N {종족}필요에너지" 3개 열이 그 스킬의 종족별 비용이다.
                    // 카드에 붙은 에너지도 종족별로 보관하므로 종족을 하나씩 대조한다.
                    // 일반 공격(general)은 비용 없음.
                    if (btnType.startsWith('skill') && attackerCard && selectedAttackerEntry) {
                        const cost = skillEnergyCost(cardAny, btnType);
                        const missing = findMissingSkillEnergy(selectedAttackerEntry, cost);
                        if (missing) {
                            guideRenderer.show(guideElement, '에너지가 부족하여 스킬을 사용할 수 없습니다.', 3000);
                            console.log(`[skill-energy] ${btnType} blocked — cardId=${attackerId} ${RACE_LABEL[missing.race]} 보유 ${missing.have} < 필요 ${missing.need}`);
                            clearActivePanel();
                            return;
                        }
                        const costText = cost.size === 0
                            ? '비용 없음'
                            : [...cost].map(([r, n]) => `${RACE_LABEL[r]} ${n}`).join(', ');
                        console.log(`[skill-energy] ${btnType} ok — cardId=${attackerId} (${costText})`);
                    }

                    if (skillType === SkillType.EveryUnitField || skillType === SkillType.EveryField) {
                        // AoE — play animation first, then apply damage
                        console.log(`${btnType} (AoE, damage=${damage}) → hitting all opponents`);
                        const atkEntry = selectedAttackerEntry;
                        if (atkEntry) {
                            clearAllSelection();
                            // 네더 블레이드 — only the bare move-to-panel + return motion
                            // (no dark vortex / dementors / magic circle yet — the
                            // mythical-tier effect is intentionally deferred). 벨른
                            // (and other cards) keeps the full playAoESkill sequence.
                            if (atkEntry.card.cardId === NETHER_BLADE_CARD_ID) {
                                await playSkillPanelMoveOnly(atkEntry.group);
                            } else {
                                await attackAnimation.playAoESkill(atkEntry.group);
                            }
                        }

                        for (const idx of [...opponentAliveOrder]) {
                            const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                            if (!entry) continue;

                            const currentHp = opponentHpState.get(idx) ?? 0;
                            const newHp = currentHp - damage;
                            opponentHpState.set(idx, newHp);

                            // 차갑게 불타는 암흑 에너지 보유자의 광역기 — 맞은 전원에게 부여.
                            if (newHp > 0) applyColdDarkTraits(atkEntry, idx);

                            // Red flash + shake on all hit targets
                            entry.group.traverse((child) => {
                                if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                                    const mat = child.material as THREE.MeshBasicMaterial;
                                    // ShaderMaterial (빙결/암흑 화염 오버레이 등)에는 `.color`가 없다 — 건너뛴다.
                                    if (!mat.color) return;
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
                            setOpponentMasterHp(opponentMasterHp - damage, `${btnType} (AoE EveryField)`);
                            // 본체 피격 표현 없음 (투명 유지)
                            if (opponentMasterHp <= 0) {
                                setTimeout(() => { masterGroup.visible = false; }, 300);
                            }
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

                setOpponentMasterHp(opponentMasterHp - atkPower, `attack on MASTER (ATK=${atkPower})`);

                if (opponentMasterHp <= 0) {
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

                // 차갑게 불타는 암흑 에너지 보유자의 공격/단일기 — 맞은 대상에게 부여.
                if (newHp > 0) applyColdDarkTraits(attackerEntry, targetIdx);

                console.log(`Single-target attack: attacker=${attackerId} (ATK=${attackPower}) → opponent idx=${targetIdx} cardId=${targetEntry.card.cardId} (HP: ${currentHp} → ${newHp})`);

                const flashGroup = targetEntry.group;
                flashGroup.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.material && !child.userData.__neonBorderLine) {
                        const mat = child.material as THREE.MeshBasicMaterial;
                        // ShaderMaterial (빙결/암흑 화염 오버레이 등)에는 `.color`가 없다 — 건너뛴다.
                        if (!mat.color) return;
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
    }));

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

        // 출격 멀미 — 이번 턴에 출격한 유닛은 공격도 스킬도 쓸 수 없으므로 액티브 패널
        // 자체를 열지 않는다. 이유를 알 수 없으면 무반응처럼 보이므로 배너로 알린다.
        if (deployedTurn.get(selectedEntry) === currentTurn) {
            guideRenderer.show(guideElement, '이번 턴에 출격한 유닛으로 공격할 수 없습니다.', 3000);
            console.log(`[summoning-sickness] cardId=${selectedEntry.card.cardId} deployed on TURN ${currentTurn} — panel blocked`);
            return;
        }

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
    // 카드에 붙은 에너지를 **종족별로** 보관한다. 스킬 비용이 종족별 3개 열
    // (스킬N 언데드/휴먼/트런트필요에너지)로 정의되어 있고, 앞으로 여러 종족을 동시에
    // 요구하는 스킬이 추가될 예정이라 총량만으로는 판정할 수 없다.
    // 바깥 Map은 HandEntry 키 — 중복 cardId 사본이 카운터/메쉬를 공유하지 않게 한다.
    const placedCardEnergy = new Map<HandEntry, Map<CardRace, number>>();
    const cardEnergyMeshes = new Map<HandEntry, { iconMesh: THREE.Mesh; textMesh: THREE.Mesh }>();

    // Race HUD에서 선택 중인 종족. 필드 에너지를 카드에 붙일 때 이 값이 그대로 기록되므로
    // 부착 로직(attachEnergyToCard)보다 앞에 선언한다. prev/next 클릭 존이 갱신한다.
    let currentRaceId = 1;
    const MAX_RACE_ID = 3;

    // 카드 UI(아이콘 위 숫자)와 Count HUD는 종족 구분 없이 총합 하나만 보여준다.
    function totalCardEnergy(entry: HandEntry): number {
        const byRace = placedCardEnergy.get(entry);
        if (!byRace) return 0;
        let sum = 0;
        for (const v of byRace.values()) sum += v;
        return sum;
    }

    function cardEnergyOfRace(entry: HandEntry, race: CardRace): number {
        return placedCardEnergy.get(entry)?.get(race) ?? 0;
    }

    // 에너지 부착의 유일한 기록 지점. 갱신된 총합을 돌려주므로 호출부는 그대로
    // updateCardEnergyVisual에 넘기면 된다.
    function addCardEnergy(entry: HandEntry, race: CardRace, amount: number): number {
        let byRace = placedCardEnergy.get(entry);
        if (!byRace) {
            byRace = new Map<CardRace, number>();
            placedCardEnergy.set(entry, byRace);
        }
        byRace.set(race, (byRace.get(race) ?? 0) + amount);
        return totalCardEnergy(entry);
    }

    // cardData의 "종족" 열은 문자열("1"~"3")이다. 알 수 없는 값이면 null.
    function cardRaceOf(cardId: number): CardRace | null {
        const raw = Number((getCardById(cardId) as any)?.['종족']);
        return raw === CardRace.HUMAN || raw === CardRace.UNDEAD || raw === CardRace.TRENT
            ? (raw as CardRace)
            : null;
    }

    const RACE_LABEL: Record<number, string> = {
        [CardRace.HUMAN]: '휴먼',
        [CardRace.UNDEAD]: '언데드',
        [CardRace.TRENT]: '트런트',
    };

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
        // 저장은 addCardEnergy가 담당한다 — 여기서는 아이콘/숫자/HUD만 갱신.
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

    // ── 차갑게 불타는 암흑 에너지 마크 ───────────────────────────────────────────
    // 에너지 아이콘은 카드 좌상단(offsetY +0.5)에 있으므로, 두 마크는 그 **아래로**
    // 세로로 쌓는다. 정지 이미지가 아니라 셰이더 배지라 매 프레임 살아 움직인다 —
    // 불꽃은 화르륵 치솟고, 눈 결정은 빛줄기가 스치며 반짝인다.
    function attachColdDarkTraitMarks(entry: HandEntry): void {
        if (traitMarkEffect.isAttached(entry.cardIndex)) return;

        const userData = entry.group.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cardW = userData.baseCardWidth ?? 100;
        const cardH = userData.baseCardHeight ?? 160;
        const eSlot = handCardFrame.slots.energy;
        const slotW = eSlot.widthRatio * cardW;
        const slotH = slotW * eSlot.aspect;
        const size = slotW * 0.82;

        traitMarkEffect.attach(entry.cardIndex, entry.group, {
            x: eSlot.offsetXRatio * cardW,
            // 에너지 아이콘 하단에서 한 칸 띄우고 시작.
            y: eSlot.offsetYRatio * cardH - slotH * 0.62 - size * 0.5,
            size,
            gap: size * 1.08,
        });
        console.log(`[cold-dark-energy] 마크 부착 → cardId=${entry.card.cardId} (암흑 화염 + 빙결)`);
    }

    // ── 빙결 / 암흑 화염 상태 관리 ───────────────────────────────────────────────

    // 상대 카드에 지속 오버레이를 올린다(이미 있으면 크기만 맞춘다).
    // 불길·서리는 셰이더가 카드 정중앙 타원으로 마스킹하므로, 테두리에 붙은
    // 무기 / HP / 종족 / 에너지 표기는 건드리지 않는다.
    function ensureFrozenBurningOverlay(cardIndex: number): boolean {
        const target = opponentEntries.find((oe) => oe.cardIndex === cardIndex);
        if (!target) return false;
        const ud = target.group.userData as { baseCardWidth?: number; baseCardHeight?: number };
        frozenBurningEffect.attach(
            cardIndex, target.group, ud.baseCardWidth ?? 100, ud.baseCardHeight ?? 160,
        );
        return true;
    }

    // 유닛이 죽거나 필드를 떠날 때 상태·오버레이를 모두 걷어낸다.
    function clearColdDarkStatus(cardIndex: number): void {
        darkFlameTargets.delete(cardIndex);
        frozenTargets.delete(cardIndex);
        freezeImmuneTargets.delete(cardIndex);
        frozenBurningEffect.detach(cardIndex);
    }

    // 공격이 명중한 뒤 호출. 공격자가 보유자가 아니면 아무 일도 하지 않는다.
    // 암흑 화염은 매번 갱신(지속), 빙결은 면역이 아닐 때만 새로 건다.
    function applyColdDarkTraits(attacker: HandEntry | null, targetIdx: number): void {
        if (!attacker || !coldDarkEnergyHolders.has(attacker)) return;
        const target = opponentEntries.find((oe) => oe.cardIndex === targetIdx);
        if (!target || !target.group.visible) return;
        if (!ensureFrozenBurningOverlay(targetIdx)) return;

        darkFlameTargets.add(targetIdx);

        // 연속 빙결 불가 — 직전 턴에 빙결이 풀린 대상은 이번 턴엔 걸리지 않는다.
        const immune = freezeImmuneTargets.has(targetIdx);
        if (!immune) frozenTargets.add(targetIdx);

        frozenBurningEffect.setState(targetIdx, {
            flame: true,
            freeze: frozenTargets.has(targetIdx),
        });
        console.log(
            `[cold-dark-energy] idx=${targetIdx} 암흑 화염 부여` +
            (immune ? ' · 빙결 면역(연속 빙결 불가)' : ' · 빙결 부여'),
        );
    }

    // 상대 유닛이 지금 행동할 수 있는지. 빙결 중이면 불가.
    // (상대 행동 로직이 아직 없어 호출부가 없다 — 상태의 단일 판정 지점으로 먼저 둔다.)
    function isOpponentFrozen(cardIndex: number): boolean {
        return frozenTargets.has(cardIndex);
    }

    // 내 턴 시작 훅 — 빙결 해제 + 재빙결 면역 갱신.
    // 빙결은 상대 유닛의 행동을 막는 것이므로 상대 턴 내내 유지되어야 한다. 따라서
    // 상대 턴이 끝나고 내 턴이 시작될 때 녹는다 (화상 정산과는 시점이 다르다).
    function tickFreezeExpiry(): void {
        // 지난 턴의 면역은 만료되고, 이번에 녹은 대상이 새 면역을 얻는다.
        // 그래야 "다음 턴에 공격 받더라도 빙결 당하지 않음"이 정확히 1턴만 유지된다.
        freezeImmuneTargets.clear();
        for (const idx of frozenTargets) {
            freezeImmuneTargets.add(idx);
            frozenBurningEffect.setState(idx, { freeze: false });
            console.log(`[cold-dark-energy] idx=${idx} 빙결 해제 — 이번 턴 재빙결 불가`);
        }
        frozenTargets.clear();
    }

    // 상대 턴 시작 훅 — 암흑 화염 화상 피해. 화염에 휩싸인 상대 유닛은 자기 턴을
    // 시작하는 순간 5의 피해를 받는다.
    function tickDarkFlameDamage(): void {
        if (darkFlameTargets.size === 0) return;
        const dead: number[] = [];
        for (const idx of [...darkFlameTargets]) {
            const target = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (!target || !target.group.visible) { clearColdDarkStatus(idx); continue; }
            const prev = opponentHpState.get(idx) ?? 0;
            const newHp = Math.max(0, prev - DARK_FLAME_TURN_DAMAGE);
            opponentHpState.set(idx, newHp);
            console.log(`[cold-dark-energy] 암흑 화염 → idx=${idx} HP ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
            if (newHp <= 0) dead.push(idx);
        }
        for (const idx of dead) {
            const aliveIdx = opponentAliveOrder.indexOf(idx);
            if (aliveIdx >= 0) {
                buryOpponentUnit(idx);
                opponentAliveOrder.splice(aliveIdx, 1);
            }
            const target = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (target) target.group.visible = false;
            clearColdDarkStatus(idx);
        }
        if (dead.length > 0) reflowOpponentField();
    }

    async function attachEnergyToCard(entry: HandEntry): Promise<void> {
        if (availableEnergy <= 0) return;
        if (!placedOrder.includes(entry)) return;

        availableEnergy--;
        // 붙는 에너지의 종족 = Race HUD에서 선택 중인 종족.
        const race = currentRaceId as CardRace;
        const cardEnergy = addCardEnergy(entry, race, 1);

        energyRenderer.setEnergy(availableEnergy);
        energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
        await updateCardEnergyVisual(entry, cardEnergy);

        setFieldEnergyNeon(false);
        console.log(`Energy attached to card ${entry.card.cardId}: ${RACE_LABEL[race]} +1 → ${cardEnergy} total. Available: ${availableEnergy}`);
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

    // 차갑게 불타는 암흑 에너지 (151, ENERGY) — 유닛에게 해당 종족 에너지 1을 주고,
    // 그 유닛의 모든 공격과 스킬에 '암흑 화염'과 '빙결'을 부여한다.
    const COLD_DARK_ENERGY_CARD_ID = 151;
    const DARK_FLAME_TURN_DAMAGE = 5;

    // 이 에너지를 보유한 아군 유닛. 보유 개수가 아니라 보유 여부만 의미가 있다.
    const coldDarkEnergyHolders = new Set<HandEntry>();

    // 상대 유닛의 상태이상 — 키는 opponentEntries와 같은 cardIndex.
    const darkFlameTargets = new Set<number>();     // 암흑 화염: 매 턴 5 데미지 (지속)
    const frozenTargets = new Set<number>();        // 빙결: 이번 1회만 행동 불가
    const freezeImmuneTargets = new Set<number>();  // 빙결이 풀린 직후 1턴간 재빙결 불가

    // Death-energy (ENERGY kind) also targets placed allies when picked up — same
    // green-neon highlight + hitAllyAt drop test, just with its own ENERGY branch below.
    const ALLY_TARGETING_ITEM_IDS: readonly number[] = [
        MORALE_CONVERT_CARD_ID,
        OVERFLOW_MORALE_CARD_ID,
        DEATH_ENERGY_CARD_ID,
        COLD_DARK_ENERGY_CARD_ID,
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

    // 죽음의 대지 (Dead Lands, cardId 36) — ITEM that targets the OPPONENT FIELD AS A
    // WHOLE (same red neon highlight pattern as 파멸의 계약). On drop it drains the
    // opponent's field energy by DEAD_LANDS_DRAIN, flooring at 0. No unit damage.
    const DEAD_LANDS_CARD_ID = 36;
    const DEAD_LANDS_DRAIN = 2;

    // 레오닉의 부름 (Leonik's Summon, cardId 30) — SUPPORT that lets the player hand-pick
    // LEONIK_MAX_PICK UNIT cards from the deck whose grade is ≤ LEONIK_MAX_GRADE (HERO or
    // below). Pickup highlights the whole YOUR FIELD with green neon (same as 망자의 늪).
    // Drop on the field opens a picker popup; the Leonik card itself isn't consumed until
    // the user clicks CONFIRM in the popup. On confirm: the two picked cards move from
    // deck → hand, Leonik → tomb, and the deck is shuffled.
    const LEONIK_SUMMON_CARD_ID = 30;
    const LEONIK_MAX_PICK = 2;
    const LEONIK_MAX_GRADE = CardGrade.HERO;

    // 시체 폭발 (Corpse Explosion, cardId 33) — ITEM (CardKind 2). Requires at least one
    // UNDEAD ally on Your Field. Pickup paints green neon on UNDEAD allies only. Drop
    // onto an UNDEAD ally → that ally is sacrificed (→ tomb). Game then enters a 2-pick
    // targeting state with red neon on every visible opponent unit + opponent master
    // body. The next two clicks on opponent/master each deal CORPSE_EXPLOSION_DAMAGE;
    // the SAME TARGET can be picked twice (10 + 10 = 20 dmg on one). After the 2nd pick:
    // corpse-explosion card → tomb, neons cleared, state exits.
    const CORPSE_EXPLOSION_CARD_ID = 33;
    const CORPSE_EXPLOSION_DAMAGE = 10;
    const CORPSE_EXPLOSION_PICKS = 2;

    // 마검의 지배자 네더 블레이드 (Nether Blade, cardId 19) — UNIT, MYTHICAL.
    // First passive: AUTO-FIRES on deployment (출격 시) — the unit briefly travels to
    // the skill-panel slot (same trajectory used by 벨른's playAoESkill) and returns;
    // ONLY THEN is AoE damage applied to every visible opponent UNIT (master EXCLUDED,
    // skill-type 패시브 1 = "2" = EveryUnitField). No spell visuals yet — mythical-tier
    // effect lands in a later pass; for now just the move-and-return motion + damage.
    const NETHER_BLADE_CARD_ID = 19;
    const NETHER_BLADE_PASSIVE_DAMAGE = 10;
    // Second passive: 패시브 2 = "1" (Single), 패시브2 데미지 = 20. Auto-enters target
    // selection after passive 1 resolves. Picks an opponent unit OR the master; same
    // skill-panel move-and-return motion fires after the user clicks; THEN damage.
    const NETHER_BLADE_PASSIVE2_DAMAGE = 20;

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

        setOpponentMasterHp(opponentMasterHp - DOOM_CONTRACT_DAMAGE, 'doom contract');

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
        // 덱에서 뽑은 에너지 카드(죽음의 에너지)의 종족이 그대로 부착된다.
        const pulledRace = cardRaceOf(DEATH_ENERGY_CARD_ID) ?? CardRace.UNDEAD;
        await overflowMoraleEffect.play(deckPos, targetPos, attached, () => {
            const newCount = addCardEnergy(target, pulledRace, 1);
            void updateCardEnergyVisual(target, newCount);
        });

        // Consumed energy cards go to the tomb after the flow resolves.
        for (const energyId of pulled) tombRepo.addCard(energyId);
    };

    // ─── 시체 폭발 (Corpse Explosion) — sacrifice + 2-pick targeting state ──────
    // Picks are RECORDED (not applied) on each click — the source card stays in hand
    // and targets stay alive through both picks, so the user can legitimately point at
    // the same target twice for 20 damage on one. Damage / kill / bury / hide all run
    // in applyCorpseExplosionDamage AFTER both picks land. Hand pickup is gated off
    // while this state is active so the user can't drag another card mid-flow.
    type CorpseExplosionPick =
        | { readonly kind: 'master' }
        | { readonly kind: 'opponent'; readonly cardIndex: number };
    let corpseExplosionState: {
        sourceEntry: HandEntry;
        // The sacrificed undead unit — STAYS in placedOrder + on the field as a normal
        // unit during target selection. Removed from placedOrder + tombed + flown in
        // resolveCorpseExplosion (after the user has picked both targets) so the unit
        // visibly sits in its slot the whole time the user is picking.
        sacrificed: HandEntry;
        picks: CorpseExplosionPick[];
    } | null = null;

    const enterCorpseExplosionTargeting = (sourceEntry: HandEntry, sacrificed: HandEntry): void => {
        // Sacrificed unit STAYS in placedOrder + visible at its slot until the user
        // finishes picking. No tomb / splice / reflow here — the only state change is
        // entering the targeting mode + painting red neons on enemies.
        console.log(`[corpse-explosion] target locked: undead ally cardId=${sacrificed.card.cardId}. Pick 2 enemy targets — the sacrifice flies after both picks.`);

        corpseExplosionState = { sourceEntry, sacrificed, picks: [] };

        // Red neon on every visible opponent unit + the master body.
        for (const oe of opponentEntries) {
            if (oe.group.visible) enemyNeonEffect.attach(oe.cardIndex, oe.group);
        }
        if (opponentMasterHp > 0) {
            enemyNeonEffect.attach(FIELD_NEON_ENTITY_ID, masterGroup);
        }
    };

    // Async resolution: drives CorpseExplosionEffect (corpse flies → explodes →
    // projectiles fan out to each pick). Damage ticks per projectile arrival; the
    // visual feedback for each hit comes from the effect's per-projectile impact
    // flash, NOT flashAndShakeTarget — so no shake races against the post-effect
    // bury+reflow. After the effect resolves, dead targets get buried + hidden +
    // reflowed in one synchronous pass; the corpse mesh disposes; state exits.
    const resolveCorpseExplosion = async (): Promise<void> => {
        if (!corpseExplosionState) return;
        const state = corpseExplosionState;
        const sacrificed = state.sacrificed;

        // ── NOW remove the sacrificed unit from placedOrder + tomb it. The mesh
        // stays in handGroup at its slot position (orphan from reflow) so the
        // CorpseExplosionEffect can animate it from there. The OTHER placed
        // allies reflow to fill the empty slot in the same frame.
        tombRepo.addCard(sacrificed.card.cardId);
        const sIdx = placedOrder.indexOf(sacrificed);
        if (sIdx >= 0) placedOrder.splice(sIdx, 1);
        reflowHandAndPlaced();
        console.log(`[corpse-explosion] sacrificed undead cardId=${sacrificed.card.cardId} → tomb; corpse flies now.`);

        // Per-pick world target positions (duplicates allowed when same target is
        // picked twice; effect fires N projectiles regardless).
        const projectileTargets: THREE.Vector3[] = state.picks.map((p) => {
            if (p.kind === 'master') {
                return new THREE.Vector3(masterGroup.position.x, masterGroup.position.y, 5);
            }
            const entry = opponentEntries.find((oe) => oe.cardIndex === p.cardIndex);
            return entry
                ? new THREE.Vector3(entry.group.position.x, entry.group.position.y, 5)
                : new THREE.Vector3(0, 0, 5);
        });

        // Landing position — opponent field area CENTRE. opponentFieldAreaFrame's
        // xPercent / yPercent are already in WORLD coords (y-up, origin at screen
        // centre) — xPercent 0 = horizontal centre, yPercent 0.153 = upper half. So
        // multiply by viewport directly, NO (x-0.5) / (0.5-y) re-centering.
        const landingPos = new THREE.Vector3(
            opponentFieldAreaFrame.xPercent * window.innerWidth,
            opponentFieldAreaFrame.yPercent * window.innerHeight,
            5,
        );

        // Per-projectile arrival: tick HP for that pick. The effect handles the
        // visual impact (impact flash sprite at target position) — we don't call
        // flashAndShakeTarget so there's no shake-vs-reflow race.
        const onProjectileLand = (idx: number): void => {
            const pick = state.picks[idx];
            if (pick.kind === 'master') {
                if (opponentMasterHp > 0) {
                    setOpponentMasterHp(opponentMasterHp - CORPSE_EXPLOSION_DAMAGE, 'corpse explosion');
                }
            } else {
                const prev = opponentHpState.get(pick.cardIndex) ?? 0;
                const newHp = Math.max(0, prev - CORPSE_EXPLOSION_DAMAGE);
                opponentHpState.set(pick.cardIndex, newHp);
                const entry = opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex);
                console.log(`[corpse-explosion] projectile → opponent idx=${pick.cardIndex}${entry ? ` cardId=${entry.card.cardId}` : ''} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
            }
        };

        await corpseExplosionEffect.play(
            sacrificed.group,
            landingPos,
            projectileTargets,
            rendererManager.getDomElement(),
            onProjectileLand,
        );

        // ── Post-effect: bury + hide + reflow in one pass ──────────────────────
        const uniqueOpponentIdxs = new Set<number>();
        let masterPicked = false;
        for (const p of state.picks) {
            if (p.kind === 'master') masterPicked = true;
            else uniqueOpponentIdxs.add(p.cardIndex);
        }

        const masterDied = masterPicked && opponentMasterHp <= 0 && masterGroup.visible;
        const deadOpponentIndices: number[] = [];
        for (const idx of uniqueOpponentIdxs) {
            const hp = opponentHpState.get(idx) ?? 0;
            if (hp > 0) continue;
            const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (!entry || !entry.group.visible) continue;
            const aliveIdx = opponentAliveOrder.indexOf(idx);
            if (aliveIdx >= 0) {
                buryOpponentUnit(idx);
                opponentAliveOrder.splice(aliveIdx, 1);
            }
            deadOpponentIndices.push(idx);
        }
        for (const idx of deadOpponentIndices) {
            const e = opponentEntries.find((oe) => oe.cardIndex === idx);
            if (e) e.group.visible = false;
        }
        if (masterDied) {
            masterGroup.visible = false;
            console.log('[corpse-explosion] opponent MASTER defeated!');
        }
        if (deadOpponentIndices.length > 0) reflowOpponentField();

        // ── Dispose corpse mesh ───────────────────────────────────────────────
        handGroup.remove(sacrificed.group);
        handRenderer.getCardRenderer().dispose(sacrificed.group);

        exitCorpseExplosionTargeting();
    };

    const exitCorpseExplosionTargeting = (): void => {
        if (!corpseExplosionState) return;
        const sourceEntry = corpseExplosionState.sourceEntry;
        corpseExplosionState = null;
        enemyNeonEffect.detachAll();
        const idx = handOrder.indexOf(sourceEntry);
        if (idx >= 0) consumeHandCard(sourceEntry, idx);
        reflowHandAndPlaced();
        console.log(`[corpse-explosion] effect resolved — corpse-explosion card → tomb.`);
    };

    // ─── 레오닉의 부름 (Leonik's Summon) popup ───────────────────────────────────
    // Opens after the card is dropped on Your Field. Shows every deck card whose kind
    // is UNIT and whose grade ≤ HERO. User picks EXACTLY LEONIK_MAX_PICK; selected cards
    // get a green border. A centred "확인" button commits: picks leave the deck for the
    // hand, the Leonik card itself goes to the tomb, and the deck is shuffled.
    //
    // State is kept in outer-scope lets so the capture-phase mousedown handler can
    // branch on the popup being open (mirrors tomb/lost-zone popup pattern).
    // Custom overrides from tomb's defaults: taller popup (80% vs 60%) + double row
    // gap so the two rows sit well clear of the centre. Confirm button lives at centerY
    // (between the rows) and was overlapping card bodies with the default 0.5 gap.
    const leonikPopupFrame = {
        ...createDefaultYourTombPopupFrame(),
        topRatio:      0.10,
        bottomRatio:   0.90,
        cardGapYRatio: 1.0,
    };
    const leonikPopupRenderer = new CardGridPopupRenderer();
    const leonikCardsPerPage = leonikPopupFrame.cardColumns * leonikPopupFrame.rowsPerPage;

    let leonikPopupGroup: THREE.Group | null = null;
    let leonikPopupPage = 0;
    let leonikSourceEntry: HandEntry | null = null;
    let leonikEligibleDeckIndices: number[] = [];
    // Popup-local indices into leonikEligibleDeckIndices (absolute across all pages, not
    // just the current page) — selection persists across page turns.
    const leonikSelectedPopupIndices = new Set<number>();

    // Per-selection border meshes on the CURRENT page (absIdx → { mesh, material }).
    // Only populated for absIdx values that live on the visible page; when the page
    // turns, this map is rebuilt. Kept separate from leonikSelectedPopupIndices (which
    // is permanent selection state) so selection persists through page turns but
    // on-screen meshes are page-scoped.
    const leonikBorderByAbsIdx = new Map<number, { mesh: THREE.Mesh; material: THREE.ShaderMaterial }>();
    // Active border shader materials — the shared clock loop ticks u_time on all of
    // them so pulsation is synchronised and cheap (one RAF, not one per border).
    const leonikActivePulseMats = new Set<THREE.ShaderMaterial>();
    // Confirm button material handle — opacity updated inline on selection changes.
    let leonikConfirmMat: THREE.MeshBasicMaterial | null = null;

    // Single shared RAF loop that drives pulsation on every active border material.
    // Matches NeonBorderEffect.updateAnimation — increments `time` by timeIncrement
    // per frame (rather than reading wall-clock) so the visual cadence is identical.
    let leonikPulseRunning = false;
    const startLeonikPulseClock = (): void => {
        if (leonikPulseRunning) return;
        leonikPulseRunning = true;
        const step = () => {
            if (!leonikPulseRunning) return;
            leonikActivePulseMats.forEach((mat) => {
                mat.uniforms.time.value += leonikBorderPalette.timeIncrement;
            });
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // Build a pulsing green neon border material. Uses the SAME shader as
    // NeonBorderEffect (the effect attached when an ally card is picked up in hand) so
    // the Leonik popup's selection highlight reads identically to the rest of the game.
    // Colours come from createAllyTargetingNeonBorderFrame (green family).
    const leonikBorderPalette = createAllyTargetingNeonBorderFrame();
    const LEONIK_BORDER_THICKNESS = leonikBorderPalette.lineThickness;  // px margin around the card
    const buildLeonikBorderMaterial = (planeW: number, planeH: number): THREE.ShaderMaterial => {
        // Glow extent in UV space — shader uses min-edge distance and smoothsteps it
        // against borderX/borderY to fade the ring inward.
        const borderX = (LEONIK_BORDER_THICKNESS / 2) / planeW;
        const borderY = (LEONIK_BORDER_THICKNESS / 2) / planeH;
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                baseColor: { value: new THREE.Color(leonikBorderPalette.baseColor) },
                glowColor: { value: new THREE.Color(leonikBorderPalette.glowColor) },
                time:      { value: 0.0 },
                borderX:   { value: borderX },
                borderY:   { value: borderY },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 baseColor;
                uniform vec3 glowColor;
                uniform float time;
                uniform float borderX;
                uniform float borderY;
                varying vec2 vUv;
                void main() {
                    float dx = min(vUv.x, 1.0 - vUv.x);
                    float dy = min(vUv.y, 1.0 - vUv.y);
                    float ex = 1.0 - smoothstep(0.0, borderX, dx);
                    float ey = 1.0 - smoothstep(0.0, borderY, dy);
                    float glow = max(ex, ey);
                    float pulse = sin(time * 5.0) * 0.3 + 0.7;
                    vec3 finalColor = mix(baseColor, glowColor, pulse);
                    gl_FragColor = vec4(finalColor, glow * pulse * 0.85);
                }
            `,
        });
    };

    // Given an absIdx, return its (col, row) position on the CURRENT page, or null if
    // the index is on a different page. Used by addBorder for positioning + by the
    // page-turn rebuild to reseat border meshes.
    const leonikCardPositionForAbsIdx = (absIdx: number): { cx: number; cy: number; cw: number; ch: number } | null => {
        const start = leonikPopupPage * leonikCardsPerPage;
        const end = start + leonikCardsPerPage;
        if (absIdx < start || absIdx >= end) return null;
        const i = absIdx - start;
        const bounds = computeCardGridPopupBounds(leonikPopupFrame, window.innerWidth, window.innerHeight);
        const cw = window.innerWidth * createDefaultHandCardFrame().cardWidthRatio;
        const ch = cw * createDefaultHandCardFrame().cardAspect;
        const stepX = cw * (1 + leonikPopupFrame.cardGapXRatio);
        const stepY = ch * (1 + leonikPopupFrame.cardGapYRatio);
        const cols = Math.max(1, leonikPopupFrame.cardColumns);
        const originX = bounds.centerX - ((cols - 1) * stepX) / 2;
        const pageRows = Math.max(1, leonikPopupFrame.rowsPerPage);
        const originY = bounds.centerY + ((pageRows - 1) * stepY) / 2;
        const col = i % cols;
        const row = Math.floor(i / cols);
        return { cx: originX + col * stepX, cy: originY - row * stepY, cw, ch };
    };

    // Add a pulsing border mesh for the given absIdx (if on the current page). Idempotent.
    // Plane is card-dimensions + thickness on each side (matches NeonBorderEffect's sizing).
    const addLeonikBorder = (absIdx: number): void => {
        if (!leonikPopupGroup) return;
        if (leonikBorderByAbsIdx.has(absIdx)) return;
        const pos = leonikCardPositionForAbsIdx(absIdx);
        if (!pos) return;
        const planeW = pos.cw + LEONIK_BORDER_THICKNESS * 2;
        const planeH = pos.ch + LEONIK_BORDER_THICKNESS * 2;
        const material = buildLeonikBorderMaterial(planeW, planeH);
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(pos.cx, pos.cy, leonikBorderPalette.zOffset);
        mesh.renderOrder = leonikPopupFrame.renderOrder + 5;
        leonikPopupGroup.add(mesh);
        leonikBorderByAbsIdx.set(absIdx, { mesh, material });
        leonikActivePulseMats.add(material);
    };

    // Remove a specific border mesh + dispose. Idempotent.
    const removeLeonikBorder = (absIdx: number): void => {
        if (!leonikPopupGroup) return;
        const entry = leonikBorderByAbsIdx.get(absIdx);
        if (!entry) return;
        leonikPopupGroup.remove(entry.mesh);
        entry.mesh.geometry.dispose();
        entry.material.dispose();
        leonikActivePulseMats.delete(entry.material);
        leonikBorderByAbsIdx.delete(absIdx);
    };

    // Re-tint the confirm button's material based on current selection count.
    const updateLeonikConfirmState = (): void => {
        if (!leonikConfirmMat) return;
        const active = leonikSelectedPopupIndices.size === LEONIK_MAX_PICK;
        leonikConfirmMat.opacity = active ? 1.0 : 0.45;
    };

    const collectLeonikEligibleIndices = (): number[] => {
        const out: number[] = [];
        const cards = deckRepo.getCards();
        for (let i = 0; i < cards.length; i++) {
            const cardData = getCardById(cards[i]);
            if (!cardData) continue;
            const kind = parseInt(cardData.종류, 10) as CardKind;
            const grade = parseInt(cardData.등급, 10);
            if (kind === CardKind.UNIT && grade <= LEONIK_MAX_GRADE) out.push(i);
        }
        return out;
    };

    const leonikTotalPages = (): number =>
        Math.max(1, Math.ceil(leonikEligibleDeckIndices.length / leonikCardsPerPage));

    // Cached confirm-button texture so rebuilds don't re-render the canvas.
    let leonikConfirmTexture: THREE.CanvasTexture | null = null;
    const buildLeonikConfirmTexture = (): THREE.CanvasTexture => {
        if (leonikConfirmTexture) return leonikConfirmTexture;
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        // Rounded dark-gold plate with "확인" text.
        const radius = 24;
        ctx.fillStyle = '#2d1f08';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffd868';
        ctx.font = 'bold 60px "Inter", "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('확인', canvas.width / 2, canvas.height / 2 + 2);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        leonikConfirmTexture = tex;
        return tex;
    };

    const buildLeonikPopupForCurrentPage = async (): Promise<THREE.Group> => {
        const start = leonikPopupPage * leonikCardsPerPage;
        const pageDeckIndices = leonikEligibleDeckIndices.slice(start, start + leonikCardsPerPage);
        const deckCards = deckRepo.getCards();
        const pageCardIds = pageDeckIndices.map((di) => deckCards[di]);
        const resolved = resolveCards(pageCardIds, 'leonik');
        const group = await leonikPopupRenderer.build(leonikPopupFrame, resolved);

        const bounds = computeCardGridPopupBounds(leonikPopupFrame, window.innerWidth, window.innerHeight);

        // Confirm button — centred at popup centre, between prev/next pagination buttons.
        // Material handle stashed so selection-change handlers can re-tint without
        // rebuilding the whole popup (that's what caused the flicker before).
        const confirmTex = buildLeonikConfirmTexture();
        const confirmMat = new THREE.MeshBasicMaterial({ map: confirmTex, transparent: true });
        // Slightly smaller button (was 0.16) — the confirm plate was too prominent.
        const btnW = bounds.width * 0.12;
        const btnH = btnW * 0.5;
        const confirmGeo = new THREE.PlaneGeometry(btnW, btnH);
        const confirmMesh = new THREE.Mesh(confirmGeo, confirmMat);
        confirmMesh.position.set(bounds.centerX, bounds.centerY, 0);
        confirmMesh.renderOrder = leonikPopupFrame.renderOrder + 12;
        confirmMesh.userData.buttonType = 'confirm';
        confirmMat.opacity = leonikSelectedPopupIndices.size === LEONIK_MAX_PICK ? 1.0 : 0.45;
        group.add(confirmMesh);
        leonikConfirmMat = confirmMat;

        return group;
    };

    // Populate border meshes for every selected absIdx that lives on the CURRENT page.
    // Called after the popup group is built (on open + on page turn).
    const refreshLeonikBordersForPage = (): void => {
        // Clear any stale entries (in case the map wasn't cleared — belt + braces).
        leonikBorderByAbsIdx.forEach((_entry, absIdx) => removeLeonikBorder(absIdx));
        leonikBorderByAbsIdx.clear();
        leonikSelectedPopupIndices.forEach((absIdx) => addLeonikBorder(absIdx));
    };

    const openLeonikPopup = async (sourceEntry: HandEntry): Promise<void> => {
        if (leonikPopupGroup) return;
        // Modal mutex — close every other centred popup first.
        if (lostZonePopupGroup) closeLostZonePopup();
        if (opponentLostZonePopupGroup) closeOpponentLostZonePopup();
        if (tombPopupGroup) closeTombPopup();
        if (opponentTombPopupGroup) closeOpponentTombPopup();

        leonikSourceEntry = sourceEntry;
        leonikEligibleDeckIndices = collectLeonikEligibleIndices();
        leonikSelectedPopupIndices.clear();
        leonikPopupPage = 0;

        if (leonikEligibleDeckIndices.length === 0) {
            console.log('[leonik] no eligible deck cards (hero-or-below UNIT) — effect no-ops');
            // Still consume the card per spec (card is used regardless of result).
            const idx = handOrder.indexOf(sourceEntry);
            if (idx >= 0) consumeHandCard(sourceEntry, idx);
            deckRepo.shuffle();
            leonikSourceEntry = null;
            reflowHandAndPlaced();
            return;
        }

        leonikPopupGroup = await buildLeonikPopupForCurrentPage();
        scene.add(leonikPopupGroup);
        refreshLeonikBordersForPage();
        startLeonikPulseClock();
    };

    const closeLeonikPopup = (): void => {
        if (!leonikPopupGroup) return;
        // Dispose per-selection border materials first (the popup renderer's dispose
        // walks the whole tree, but the pulse set needs to be cleared explicitly).
        leonikBorderByAbsIdx.forEach((_entry, absIdx) => removeLeonikBorder(absIdx));
        leonikBorderByAbsIdx.clear();
        leonikActivePulseMats.clear();
        leonikPulseRunning = false;

        scene.remove(leonikPopupGroup);
        leonikPopupRenderer.dispose(leonikPopupGroup);
        leonikPopupGroup = null;
        leonikConfirmMat = null;
        leonikPopupPage = 0;
        leonikSelectedPopupIndices.clear();
        leonikEligibleDeckIndices = [];
        leonikSourceEntry = null;
    };

    const reloadLeonikPopup = async (): Promise<void> => {
        if (!leonikPopupGroup) return;
        // Tear down current page's borders (new page = new card positions).
        leonikBorderByAbsIdx.forEach((_entry, absIdx) => removeLeonikBorder(absIdx));
        leonikBorderByAbsIdx.clear();

        scene.remove(leonikPopupGroup);
        leonikPopupRenderer.dispose(leonikPopupGroup);
        leonikPopupGroup = await buildLeonikPopupForCurrentPage();
        scene.add(leonikPopupGroup);
        refreshLeonikBordersForPage();
    };

    // Hit-test: which popup-local index sits under (worldX, worldY)? Returns the
    // ABSOLUTE eligibleDeckIndices index (not page-relative). Returns -1 if no card.
    const hitLeonikPopupCard = (worldX: number, worldY: number): number => {
        const bounds = computeCardGridPopupBounds(leonikPopupFrame, window.innerWidth, window.innerHeight);
        const cw = window.innerWidth * createDefaultHandCardFrame().cardWidthRatio;
        const ch = cw * createDefaultHandCardFrame().cardAspect;
        const stepX = cw * (1 + leonikPopupFrame.cardGapXRatio);
        const stepY = ch * (1 + leonikPopupFrame.cardGapYRatio);
        const cols = Math.max(1, leonikPopupFrame.cardColumns);
        const originX = bounds.centerX - ((cols - 1) * stepX) / 2;
        const pageRows = Math.max(1, leonikPopupFrame.rowsPerPage);
        const originY = bounds.centerY + ((pageRows - 1) * stepY) / 2;

        const start = leonikPopupPage * leonikCardsPerPage;
        const pageLen = Math.min(
            leonikCardsPerPage,
            leonikEligibleDeckIndices.length - start,
        );
        for (let i = 0; i < pageLen; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx = originX + col * stepX;
            const cy = originY - row * stepY;
            if (
                worldX >= cx - cw / 2 && worldX <= cx + cw / 2 &&
                worldY >= cy - ch / 2 && worldY <= cy + ch / 2
            ) {
                return start + i;
            }
        }
        return -1;
    };

    const confirmLeonikSummon = async (): Promise<void> => {
        if (leonikSelectedPopupIndices.size !== LEONIK_MAX_PICK) return;
        if (!leonikSourceEntry) return;

        // Capture source entry before closeLeonikPopup nulls it.
        const sourceEntry = leonikSourceEntry;

        // Map popup-local indices → absolute deck indices, remove in descending order so
        // earlier removals don't shift later indices.
        const selectedDeckIndices = Array.from(leonikSelectedPopupIndices)
            .map((i) => leonikEligibleDeckIndices[i])
            .sort((a, b) => b - a);
        const pulledIds: number[] = [];
        for (const deckIdx of selectedDeckIndices) {
            const id = deckRepo.removeAt(deckIdx);
            if (id != null) pulledIds.push(id);
        }

        // Tear down the popup BEFORE the effect plays — the gate visual sits centred
        // and would be hidden behind a popup overlay otherwise.
        closeLeonikPopup();

        // Hand baseline — same recipe as the swamp-effect destination calc. Cards
        // arrive near the centre of the hand baseline; reflowHandAndPlaced shifts them
        // into actual position after appendCard.
        const handBaselineY =
            handLayoutFrame.baselineYHeightRatio * window.innerHeight +
            handLayoutFrame.baselineYWidthOffsetRatio * window.innerWidth;
        const handDestinations = pulledIds.map((_id, i) => new THREE.Vector3(
            // Slight x-spread so the two cards visibly arrive at different spots.
            (i - (pulledIds.length - 1) / 2) * 80,
            handBaselineY,
            5,
        ));

        const gateCenter = new THREE.Vector3(0, 0, 5);

        // Per-card onArrive callback: appendCard at landing time. The placeholder
        // mesh fades out a beat after onArrive fires so the swap reads as the card
        // materialising into the hand.
        await leonikSummonEffect.play(
            gateCenter,
            handDestinations,
            rendererManager.getDomElement(),
            (idx: number) => {
                const id = pulledIds[idx];
                const resolved = resolveCards([id], 'leonik-summon');
                if (resolved.length === 0) return;
                void (async () => {
                    const newEntry = await handRenderer.appendCard(handGroup, resolved[0], handCardFrame);
                    handOrder.push(newEntry);
                    reflowHandAndPlaced();
                })();
            },
        );

        // After effect fully resolves: Leonik → tomb + deck shuffle.
        const idx = handOrder.indexOf(sourceEntry);
        if (idx >= 0) consumeHandCard(sourceEntry, idx);
        deckRepo.shuffle();
        reflowHandAndPlaced();

        console.log(`[leonik] pulled ${pulledIds.join(',')} from deck → hand; leonik → tomb; deck shuffled; remaining=${deckRepo.getRemainingCount()}`);
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
            // Block pickup while a 시체 폭발 2-pick targeting flow OR a 네더 블레이드
            // passive 2 single-pick flow is in progress — neither card flow should be
            // interruptible by another hand action.
            canPickup: () =>
                turnStateRepo.getOwner() === 'your' &&
                corpseExplosionState === null &&
                netherBladePassive2State === null,
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

                // 파멸의 계약 / 죽음의 대지 → red targeting border on the opponent FIELD
                // AREA AS A WHOLE (not individual units). Uses a dedicated wrapper host
                // with the right userData keys so NeonBorderEffect sizes the glow to the
                // field rectangle.
                if (
                    pickedCardId === DOOM_CONTRACT_CARD_ID ||
                    pickedCardId === DEAD_LANDS_CARD_ID
                ) {
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

                // 망자의 늪 / 레오닉의 부름 → green targeting border on the WHOLE YOUR
                // FIELD AREA (not individual placed cards). Same wrapper-host trick as
                // doom contract's opponent-field highlight, just on the player side with
                // green neon.
                if (
                    pickedCardId === SWAMP_OF_DEAD_CARD_ID ||
                    pickedCardId === LEONIK_SUMMON_CARD_ID
                ) {
                    allyTargetNeonEffect.attach(FIELD_NEON_ENTITY_ID, yourFieldNeonHost);
                }

                // 시체 폭발 → green targeting border on UNDEAD allies ONLY (not all
                // placed allies). The card requires an undead sacrifice; non-undead
                // allies are not valid drop targets so they shouldn't pulse green.
                // If no undead exists, the loop attaches nothing — drop will snap back.
                if (pickedCardId === CORPSE_EXPLOSION_CARD_ID) {
                    let undeadCount = 0;
                    for (let i = 0; i < placedOrder.length; i++) {
                        const entry = placedOrder[i];
                        if (!entry.group.visible) continue;
                        if (entry.card.raceId !== CardRace.UNDEAD) continue;
                        allyTargetNeonEffect.attach(i, entry.group);
                        undeadCount++;
                    }
                    if (undeadCount === 0) {
                        console.log('[corpse-explosion] no undead ally on field — drop will snap back');
                    }
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
                    } else if (cardId === CORPSE_EXPLOSION_CARD_ID) {
                        // 시체 폭발 — MUST land on an UNDEAD ally. Snap back if hit nothing
                        // or hit a non-undead ally. On valid hit: sacrifice that ally + enter
                        // the 2-pick targeting state (DO NOT consume corpse-explosion yet —
                        // it's consumed at the end of the second damage pick).
                        const allyTarget = hitAllyAt(dropCx, dropCy);
                        if (allyTarget && allyTarget.card.raceId === CardRace.UNDEAD) {
                            enterCorpseExplosionTargeting(droppedEntry, allyTarget);
                        } else if (allyTarget) {
                            console.log(`[corpse-explosion] target cardId=${allyTarget.card.cardId} is not UNDEAD — snap back`);
                        } else {
                            console.log('[corpse-explosion] drop missed any placed ally — snap back');
                        }
                    } else if (cardId === DEAD_LANDS_CARD_ID) {
                        // 죽음의 대지 — MUST land on the OPPONENT field area (same bounds
                        // check as 파멸의 계약). On hit: card → tomb immediately, then the
                        // DeadLandsEffect plays. The count decrement fires at the effect's
                        // SHATTER peak (~1.3 s in), NOT at drop time — so the visual
                        // tearing/shattering of the HUD is in sync with the number drop.
                        const oHalfW = (opponentFieldAreaFrame.widthPercent  * window.innerWidth)  / 2;
                        const oHalfH = (opponentFieldAreaFrame.heightPercent * window.innerHeight) / 2;
                        const oCX = opponentFieldAreaFrame.xPercent * window.innerWidth;
                        const oCY = opponentFieldAreaFrame.yPercent * window.innerHeight;
                        const insideOppField =
                            dropCx >= oCX - oHalfW && dropCx <= oCX + oHalfW &&
                            dropCy >= oCY - oHalfH && dropCy <= oCY + oHalfH;
                        if (insideOppField) {
                            consumeHandCard(droppedEntry, handIndex);

                            // Resolve the opponent HUD's world centre + world size from the
                            // shaded-area bounds (same frame that defines the 180°-mirror).
                            const bounds = computeOpponentFieldEnergyBounds(
                                opponentFieldEnergyAreaFrame,
                                window.innerWidth,
                                window.innerHeight,
                            );
                            const targetWorld = new THREE.Vector3(bounds.centerX, bounds.centerY, 5);

                            void deadLandsEffect.play(
                                targetWorld,
                                { width: bounds.width, height: bounds.height },
                                opponentEnergyElement,
                                rendererManager.getDomElement(),
                                () => {
                                    const prev = opponentAvailableEnergy;
                                    opponentAvailableEnergy = Math.max(0, prev - DEAD_LANDS_DRAIN);
                                    opponentEnergyRenderer.setEnergy(opponentAvailableEnergy);
                                    opponentEnergyRenderer.update(opponentEnergyFrame, opponentEnergyElement, window.innerWidth, window.innerHeight);
                                    console.log(`[dead-lands] opponent field energy ${prev} → ${opponentAvailableEnergy} (drained ${prev - opponentAvailableEnergy})`);
                                },
                            );
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
                    // 출격한 턴을 기록 — 이번 턴에는 공격/스킬 패널이 열리지 않는다.
                    deployedTurn.set(droppedEntry, currentTurn);
                    // 출격 시 — entrance scene → passive chain. Fire-and-forget; the
                    // placement reflow at the bottom of onDrop runs synchronously first.
                    // The entrance is deploy-ONLY (no replay on turn-start).
                    if (cardId === NETHER_BLADE_CARD_ID) {
                        const entry = droppedEntry;
                        void (async () => {
                            // 새 체인의 시작 — 이전 턴에 중단됐던 플래그를 여기서 푼다.
                            passiveChainAborted = false;
                            await runResolving(() =>
                                netherBladeEntranceEffect.play(rendererManager.getDomElement()),
                            );
                            if (passiveChainAborted) return;
                            await triggerNetherBladePassive(entry);
                        })();
                    }
                } else if (inside && kind === CardKind.SUPPORT && cardId === SWAMP_OF_DEAD_CARD_ID) {
                    // 망자의 늪 — draw 3 and consume (goes to tomb via consumeHandCard).
                    void applySwampEffect();
                    consumeHandCard(droppedEntry, handIndex);
                } else if (inside && kind === CardKind.SUPPORT && cardId === LEONIK_SUMMON_CARD_ID) {
                    // 레오닉의 부름 — opens a picker popup. DO NOT consume the card yet —
                    // the popup's confirm handler calls consumeHandCard itself once the user
                    // picks their 2 cards and clicks 확인. Dropping outside Your Field just
                    // snaps back unused (handled by the `inside &&` guard).
                    void openLeonikPopup(droppedEntry);
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
                } else if (
                    kind === CardKind.ENERGY &&
                    (cardId === DEATH_ENERGY_CARD_ID || cardId === COLD_DARK_ENERGY_CARD_ID)
                ) {
                    // 죽음의 에너지 / 차갑게 불타는 암흑 에너지 —
                    // drop onto a placed ally to attach 1 energy. The card
                    // itself is consumed (handled by consumeHandCard → tomb). No field
                    // energy is spent; this is a hand-to-unit direct attach.
                    //
                    // Effect reuses the OverflowMoraleEffect.playDirectAttach variant so
                    // the "gather around target → impact (shockwave + flash + shrink)"
                    // visual beat matches the energies arriving from Overflowing Morale.
                    // The card is consumed immediately so the hand reflows before the
                    // effect finishes; the energy count bump is deferred to the impact
                    // callback so it ticks exactly when the shockwave fires.
                    const dropCx = group.position.x;
                    const dropCy = group.position.y;
                    const allyTarget = hitAllyAt(dropCx, dropCy);
                    if (allyTarget) {
                        consumeHandCard(droppedEntry, handIndex);
                        const targetWorld = new THREE.Vector3(
                            allyTarget.group.position.x,
                            allyTarget.group.position.y,
                            5,
                        );
                        // 손패에서 직접 떨군 에너지 카드 자신의 종족이 부착된다.
                        const droppedRace = cardRaceOf(cardId) ?? CardRace.UNDEAD;
                        const isColdDark = cardId === COLD_DARK_ENERGY_CARD_ID;
                        void overflowMoraleEffect.playDirectAttach(targetWorld, () => {
                            const newCount = addCardEnergy(allyTarget, droppedRace, 1);
                            void updateCardEnergyVisual(allyTarget, newCount);
                            if (isColdDark) {
                                // 종족 에너지 부여에 더해 암흑 화염 + 빙결 부여 능력이 붙는다.
                                // 부여 사실은 카드에 붙는 두 마크가 알리므로 배너는 띄우지 않는다.
                                coldDarkEnergyHolders.add(allyTarget);
                                attachColdDarkTraitMarks(allyTarget);
                            }
                            console.log(`[${isColdDark ? 'cold-dark-energy' : 'death-energy'}] attached ${RACE_LABEL[droppedRace]} 1 → placed cardId=${allyTarget.card.cardId} total=${newCount}`);
                        });
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

    // Opponent field energy HUD — 180° mirror of the player's (top 82.4%, left 90.4%)
    // around screen centre. The horizontal mirror is trivial: left = 100% - 90.4% - 7.2%
    // = 2.4%. The vertical mirror is SUBTLE: the HUD's height depends on viewport width
    // (image aspect 638/622 × widthPercent × vw), so a static `topPercent` would drift
    // at non-16:9 aspects. Instead anchor by the BOTTOM edge — "bottom: 82.4%" puts the
    // HUD's bottom edge at (100-82.4)=17.6% vh from top, the exact mirror of the player's
    // static TOP edge at 82.4% vh. This matches the opponent shaded-area mesh whose
    // stable anchor is also bottomEdgeYRatio = 0.176.
    let opponentAvailableEnergy = 15;
    const opponentEnergyFrame = {
        ...createDefaultFieldEnergyHudFrame(),
        // topPercent is left as-is; the style override below replaces it with a
        // bottom-edge anchor (topPercent becomes irrelevant post-override).
        leftPercent: '2.4%',
    };
    const opponentEnergyRenderer = new FieldEnergyHudRendererV2(opponentAvailableEnergy);
    const opponentEnergyElement = await opponentEnergyRenderer.build(opponentEnergyFrame);
    opponentEnergyElement.style.top = 'auto';
    opponentEnergyElement.style.bottom = '82.4%';
    document.body.appendChild(opponentEnergyElement);

    // Opponent field-energy SHADED AREA — a Three.js mesh at the 180°-mirror of the
    // player's Field Energy HUD. This is the visual target for the upcoming 죽음의 대지
    // drain effect (dark motes will converge here). Opacity 0.6 for position verification
    // now; once the final effect + position are confirmed the opacity drops to 0.
    const opponentFieldEnergyAreaFrame = createDefaultOpponentFieldEnergyAreaFrame();
    const opponentFieldEnergyAreaRenderer = new OpponentFieldEnergyAreaRendererV2();
    const opponentFieldEnergyAreaGroup =
        await opponentFieldEnergyAreaRenderer.build(opponentFieldEnergyAreaFrame);
    scene.add(opponentFieldEnergyAreaGroup);

    const raceFrame = createDefaultFieldEnergyRaceHudFrame(1);
    const raceRenderer = new FieldEnergyRaceHudRendererV2();
    const raceElement = await raceRenderer.build(raceFrame);
    document.body.appendChild(raceElement);

    const countFrame = createDefaultFieldEnergyCountHudFrame();
    const countRenderer = new FieldEnergyCountHudRendererV2(1);
    const countElement = await countRenderer.build(countFrame);
    document.body.appendChild(countElement);

    let fieldEnergyChargeCount = 1;

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

    // ── 턴 전환 단일 진입점 ───────────────────────────────────────────────────────
    // Both transitions have two triggers now (button/hourglass, 'f' key/hourglass), so the
    // side effects live in one function each instead of being duplicated per trigger.

    // your → opponent. Triggers: 턴 종료 버튼 클릭, 모래시계 만료.
    // No-op unless it's currently your turn (idempotent).
    function endYourTurn(reason: string): void {
        if (turnStateRepo.getOwner() !== 'your') return;
        turnStateRepo.setOwner('opponent');
        timerRenderer.reset(timerElement);
        guideRenderer.show(guideElement, '상대방의 턴입니다.', 3000);
        console.log(`[turn-state] your → opponent (${reason}) · TURN ${currentTurn}`);
        // 상대 턴 시작 시점 — 암흑 화염 화상 피해를 여기서 정산한다.
        tickDarkFlameDamage();
    }

    // opponent → your. Triggers: 'f' 키, 모래시계 만료. Each full opponent→your cycle counts
    // as one turn, so we (a) increment TURN, (b) bump the main FIELD ENERGY by 1, (c) restart
    // the 60 s hourglass, and (d) DRAW one card from your deck into your hand (standard
    // turn-start draw), plus (e) announce the handback on the guide banner. No-op unless it's
    // currently the opponent's turn (idempotent).
    async function beginYourTurn(reason: string): Promise<void> {
        if (turnStateRepo.getOwner() !== 'opponent') {
            console.log(`[turn-state] ${reason} ignored — already your turn`);
            return;
        }
        turnStateRepo.setOwner('your');
        guideRenderer.show(guideElement, '당신의 턴입니다.', 3000);

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

        // 빙결 해제 — 상대 턴 내내 얼어 있던 유닛이 이 시점에 녹는다.
        // 화상 피해는 여기가 아니라 상대 턴 시작(endYourTurn)에서 정산한다.
        tickFreezeExpiry();

        console.log(`[turn-state] opponent → your (${reason}) · TURN ${currentTurn} · field energy ${availableEnergy}`);

        // ── 네더 블레이드 매 턴 패시브 풀체인 발동 ─────────────────────────
        // Each placed + alive Nether Blade re-fires passive 1 (AoE) → passive 2 (single
        // pick) every turn. enterNetherBladePassive2 returns a Promise that resolves
        // when the user finishes their pick, so multiple Nether Blades cleanly take
        // turns: NB#1 AoE → NB#1 picker (modal, awaits user click) → NB#2 AoE → … .
        const netherBladesOnField = placedOrder.filter(
            (e) => e.card.cardId === NETHER_BLADE_CARD_ID && e.group.visible,
        );
        passiveChainAborted = false;
        for (const entry of netherBladesOnField) {
            if (passiveChainAborted) {
                console.log('[nether-blade] 턴이 넘어가 남은 패시브 체인 중단');
                break;
            }
            console.log(`[nether-blade] turn-start passive chain · TURN ${currentTurn}`);
            await triggerNetherBladePassive(entry);
        }
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key !== 'f' && e.key !== 'F') return;
        void beginYourTurn(`'f' key`);
    });

    // ── 모래시계 만료 → 자동 턴 넘김 ──────────────────────────────────────────────
    // 만료 시점에 턴을 쥔 쪽이 턴을 잃는다. 단, 선택이 완료되어 되돌릴 수 없는 동작이
    // 진행 중이면 즉시 넘기지 않고 보류한다 — runResolving의 finally가 동작 종료 직후
    // passTurnOnExpiry를 호출하고, 거기서 타이머가 새로 시작된다. 타겟팅 중(선택 미완료)
    // 이라면 cancelPendingTargeting이 아무 일도 없던 상태로 되돌린 뒤 그대로 넘어간다.
    timerRenderer.setOnExpire(timerElement, () => {
        if (resolvingDepth > 0) {
            turnPassDeferred = true;
            console.log('[turn-state] 모래시계 만료 — 진행 중인 동작 완료 후 턴 넘김 예약');
            return;  // 여기서 타이머를 재시작하지 않는다. 동작이 끝난 시점부터 다시 돈다.
        }
        passTurnOnExpiry('timer expired');
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
        opponentEnergyRenderer.update(opponentEnergyFrame, opponentEnergyElement, width, height);
        opponentFieldEnergyAreaRenderer.resize(opponentFieldEnergyAreaFrame, opponentFieldEnergyAreaGroup, width, height);
        raceRenderer.update(raceFrame, raceElement, width, height);
        countRenderer.update(countFrame, countElement, width, height);
        guideRenderer.update(guideFrame, guideElement, width, height);
        timerRenderer.update(timerFrame, timerElement, width, height);
        turnRenderer.update(turnFrame, turnElement, width, height);
        masterHpRenderer.resize(masterHpFrame, masterHpGroup, width, height);
        opponentMasterHpRenderer.resize(opponentMasterHpFrame, opponentMasterHpGroup, width, height);
    });
}

main(rootElement).catch((error) => {
    console.error('draw_field_energy_full_efr failed to start:', error);
});
