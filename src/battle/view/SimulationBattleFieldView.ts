import { CameraManager } from "../../core/camera/CameraManager";
import { SeaOfSpecterEffect } from "../animation/skill/veln/SeaOfSpecterEffect";
import { installTween } from "../../core/tween/Tween";
import { HandCard } from "../../battle/domain/HandCard";
import { BattleCommandHandler, CardCatalog } from "../../battle/flow/BattleCommandHandler";
import { BattleCommand } from "../../battle/flow/BattleCommand";
import { BattleEvent } from "../../battle/flow/BattleEvent";
import { FieldCard } from "../../battle/domain/FieldCard";
import { findCardAbility, cardIdsTargeting } from "../../battle/ability/CardAbility";
import { AbilityTarget } from "../../battle/ability/AbilityTarget";
import { RendererManager } from "../../core/renderer/RendererManager";
import { SceneManager } from "../../core/scene/SceneManager";
import { AnimationLoop } from "../../core/animation/AnimationLoop";
import { AudioController } from "../../audio/AudioController";
import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';

import { createBattleFieldBackgroundFrame } from "../../background/frame/BackgroundFrame";
import { BackgroundRendererV2 } from "../../background/renderer/BackgroundRendererV2";

import {
    createDefaultYourFieldAreaFrame,
    computeYourFieldAreaBounds,
} from "../../battle/field/your/area/frame/YourFieldAreaFrame";
import { YourFieldAreaRendererV2 } from "../../battle/field/your/area/renderer/YourFieldAreaRendererV2";
import {
    createDefaultPlacedCardPlacementFrame,
    computePlacedCardPosition,
} from "../../battle/field/your/area/frame/PlacedCardPlacementFrame";

import { createDefaultOpponentFieldAreaFrame } from "../../battle/field/opponent/area/frame/OpponentFieldAreaFrame";
import { OpponentFieldAreaRendererV2 } from "../../battle/field/opponent/area/renderer/OpponentFieldAreaRendererV2";
import { createDefaultOpponentFieldLayoutFrame } from "../../battle/field/opponent/frame/OpponentFieldLayoutFrame";
import { OpponentFieldRendererV2 } from "../../battle/field/opponent/renderer/OpponentFieldRendererV2";

import { CardFace } from "../../battle/hand/entity/CardFace";
import { HandEntry } from "../../battle/hand/renderer/BattleFieldHandRendererV2";
import { createDefaultHandCardFrame } from "../../battle/hand/frame/HandCardFrame";
import {
    createDefaultBattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../../battle/hand/frame/BattleFieldHandLayoutFrame";
import { BattleFieldHandRendererV2 } from "../../battle/hand/renderer/BattleFieldHandRendererV2";
import { HandInteractionBridge } from "../../battle/hand/interaction/HandInteractionBridge";

import { createDefaultHandPageButtonsFrame } from "../../battle/hand/page/frame/HandPageButtonsFrame";
import { HandPageButtonsRendererV2 } from "../../battle/hand/page/renderer/HandPageButtonsRendererV2";

import * as THREE from "three";

import { getCardById } from "../../card/utility";
import { CardJob } from "../../card/job";
import { CardKind } from "../../card/kind";
import { CardRace } from "../../card/race";
import { CardGrade } from "../../card/grade";
import { getSkillType, SkillType } from "../../card/SkillType";

import { createDefaultFieldEnergyHudFrame } from "../../battle/field_energy/your/frame/FieldEnergyHudFrame";
import { FieldEnergyHudRendererV2 } from "../../battle/field_energy/your/renderer/FieldEnergyHudRendererV2";
import { createDefaultFieldEnergyRaceHudFrame } from "../../battle/field_energy/your/frame/FieldEnergyRaceHudFrame";
import { FieldEnergyRaceHudRendererV2 } from "../../battle/field_energy/your/renderer/FieldEnergyRaceHudRendererV2";
import { createDefaultFieldEnergyCountHudFrame } from "../../battle/field_energy/your/frame/FieldEnergyCountHudFrame";
import { FieldEnergyCountHudRendererV2 } from "../../battle/field_energy/your/renderer/FieldEnergyCountHudRendererV2";

import {
    createAllyNeonBorderFrame,
    createEnemyNeonBorderFrame,
    createAllyTargetingNeonBorderFrame,
} from "../../neon_border/frame/NeonBorderFrame";
import { NeonBorderEffect } from "../../neon_border/effect/NeonBorderEffect";

import { createDefaultActivePanelFrame, ActivePanelButtonSpec } from "../../battle/active_panel/frame/ActivePanelFrame";
import { ActivePanelRendererV2 } from "../../battle/active_panel/renderer/ActivePanelRendererV2";
import { AttackAnimationV2 } from "../../battle/animation/attack/AttackAnimationV2";
import { createCardSkillPositionFrame } from "../../animation/skill/frame/CardSkillPositionFrame";
import { CardMoveEasing, moveCard } from "../../animation/motion/CardMove";
import { FrozenBurningOverlayEffect } from "../../battle/animation/card/energy/151_cold_dark_energy/FrozenBurningOverlayEffect";
import { ColdDarkTraitMarkEffect } from "../../battle/animation/card/energy/151_cold_dark_energy/ColdDarkTraitMarkEffect";
import { ScytheCutEffect } from "../../battle/animation/card/item/008_scythe/ScytheCutEffect";
import { EnergyBurnEffect } from "../../battle/animation/card/item/009_energy_burn/EnergyBurnEffect";
import { DoomContractEffect } from "../../battle/animation/card/item/025_doom_contract/DoomContractEffect";
import { CorpseExplosionEffect } from "../../battle/animation/card/item/033_corpse_explosion/CorpseExplosionEffect";
import { DeadLandsEffect } from "../../battle/animation/card/item/036_dead_lands/DeadLandsEffect";
import { LeonikSummonEffect } from "../../battle/animation/card/support/030_leonik_summon/LeonikSummonEffect";
import { NetherBladeEntranceEffect } from "../../battle/animation/card/unit/019_nether_blade/entrance/NetherBladeEntranceEffect";
import { NetherBladeFirstPassiveEffect } from "../../battle/animation/card/unit/019_nether_blade/skill/NetherBladeFirstPassiveEffect";
import { NetherBladeSecondPassiveEffect } from "../../battle/animation/card/unit/019_nether_blade/skill/NetherBladeSecondPassiveEffect";
import { MoraleConvertEffect } from "../../battle/animation/card/item/035_morale_convert/MoraleConvertEffect";
import { OverflowMoraleEffect } from "../../battle/animation/card/support/002_overflow_morale/OverflowMoraleEffect";
import { SwampEffect } from "../../battle/animation/card/support/020_swamp/SwampEffect";

import {
    createDefaultYourLostZonePanelFrame,
    computeYourLostZonePanelBounds,
} from "../../battle/zone/your_lost_zone/frame/YourLostZonePanelFrame";
import {
    createDefaultYourLostZonePopupFrame,
} from "../../battle/zone/your_lost_zone/frame/YourLostZonePopupFrame";
import { computeCardGridPopupBounds } from "../../battle/card_grid_popup/frame/CardGridPopupFrame";
import { YourLostZonePanelRendererV2 } from "../../battle/zone/your_lost_zone/renderer/YourLostZonePanelRendererV2";
import { CardGridPopupRenderer } from "../../battle/card_grid_popup/renderer/CardGridPopupRenderer";

import {
    createDefaultOpponentLostZonePanelFrame,
    computeOpponentLostZonePanelBounds,
} from "../../battle/zone/opponent_lost_zone/frame/OpponentLostZonePanelFrame";

import {
    createDefaultYourTombPanelFrame,
    isPointInsideYourTomb,
} from "../../battle/zone/your_tomb/frame/YourTombPanelFrame";
import { createDefaultYourTombPopupFrame } from "../../battle/zone/your_tomb/frame/YourTombPopupFrame";
import { YourTombPanelRendererV2 } from "../../battle/zone/your_tomb/renderer/YourTombPanelRendererV2";

import {
    createDefaultOpponentTombPanelFrame,
    isPointInsideOpponentTomb,
} from "../../battle/zone/opponent_tomb/frame/OpponentTombPanelFrame";
import { createDefaultOpponentTombPopupFrame } from "../../battle/zone/opponent_tomb/frame/OpponentTombPopupFrame";
import { OpponentTombPanelRendererV2 } from "../../battle/zone/opponent_tomb/renderer/OpponentTombPanelRendererV2";
import {
    computeOpponentFieldEnergyBounds,
    createDefaultOpponentFieldEnergyAreaFrame,
} from "../../battle/field_energy/opponent/frame/OpponentFieldEnergyAreaFrame";
import { OpponentFieldEnergyAreaRendererV2 } from "../../battle/field_energy/opponent/renderer/OpponentFieldEnergyAreaRendererV2";
import { OpponentFieldEnergyHudRendererV2 } from "../../battle/field_energy/opponent/renderer/OpponentFieldEnergyHudRendererV2";
import { createDefaultOpponentLostZonePopupFrame } from "../../battle/zone/opponent_lost_zone/frame/OpponentLostZonePopupFrame";
import { OpponentLostZonePanelRendererV2 } from "../../battle/zone/opponent_lost_zone/renderer/OpponentLostZonePanelRendererV2";

import {
    createDefaultTurnEndButtonFrame,
    isPointInsideTurnEndButton,
} from "../../battle/turn/end_button/frame/TurnEndButtonFrame";
import { TurnEndButtonRendererV2 } from "../../battle/turn/end_button/renderer/TurnEndButtonRendererV2";
import { BattleRepositoryImpl } from "../../battle/repository/BattleRepositoryImpl";
import {
    createDefaultMasterHpFrame,
    createOpponentMasterHpFrame,
} from "../../battle/master_hp/frame/MasterHpFrame";
import { MasterHpRendererV2 } from "../../battle/master_hp/renderer/MasterHpRendererV2";

import { createDefaultGuideMessageHudFrame } from "../../common/guide_message/frame/GuideMessageHudFrame";

declare const TWEEN: { Tween: any; Easing: any; update: (time?: number) => void };
import { GuideMessageHudRendererV2 } from "../../common/guide_message/renderer/GuideMessageHudRendererV2";
import { createDefaultSandTimerHudFrame } from "../../common/timer/frame/SandTimerHudFrame";
import { SandTimerHudRendererV2 } from "../../common/timer/renderer/SandTimerHudRendererV2";
import { createDefaultTurnHudFrame } from "../../battle/turn/hud/frame/TurnHudFrame";
import { TurnHudRendererV2 } from "../../battle/turn/hud/renderer/TurnHudRendererV2";

import {Component} from "../../router/Component";

// 로비에서 들어가는 전투 화면이다.
//
// 확인용 화면으로 만들어 오던 것을 그대로 옮겼다. 카드 열두 장의 효과, 필드 에너지,
// 턴 표시, 무덤과 로스트 존이 다 여기 있다.
//
// 화면 밖에 붙는 것과 창·글쇠를 듣는 것을 들고 있다가 떠날 때 치운다.
// 안 치우면 로비로 돌아가도 그 위에 남는다.
export class SimulationBattleFieldView implements Component {
    private static instance: SimulationBattleFieldView | null = null;

    private initialized = false;
    // 화면 밖에 붙인 것과 그것이 원래 쓰던 보이기 방식.
    //
    // 되돌릴 때 빈 값을 넣으면 안 된다. 이 조각들은 flex 로 가운데를 맞추는데,
    // 빈 값을 넣으면 그 맞추기가 풀려 숫자가 왼쪽 위로 간다.
    private readonly appended: Array<{element: HTMLElement; display: string}> = [];
    private readonly teardown: Array<() => void> = [];
    // 그리기를 멈추고 다시 돌리려면 이것이 있어야 한다.
    private animationLoop: AnimationLoop | null = null;
    // 이 화면의 그림판. 감출 때 이것을 감춘다.
    //
    // 화면을 붙이는 자리는 로비, 상점, 보유 카드가 함께 쓴다. 그것을 감추면
    // 다음 화면이 보일 때 함께 보이면서 이 화면의 그림판이 그 위에 남는다.
    private canvas: HTMLElement | null = null;

    private constructor(private readonly container: HTMLElement) {}

    public static getInstance(container: HTMLElement): SimulationBattleFieldView {
        if (!SimulationBattleFieldView.instance) {
            SimulationBattleFieldView.instance = new SimulationBattleFieldView(container);
        }
        return SimulationBattleFieldView.instance;
    }

    public initialize(): void {
        if (this.initialized) {
            this.show();
            return;
        }
        this.initialized = true;
        void this.build(this.container).catch((error) => {
            console.error('전투 화면을 띄우지 못했습니다:', error);
        });
    }

    public show(): void {
        // 자기 그림판과 함께 쓰는 자리를 둘 다 보이게 한다. 다른 화면도 같은 모양이다.
        if (this.canvas) this.canvas.style.display = 'block';
        this.container.style.display = 'block';
        for (const it of this.appended) it.element.style.display = it.display;

        // 아직 안 만들었으면 여기서 만든다. 라우터는 show 만 부른다.
        if (!this.initialized) {
            this.initialize();
            return;
        }
        this.animationLoop?.start();
    }

    public hide(): void {
        // 자기 그림판을 반드시 감춘다. 함께 쓰는 자리만 감추면 다음 화면이 보일 때
        // 이 화면의 그림판이 그 위에 그대로 남는다.
        if (this.canvas) this.canvas.style.display = 'none';
        this.container.style.display = 'none';
        // 화면 밖에 붙인 것을 함께 감춘다. 안 감추면 로비 위에 남는다.
        for (const it of this.appended) it.element.style.display = 'none';
        // 안 보이는 화면을 계속 그릴 이유가 없다.
        this.animationLoop?.stop();
    }

    public animate(): void {
        this.animationLoop?.start();
    }

    // 화면 밖에 붙이는 것을 적어 둔다. 떠날 때 함께 감춘다.
    private appendToBody(element: HTMLElement): void {
        document.body.appendChild(element);
        this.appended.push({element, display: element.style.display});
    }

    // 창과 글쇠를 듣는 것을 적어 둔다. 화면을 버릴 때 뗀다.
    private listen(
        target: Window | Document,
        type: string,
        handler: (event: never) => void,
        options?: AddEventListenerOptions,
    ): void {
        const listener = handler as EventListener;
        target.addEventListener(type, listener, options);
        this.teardown.push(() => target.removeEventListener(type, listener, options));
    }

    public dispose(): void {
        for (const off of this.teardown) off();
        this.teardown.length = 0;
        for (const it of this.appended) it.element.remove();
        this.appended.length = 0;
        this.initialized = false;
        SimulationBattleFieldView.instance = null;
    }

    private async build(container: HTMLElement): Promise<void> {
        // 연출이 쓰는 값 바꾸기를 얹는다. 전에는 화면마다 index.html 이 인터넷에서
        // 받아 왔다. 그 줄이 없는 화면에서 들어오면 연출 도중에 멈춘다.
        installTween();


        // 전투 한 판을 여기서 시작한다. 담을 그릇이 먼저 있어야 담는다.
        // 턴, 덱, 무덤, 로스트 존, 필드, 손패, 본체가 이 안에 들어 있다.
        const battle = BattleRepositoryImpl.getInstance().start();

        // 이 화면의 시작 필드 에너지다. 실제 대전에서는 0 에서 시작해 턴마다 는다.
        battle.setFieldEnergy(19);

        const rendererManager = new RendererManager(container);
        // 감출 때 이것만 감춘다. 함께 쓰는 자리를 감추면 다른 화면까지 사라진다.
        this.canvas = rendererManager.getDomElement();
        const sceneManager = new SceneManager();
        const cameraManager = CameraManager.getInstance();

        const aspectRatio = window.innerWidth / window.innerHeight;
        const viewSize = window.innerHeight;
        const camera = cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

        // Background music — plays on first user interaction (browser autoplay policy)
        const audioController = AudioController.getInstance();
        audioController.setMusic(battleFieldMusic);
        this.listen(window, 'click', () => { void audioController.playMusic(); }, { once: true });

        const scene = sceneManager.createScene('simulation-battle-field');

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
        //
        // 배경 그림 위에 덮어 두는 보이지 않는 판이다. 이 판을 눌러 본체를 겨누고, 겨냥
        // 테두리도 이 판에 붙는다. 배경은 창 크기를 따라가므로 이 판도 따라가야 한다.
        const computeMasterArea = (viewportWidth: number, viewportHeight: number) => {
            const x1 = (0.4605885 - 0.5) * viewportWidth;
            const y1 = (0.5 - 0.1920103) * viewportHeight;
            const x2 = (0.5410156 - 0.5) * viewportWidth;
            const y2 = (0.5 - 0.0476804) * viewportHeight;
            return {
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1),
                centerX: (x1 + x2) / 2,
                centerY: (y1 + y2) / 2,
            };
        };
        const masterArea = computeMasterArea(window.innerWidth, window.innerHeight);
        const masterW = masterArea.width;
        const masterH = masterArea.height;
        const masterCX = masterArea.centerX;
        const masterCY = masterArea.centerY;

        const masterMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true });
        const masterMesh = new THREE.Mesh(new THREE.PlaneGeometry(masterW, masterH), masterMaterial);
        masterMesh.renderOrder = 1;

        const masterGroup = new THREE.Group();
        masterGroup.position.set(masterCX, masterCY, 0);
        masterGroup.add(masterMesh);
        masterGroup.userData = { baseCardWidth: masterW, baseCardHeight: masterH };
        scene.add(masterGroup);

        // 상대 본체 HP는 전투가 든다. 여기서는 표기만 맞춘다.

        const opponentMasterHpFrame = createOpponentMasterHpFrame();
        const opponentMasterHpRenderer = new MasterHpRendererV2();
        const opponentMasterHpGroup = await opponentMasterHpRenderer.build(opponentMasterHpFrame);
        scene.add(opponentMasterHpGroup);

        // 상대 본체 HP를 바꾸는 **유일한** 지점. 여러 카드 효과가 제각기 값을 건드리면
        // 표기 갱신을 빠뜨리기 쉬우므로 여기로 모은다. 반환값은 갱신 후 HP.
        function setOpponentMasterHp(next: number, reason: string): number {
            const prev = battle.getOpponentMasterHp();
            const clamped = battle.setOpponentMasterHp(next);
            if (clamped !== prev) {
                void opponentMasterHpRenderer.setHp(
                    opponentMasterHpGroup, opponentMasterHpFrame, clamped,
                );
                console.log(`[opponent-master-hp] ${reason} → ${prev} → ${clamped}${clamped <= 0 ? ' (defeated)' : ''}`);
            }
            return clamped;
        }

        // ── 메인 캐릭터(본체) HP ──────────────────────────────────────────────────
        // 수치는 hp/{n}.png 이미지에 새겨져 있고, 렌더러가 HP가 바뀔 때마다 텍스처를
        // 갈아 끼운다. 100에서 시작한다.
        const masterHpFrame = createDefaultMasterHpFrame();
        const masterHpRenderer = new MasterHpRendererV2();
        const masterHpGroup = await masterHpRenderer.build(masterHpFrame);
        scene.add(masterHpGroup);
        // 내 본체 HP도 전투가 든다.

        // 메인 캐릭터가 피해를 입는 유일한 지점. 표기 갱신까지 여기서 함께 한다.
        function damageYourMaster(amount: number, reason: string): void {
            const prev = battle.getYourMasterHp();
            const next = battle.damageYourMaster(amount);
            if (next === prev) return;
            void masterHpRenderer.setHp(masterHpGroup, masterHpFrame, next);
            console.log(`[master-hp] ${reason} → ${prev} → ${next}${next <= 0 ? ' (defeated)' : ''}`);
        }

        // Pilot B — hand row (6장으로 확장해 페이지네이션 검증)
        const placementFrame = createDefaultPlacedCardPlacementFrame();
        // Initial hand — 6 cards drawn from the 40-card deck spec. Mix of UNIT/SUPPORT/ENERGY/ITEM.
        // Default repo seed already contains (2, 19, 93, 26); add 27 + Energy Burn (9) for testing.
        //
        //   // 에너지 번 (ITEM) — drains up to 2 energy off opponent units
        //  // 파멸의 계약 (ITEM) — 15 AoE dmg + deck-to-lost-zone
        //  // 사기 전환 (ITEM) — sacrifice ally for floor(hp/5) field energy
        //  // 망자의 늪 (SUPPORT) — draw 3 from deck
        //  // 죽음의 대지 (ITEM) — drain 2 opponent field energy
        //  // 레오닉의 부름 (SUPPORT) — pick 2 hero-or-below UNITs from deck
        //  // 시체 폭발 (ITEM) — sacrifice undead ally → 2x10 dmg to enemies
        // 손패의 시작 카드다. 실제 대전에서는 서버가 준다.
        const handCardIds = [
            2, 19, 93, 26,
            27,
            9,   // 에너지 번 (ITEM)
            25,  // 파멸의 계약 (ITEM)
            35,  // 사기 전환 (ITEM)
            20,  // 망자의 늪 (SUPPORT)
            36,  // 죽음의 대지 (ITEM)
            30,  // 레오닉의 부름 (SUPPORT)
            33,  // 시체 폭발 (ITEM)
        ];
        const hand = resolveCards(handCardIds, 'hand');

        // 섞을 때 쓸 씨앗을 만든다. 도메인 안에서는 무작위를 못 쓰므로 밖에서 만들어 넣는다.
        // 씨앗을 적어 두면 같은 순서를 다시 만들 수 있다. 재접속과 다시 보기에 그것이 필요하다.
        const makeShuffleSeed = (): number => Math.floor(Math.random() * 0xffffffff);

        // Draw pile — remaining 35 cards after subtracting 1 of each of (2, 19, 26, 27, 93) from
        // the 40-card deck spec. Array order is draw order (index 0 = next draw).
        battle.seedYourDeck([
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
        // 전투의 손패에도 같은 카드를 넣는다. 신원은 화면 카드의 번호를 쓴다.
        // 이 화면은 전에 자기 배열만 들고 전투의 손패를 비워 뒀다. 담을 곳이 비어 있으면
        // 옆에 하나 더 만들게 되고, 그러면 전투가 무엇을 할 수 있는지 알 수 없다.
        for (const e of entries) {
            battle.addToHand(new HandCard(e.cardIndex, e.card.cardId, [], 0));
        }

        // 카드에 적혀 있는 것을 알려 주는 곳. 판과 무관하므로 전투가 안 든다.
        const cardCatalog: CardCatalog = {
            getKind: (cardId) => {
                const card = getCardById(cardId);
                return card ? (parseInt(card.종류, 10) as CardKind) : null;
            },
            getHp: (cardId) => {
                const hp = getCardById(cardId)?.체력;
                return typeof hp === 'number' ? hp : parseInt(String(hp ?? 0), 10) || 0;
            },
            getGrade: (cardId) => {
                const card = getCardById(cardId);
                return card ? (parseInt(card.등급, 10) as CardGrade) : null;
            },
            getRace: (cardId) => {
                const raw = Number((getCardById(cardId) as any)?.['종족']);
                return raw === CardRace.HUMAN || raw === CardRace.UNDEAD || raw === CardRace.TRENT
                    ? (raw as CardRace)
                    : null;
            },
        };
        const battleCommandHandler = new BattleCommandHandler(cardCatalog);

        // 사용자가 한 일 하나를 전투에 보내고, 무슨 일이 있었는지 받는다.
        const send = (command: BattleCommand): BattleEvent[] =>
            battleCommandHandler.handle(battle, command);

        const handOrder: HandEntry[] = [...entries];
        const placedOrder: HandEntry[] = [];
        const MAX_PER_PAGE = 4;
        let currentPage = 1;

        const findEntryByGroup = (group: THREE.Object3D): HandEntry | undefined =>
            entries.find((e) => e.group === group);
        const getMaxPage = () => Math.max(1, Math.ceil(handOrder.length / MAX_PER_PAGE));

        // 스킬을 쓰러 나가 있는 카드와, 끝나고 돌아갈 자리.
        //
        // 스킬을 쓰는 동안 카드는 제자리를 비우고 화면 가운데로 나간다. 그 사이에 창 크기가
        // 바뀌면 제자리가 달라지는데, 카드는 나갈 때 적어 둔 옛 자리로 돌아가 버린다.
        // 그래서 나가 있는 동안에는 카드를 세우는 대신 돌아갈 자리를 고쳐 둔다.
        const skillTripHome = new Map<THREE.Group, THREE.Vector3>();

        // 카드를 내보내는 연출을 돌리는 동안 제자리를 맡아 둔다. 도는 중에 창 크기가 바뀌면
        // 제자리를 다시 세는 쪽이 맡아 둔 값을 고치고, 연출은 돌아갈 때 그 값을 읽는다.
        const withSkillTripHome = async (
            group: THREE.Group,
            play: (home: THREE.Vector3) => Promise<void>,
        ): Promise<void> => {
            const home = group.position.clone();
            skillTripHome.set(group, home);
            try {
                await play(home);
            } finally {
                skillTripHome.delete(group);
            }
        };

        const seatOrRetarget = (group: THREE.Group, x: number, y: number): void => {
            const home = skillTripHome.get(group);
            if (home) {
                home.set(x, y, home.z);
                return;
            }
            group.position.set(x, y, 0);
        };

        const reflowHandAndPlaced = (): void => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const pageStart = (currentPage - 1) * MAX_PER_PAGE;
            const pageEnd = pageStart + MAX_PER_PAGE;

            handOrder.forEach((entry, index) => {
                if (index >= pageStart && index < pageEnd) {
                    const pageLocalIndex = index - pageStart;
                    const { x, y } = computeHandCardCenter(handLayoutFrame, pageLocalIndex, w, h);
                    seatOrRetarget(entry.group, x, y);
                    entry.group.visible = true;
                } else {
                    entry.group.visible = false;
                }
            });

            placedOrder.forEach((entry, index) => {
                const { x, y } = computePlacedCardPosition(placementFrame, index, w, h);
                seatOrRetarget(entry.group, x, y);
                entry.group.visible = true;
            });
        };

        reflowHandAndPlaced();

        // Pilot E new — opponent field units (reuses HandCardRendererV2 via OpponentFieldRendererV2)
        // Add mythic unit (네더 블레이드, cardId 19) to the opponent field for scythe-targeting tests:
        //   scythe vs <MYTHICAL → instant kill; scythe vs MYTHICAL → 30 damage.
        // 2 copies for testing duplicate-target picks (e.g., 시체 폭발) + multi-NB scenarios.
        // 상대 필드의 시작 배치다. 실제 대전에서는 서버가 준다.
        const opponentCardIds = [31, 32, 32, 26, 27, 19, 19];
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
        // Seed with 12 test cards — exactly two full rows at 6 columns. Exercises horizontal
        // spacing (vs. hand layout) AND vertical row spacing / aspect ratio of the popup grid.
        for (const id of [31, 32, 26, 27, 93, 19, 2, 8, 9, 20, 25, 33]) battle.sendToYourLostZone(id);

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

        // Seed opponent repo with 12 test cards so pagination (2 pages at 10/page) is exercised.
        for (const id of [31, 32, 26, 27, 93, 19, 2, 8, 9, 20, 25, 33]) battle.sendToOpponentLostZone(id);

        // ── Turn-end button — right-side click zone that hands control to the opponent.
        const turnEndButtonFrame = createDefaultTurnEndButtonFrame();
        const turnEndButtonRenderer = new TurnEndButtonRendererV2();
        const turnEndButtonGroup = await turnEndButtonRenderer.build(turnEndButtonFrame);
        scene.add(turnEndButtonGroup);
        // Declared here (not next to the 'f' handler that increments it) because the drop
        // handler runs earlier in the file.

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
        // 상대 덱은 비어서 시작한다. 실제 대전에서는 서버가 준 것으로 채운다.
        // it with the server-provided deck snapshot — the server is the authority on opponent
        // deck contents. Because the dummy seed lives HERE (in the pilot) rather than inside
        // the repository itself, it never leaks into production callers that reuse the repo.
        battle.seedOpponentDeck([
            31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8, 9, 93, 151,
        ]);

        let opponentLostZonePopupGroup: THREE.Group | null = null;
        let opponentLostZonePage = 0;
        const opponentLostZoneCardsPerPage =
            opponentLostZonePopupFrame.cardColumns * opponentLostZonePopupFrame.rowsPerPage;

        const buildOpponentLostZonePopupForCurrentPage = async (): Promise<THREE.Group> => {
            const all = [...battle.getOpponentLostZoneCards()];
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
            Math.max(1, Math.ceil(battle.getOpponentLostZoneCards().length / opponentLostZoneCardsPerPage));

        // ── Your Tomb — gravestone-shaped panel + popup (same as Your Lost Zone). ─────────
        const tombPanelFrame = createDefaultYourTombPanelFrame();
        const tombPopupFrame = createDefaultYourTombPopupFrame();
        const tombPanelRenderer = new YourTombPanelRendererV2();
        // Reuses the generic lost-zone popup renderer — popup rendering is stateless.
        const tombPopupRenderer = new CardGridPopupRenderer();
        const tombPanelGroup = await tombPanelRenderer.build(tombPanelFrame);
        scene.add(tombPanelGroup);

        // Pilot-only dummy seed for testing pagination; production seed will come from network.
        for (const id of [31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8]) battle.sendToYourTomb(id);

        let tombPopupGroup: THREE.Group | null = null;
        let tombPage = 0;
        const tombCardsPerPage = tombPopupFrame.cardColumns * tombPopupFrame.rowsPerPage;

        const buildTombPopupForCurrentPage = async (): Promise<THREE.Group> => {
            const all = [...battle.getYourTombCards()];
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
            Math.max(1, Math.ceil(battle.getYourTombCards().length / tombCardsPerPage));

        // ── Opponent Tomb — 180° mirror of Your Tomb. Same popup reuse pattern as opp LZ. ──
        const opponentTombPanelFrame = createDefaultOpponentTombPanelFrame();
        const opponentTombPopupFrame = createDefaultOpponentTombPopupFrame();
        const opponentTombPanelRenderer = new OpponentTombPanelRendererV2();
        const opponentTombPopupRenderer = new CardGridPopupRenderer();
        const opponentTombPanelGroup = await opponentTombPanelRenderer.build(opponentTombPanelFrame);
        scene.add(opponentTombPanelGroup);

        // Pilot-only dummy seed for testing pagination (12 cards = 2 pages).
        for (const id of [31, 32, 33, 35, 36, 26, 27, 25, 30, 20, 2, 8]) battle.sendToOpponentTomb(id);

        let opponentTombPopupGroup: THREE.Group | null = null;
        let opponentTombPage = 0;
        const opponentTombCardsPerPage =
            opponentTombPopupFrame.cardColumns * opponentTombPopupFrame.rowsPerPage;

        const buildOpponentTombPopupForCurrentPage = async (): Promise<THREE.Group> => {
            const all = [...battle.getOpponentTombCards()];
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
            Math.max(1, Math.ceil(battle.getOpponentTombCards().length / opponentTombCardsPerPage));

        // Burial helper — whenever an opponent unit dies on the field (HP ≤ 0), look up its
        // cardId by cardIndex and push it into the Opponent Tomb repo. Call at every death
        // site (scythe, energy-burn, doom-contract, AoE skill, single-target attack) right
        // next to the existing battle.removeFromOpponentField(...).
        // 상대 유닛이 쓰러진다. 무덤으로 보내는 것과 필드에서 빼는 것은 한 가지 일이다.
        //
        // 전에는 두 줄이 늘 붙어 다녔다. 둘 사이에서 화면이 닫히면 무덤에는 있는데
        // 필드에도 남아 있는 상태가 된다.
        const defeatOpponentUnit = (cardIndex: number): void => {
            const card = opponentCards[cardIndex];
            if (!card) return;
            battle.sendToOpponentTomb(card.cardId);
            battle.removeFromOpponentField(cardIndex);
            console.log(`[tomb] opponent cardId=${card.cardId} (idx=${cardIndex}) → opponent tomb`);
        };

        // Popup is built on demand when panel is clicked; null when hidden.
        let lostZonePopupGroup: THREE.Group | null = null;
        let lostZonePage = 0;
        const lostZoneCardsPerPage = lostZonePopupFrame.cardColumns * lostZonePopupFrame.rowsPerPage;

        const buildLostZonePopupForCurrentPage = async (): Promise<THREE.Group> => {
            const all = [...battle.getYourLostZoneCards()];
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
            Math.max(1, Math.ceil(battle.getYourLostZoneCards().length / lostZoneCardsPerPage));

        // 상대 유닛의 체력과 붙은 에너지, 그리고 살아 있는 차례는 전투가 든다.
        // 전에는 이 화면이 지도 둘과 배열 하나로 따로 들고 있었다.
        for (let i = 0; i < opponentCards.length; i++) {
            const oc = opponentCards[i];
            const card = getCardById(oc.cardId);
            const hp = card?.체력 ?? 0;
            battle.placeOnOpponentField(new FieldCard(
                i,                                   // 신원. 이 화면에서는 만들 때의 차례를 쓴다
                oc.cardId,
                [],
                0,                                   // 화면 좌표 번호를 안 쓴다
                typeof hp === 'number' ? hp : 0,
                // 시작 에너지는 그 카드의 종족으로 붙인다.
                oc.energyCount > 0
                    ? new Map([[oc.raceId as CardRace, oc.energyCount]])
                    : new Map(),
            ));
        }

        // 살아 있는 차례는 전투가 든 상대 필드 목록 그 자체다.
        // 상대 필드 카드가 어느 자리에 서는지도 이 차례로 정해진다.
        const opponentAliveIds = (): number[] =>
            battle.getOpponentFieldCards().map((it) => it.getBattleCardId());
        const isOpponentAlive = (cardIndex: number): boolean =>
            battle.findOnOpponentField(cardIndex) !== null;
        const opponentHpOf = (cardIndex: number): number =>
            battle.findOnOpponentField(cardIndex)?.getHp() ?? 0;
        const setOpponentHp = (cardIndex: number, next: number): void => {
            battle.findOnOpponentField(cardIndex)?.setHp(next);
        };
        const opponentEnergyOf = (cardIndex: number): number =>
            battle.findOnOpponentField(cardIndex)?.getEnergyCount() ?? 0;
        // 상대 유닛의 에너지를 이만큼으로 맞춘다. 종족은 안 가린다.
        const setOpponentEnergy = (cardIndex: number, next: number): void => {
            const unit = battle.findOnOpponentField(cardIndex);
            if (!unit) return;
            unit.drainEnergy(unit.getEnergyCount() - next);
        };

        const opponentEntries = (opponentGroup.userData as { entries: { card: CardFace; cardIndex: number; group: THREE.Group }[] }).entries;

        const reflowOpponentField = (): void => {
            opponentRenderer.layout(
                opponentLayoutFrame,
                opponentGroup,
                window.innerWidth,
                window.innerHeight,
                opponentAliveIds(),
            );
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

        // 패널이 열린 자리를 [그 카드의 가운데에서 얼마나 떨어져 있는가] 로 적어 둔다.
        // 카드 크기에 대한 비율이라, 창이 커지거나 작아져도 카드에 대해 같은 자리에 선다.
        // 패널은 우클릭한 자리에 뜨는데, 창이 바뀌면 카드가 다른 자리로 가기 때문에
        // 누른 자리를 그대로 기억하면 패널만 엉뚱한 데 남는다.
        let activePanelAnchorOnCard: { entry: HandEntry; xRatio: number; yRatio: number } | null = null;
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
            activePanelAnchorOnCard = null;
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
            // 붙은 에너지는 전투가 든다. 화면이 따로 세던 것을 지웠다.
            const unit = battle.findOnYourField(entry.cardIndex);
            for (const [race, need] of cost) {
                const have = unit?.getEnergyOfRace(race) ?? 0;
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
            if (battle.getTurnOwner() === 'your') {
                endYourTurn(reason);
            } else {
                void beginYourTurn(reason);
            }
        }

        const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
        // 화면을 감출 때 멈추려면 밖에서도 잡을 수 있어야 한다.
        this.animationLoop = animationLoop;
        const attackAnimation = new AttackAnimationV2(scene);
        // 벨른의 광역기. 공격 연출과 다른 카드의 것이라 따로 든다.
        const seaOfSpecterEffect = new SeaOfSpecterEffect(scene);
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
                if (battle.getOpponentMasterHp() > 0) {
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
                if (battle.getOpponentMasterHp() > 0) {
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
        // 스킬 자리는 createCardSkillPositionFrame 에서 읽는다. AttackAnimationV2.playAoESkill 과
        // 같은 자리라 벨른의 전체 연출이 서는 곳과 맞는다.
        const playSkillPanelMoveOnly = async (
            group: THREE.Group,
            effectCallback?: (panelPos: THREE.Vector3) => Promise<void>,
        ): Promise<void> => {
            const h = window.innerHeight;
            const { x: skillPositionX, y: skillPositionY } = createCardSkillPositionFrame(h);
            const origPos = group.position.clone();
            skillTripHome.set(group, origPos);

            // 옮기는 일은 moveCard 가 한다. 예전에는 여기서 직접 계산했는데,
            // 그 식이 TWEEN 의 Quadratic.InOut 과 같은 곡선이라 값이 바뀌지 않는다.
            const moveTo = (tx: number, ty: number, tz: number, durMs: number): Promise<void> =>
                moveCard(group, { x: tx, y: ty, z: tz }, durMs, CardMoveEasing.inOut);

            // Forward: lift z by +1 so the card draws above other field meshes during travel.
            await moveTo(skillPositionX, skillPositionY, origPos.z + 1, 700);
            // Cast — run the effect at the panel slot, or just hold briefly.
            if (effectCallback) {
                const panelPos = new THREE.Vector3(skillPositionX, skillPositionY, origPos.z + 1);
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
            skillTripHome.delete(group);
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
                const hasOpponents = battle.getOpponentFieldCount() > 0 &&
                    opponentEntries.some((oe) =>
                        oe.group.visible && isOpponentAlive(oe.cardIndex),
                    );
                const hasMaster = battle.getOpponentMasterHp() > 0;
                if (!hasOpponents && !hasMaster) {
                    console.log('[nether-blade] passive 2 → no valid targets, skipped');
                    resolve();
                    return;
                }

                for (const oe of opponentEntries) {
                    if (oe.group.visible && isOpponentAlive(oe.cardIndex)) {
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
                if (battle.getOpponentMasterHp() > 0) {
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
                && (opponentHpOf(pick.cardIndex)) - NETHER_BLADE_PASSIVE2_DAMAGE <= 0;

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
                if (battle.getOpponentMasterHp() > 0) {
                    setOpponentMasterHp(battle.getOpponentMasterHp() - dmg, 'nether-blade passive 2');
                    if (battle.getOpponentMasterHp() <= 0) {
                        masterGroup.visible = false;
                        console.log('[nether-blade] opponent MASTER defeated by passive 2!');
                    }
                }
            } else {
                // Opponent unit pick.
                const target = opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex);
                if (target && target.group.visible) {
                    const prev = opponentHpOf(pick.cardIndex);
                    const newHp = Math.max(0, prev - dmg);
                    setOpponentHp(pick.cardIndex, newHp);
                    // 패시브도 이 유닛의 공격이다 — 보유자면 암흑 화염 + 빙결이 실린다.
                    if (newHp > 0) applyColdDarkTraits(state.deployedEntry, pick.cardIndex);
                    console.log(`[nether-blade] passive 2 → opponent idx=${pick.cardIndex} cardId=${target.card.cardId} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                    if (newHp <= 0) {
                        defeatOpponentUnit(pick.cardIndex);
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
            for (const idx of opponentAliveIds()) {
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
            for (const idx of opponentAliveIds()) {
                const target = opponentEntries.find((oe) => oe.cardIndex === idx);
                if (!target || !target.group.visible) continue;
                const prev = opponentHpOf(idx);
                const newHp = Math.max(0, prev - dmg);
                setOpponentHp(idx, newHp);
                // 패시브도 이 유닛의 공격이다 — 보유자면 암흑 화염 + 빙결이 실린다.
                if (newHp > 0) applyColdDarkTraits(deployedEntry, idx);
                console.log(`[nether-blade] AoE → opponent idx=${idx} cardId=${target.card.cardId} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                if (newHp <= 0) {
                    defeatOpponentUnit(idx);
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

                            // 때리는 것과 쓰러뜨리는 것은 전투가 한다. 본체까지 갈지도 여기서 정한다.
                            // 연출을 기다리기 전에 값을 다 바꾼다. 기다리는 동안 화면이 닫혀도
                            // 체력만 0 이고 필드에 남아 있는 어중간한 상태가 안 생긴다.
                            const aoeEvents = send({
                                type: skillType === SkillType.EveryField
                                    ? 'attackEveryOpponent'
                                    : 'attackEveryOpponentUnit',
                                attackerBattleCardId: atkEntry?.cardIndex ?? -1,
                                damage,
                            });

                            if (atkEntry) {
                                clearAllSelection();
                                // 네더 블레이드 — only the bare move-to-panel + return motion
                                // (no dark vortex / dementors / magic circle yet — the
                                // mythical-tier effect is intentionally deferred). 벨른
                                // (and other cards) keeps the full playAoESkill sequence.
                                if (atkEntry.card.cardId === NETHER_BLADE_CARD_ID) {
                                    await playSkillPanelMoveOnly(atkEntry.group);
                                } else {
                                    await withSkillTripHome(atkEntry.group, (home) =>
                                        seaOfSpecterEffect.play(atkEntry.group, home));
                                }
                            }

                            for (const ev of aoeEvents) {
                                if (ev.type !== 'damaged' || ev.target.kind !== 'unit') continue;
                                const idx = ev.target.battleCardId;
                                const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                                if (!entry) continue;

                                const currentHp = ev.hpBefore;
                                const newHp = ev.hpAfter;

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
                                    // 무덤에 넣는 것은 전투가 이미 했다. 화면 정리만 늦춘다.
                                    setTimeout(() => {
                                        entry.group.visible = false;
                                        reflowOpponentField();
                                    }, 450);
                                }

                                console.log(`  opponent idx=${idx} HP: ${currentHp} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                            }

                            // 본체까지 가는 광역기라면 그 결과도 함께 온다.
                            for (const ev of aoeEvents) {
                                if (ev.type === 'damaged' && ev.target.kind === 'opponentMaster') {
                                    opponentMasterHpRenderer.setHp(opponentMasterHpGroup, opponentMasterHpFrame, ev.hpAfter);
                                    console.log(`[opponent-master-hp] ${btnType} (AoE EveryField) → ${ev.hpBefore} → ${ev.hpAfter}`);
                                } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
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
                            if (battle.getOpponentMasterHp() > 0) {
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
            if (interactionState === 'attackMode' && battle.getOpponentMasterHp() > 0) {
                const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
                if (masterHits.length > 0) {
                    e.stopImmediatePropagation();
                    const atkPower = pendingAttackDamage;
                    const attackerEntry = selectedAttackerEntry;

                    clearAllSelection();

                    // 때리는 것은 전투가 한다. 연출을 기다리기 전에 값을 다 바꾼다.
                    const events = send({
                        type: 'attackOpponentMaster',
                        attackerBattleCardId: attackerEntry?.cardIndex ?? -1,
                        damage: atkPower,
                    });

                    if (attackerEntry) {
                        await withSkillTripHome(attackerEntry.group, (home) =>
                            attackAnimation.playAttack(attackerEntry.group, masterGroup, pendingAttackType, home));
                    }

                    for (const ev of events) {
                        if (ev.type === 'damaged' && ev.target.kind === 'opponentMaster') {
                            opponentMasterHpRenderer.setHp(opponentMasterHpGroup, opponentMasterHpFrame, ev.hpAfter);
                            console.log(`[opponent-master-hp] attack on MASTER (ATK=${atkPower}) → ${ev.hpBefore} → ${ev.hpAfter}`);
                        } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
                            setTimeout(() => { masterGroup.visible = false; console.log('Opponent MASTER defeated!'); }, 300);
                        }
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

                    const targetIdx = targetEntry.cardIndex;
                    // 때리는 것과 쓰러뜨리는 것은 전투가 한다.
                    // 연출을 기다리기 전에 값을 다 바꾼다.
                    const attackEvents = send({
                        type: 'attackUnit',
                        attackerBattleCardId: attackerEntry?.cardIndex ?? -1,
                        targetBattleCardId: targetIdx,
                        damage: attackPower,
                    });

                    if (attackerEntry) {
                        await withSkillTripHome(attackerEntry.group, (home) =>
                            attackAnimation.playAttack(attackerEntry.group, targetEntry.group, pendingAttackType, home));
                    }
                    const hit = attackEvents.find((ev) => ev.type === 'damaged');
                    const currentHp = hit && hit.type === 'damaged' ? hit.hpBefore : 0;
                    const newHp = hit && hit.type === 'damaged' ? hit.hpAfter : 0;

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
                        // 무덤에 넣는 것은 전투가 이미 했다. 화면 정리만 늦춘다.
                        setTimeout(() => {
                            targetEntry.group.visible = false;
                            reflowOpponentField();
                            console.log(`Opponent idx=${targetIdx} defeated! Remaining: ${battle.getOpponentFieldCount()}`);
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
            if (!battle.canYourUnitAct(selectedEntry.cardIndex)) {
                guideRenderer.show(guideElement, '이번 턴에 출격한 유닛으로 공격할 수 없습니다.', 3000);
                console.log(`[summoning-sickness] cardId=${selectedEntry.card.cardId} deployed on TURN ${battle.getTurnNumber()} — panel blocked`);
                return;
            }

            // Panel spawns at mouse right-click world position (legacy: activePanelAreaCache.create(clickPoint.x, clickPoint.y, cardId))
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

            const anchorCardWidth = handCardFrame.cardWidthRatio * window.innerWidth;
            const anchorCardHeight = anchorCardWidth * handCardFrame.cardAspect;
            activePanelAnchorOnCard = {
                entry: selectedEntry,
                xRatio: (clickPos.x - selectedEntry.group.position.x) / anchorCardWidth,
                yRatio: (clickPos.y - selectedEntry.group.position.y) / anchorCardHeight,
            };

            activePanelGroup = await activePanelRenderer.build(activePanelFrame, clickPos, buttonSpecs);
            scene.add(activePanelGroup);
            interactionState = 'panelVisible';
        });

        // Field energy → card attachment. Intercepts clicks BEFORE bridge when fieldEnergyActive.
        //
        // 카드에 붙은 에너지는 전투가 든다. 종족마다 따로 센다 — 스킬 비용이 종족별 3개 열
        // (스킬N 언데드/휴먼/트런트필요에너지)로 정의되어 있고, 앞으로 여러 종족을 동시에
        // 요구하는 스킬이 추가될 예정이라 총량만으로는 판정할 수 없다.
        // 화면은 그 위에 얹은 그림만 든다.
        const cardEnergyMeshes = new Map<HandEntry, { iconMesh: THREE.Mesh; textMesh: THREE.Mesh }>();

        // Race HUD에서 선택 중인 종족. 필드 에너지를 카드에 붙일 때 이 값이 그대로 기록되므로
        // 부착 로직(attachEnergyToCard)보다 앞에 선언한다. prev/next 클릭 존이 갱신한다.
        let currentRaceId = 1;
        const MAX_RACE_ID = 3;

        // 카드 UI(아이콘 위 숫자)와 Count HUD는 종족 구분 없이 총합 하나만 보여준다.
        function totalCardEnergy(entry: HandEntry): number {
            return battle.findOnYourField(entry.cardIndex)?.getEnergyCount() ?? 0;
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
            // 저장은 전투가 한다 — 여기서는 아이콘/숫자/HUD만 갱신.
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
            battle.findOnOpponentField(cardIndex)?.clearStatus();
            frozenBurningEffect.detach(cardIndex);
        }

        // 공격이 명중한 뒤 호출. 공격자가 보유자가 아니면 아무 일도 하지 않는다.
        // 암흑 화염은 매번 갱신(지속), 빙결은 면역이 아닐 때만 새로 건다.
        function applyColdDarkTraits(attacker: HandEntry | null, targetIdx: number): void {
            if (!attacker || !coldDarkEnergyHolders.has(attacker)) return;
            const target = opponentEntries.find((oe) => oe.cardIndex === targetIdx);
            if (!target || !target.group.visible) return;
            if (!ensureFrozenBurningOverlay(targetIdx)) return;

            // 붙이는 것은 전투가 한다. 연속 빙결 불가도 전투가 안다.
            const unit = battle.findOnOpponentField(targetIdx);
            if (!unit) return;
            unit.setDarkFlame(true);
            const froze = unit.freeze();
            const immune = !froze;

            frozenBurningEffect.setState(targetIdx, {
                flame: true,
                freeze: unit.isFrozen(),
            });
            console.log(
                `[cold-dark-energy] idx=${targetIdx} 암흑 화염 부여` +
                (immune ? ' · 빙결 면역(연속 빙결 불가)' : ' · 빙결 부여'),
            );
        }

        // 상대 유닛이 지금 행동할 수 있는지. 빙결 중이면 불가.
        // (상대 행동 로직이 아직 없어 호출부가 없다 — 상태의 단일 판정 지점으로 먼저 둔다.)
        // 얼어 있는지는 전투가 안다.
        function isOpponentFrozen(cardIndex: number): boolean {
            return !battle.canOpponentUnitAct(cardIndex);
        }

        // 내 턴 시작 훅 — 빙결 해제 + 재빙결 면역 갱신.
        async function attachEnergyToCard(entry: HandEntry): Promise<void> {
            if (!placedOrder.includes(entry)) return;

            // 붙는 에너지의 종족 = Race HUD에서 선택 중인 종족.
            // 쓸 수 있는지 보고 깎고 붙이는 것은 전투가 한다.
            const race = currentRaceId as CardRace;
            const events = send({
                type: 'attachFieldEnergyToUnit',
                targetBattleCardId: entry.cardIndex,
                race,
            });
            const attached = events.find((ev) => ev.type === 'energyAttached');
            if (!attached || attached.type !== 'energyAttached') return;

            const cardEnergy = attached.countAfter;

            energyRenderer.setEnergy(battle.getFieldEnergy());
            energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
            await updateCardEnergyVisual(entry, cardEnergy);

            setFieldEnergyNeon(false);
            console.log(`Energy attached to card ${entry.card.cardId}: ${RACE_LABEL[race]} +1 → ${cardEnergy} total. Available: ${battle.getFieldEnergy()}`);
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

        // 카드 능력의 숫자와 고르는 방식은 battle/ability/CardAbility 에 값으로 적혀 있다.
        // 전에는 이 화면 파일 안에 흩어져 있어서, 카드를 더할 때마다 이 파일이 커졌다.
        const ability = (cardId: number) => {
            const found = findCardAbility(cardId);
            if (!found) throw new Error(`카드 능력을 찾을 수 없다: ${cardId}`);
            return found;
        };

        const SCYTHE_CARD_ID = 8;
        const SCYTHE_MYTHIC_DAMAGE = ability(SCYTHE_CARD_ID).numbers.mythicDamage;

        const ENERGY_BURN_CARD_ID = 9;
        const ENERGY_BURN_PER_MISSING_DAMAGE = ability(ENERGY_BURN_CARD_ID).numbers.perMissingEnergyDamage;

        const OPPONENT_TARGETING_ITEM_IDS: readonly number[] = cardIdsTargeting(AbilityTarget.OPPONENT_UNIT);

        const MORALE_CONVERT_CARD_ID = 35;

        const OVERFLOW_MORALE_CARD_ID = 2;
        const DEATH_ENERGY_CARD_ID = ability(OVERFLOW_MORALE_CARD_ID).numbers.pullCardId;
        const OVERFLOW_MORALE_MAX = ability(OVERFLOW_MORALE_CARD_ID).numbers.maxPull;

        const COLD_DARK_ENERGY_CARD_ID = 151;
        const DARK_FLAME_TURN_DAMAGE = ability(COLD_DARK_ENERGY_CARD_ID).numbers.darkFlameTurnDamage;

        // 이 에너지를 보유한 아군 유닛. 보유 개수가 아니라 보유 여부만 의미가 있다.
        const coldDarkEnergyHolders = new Set<HandEntry>();

        // 상대 유닛의 상태이상은 전투가 든다. 암흑 화염, 빙결, 재빙결 불가.

        const ALLY_TARGETING_ITEM_IDS: readonly number[] = cardIdsTargeting(AbilityTarget.ALLY_UNIT);

        const SWAMP_OF_DEAD_CARD_ID = 20;
        const SWAMP_DRAW_COUNT = ability(SWAMP_OF_DEAD_CARD_ID).numbers.drawCount;

        const DOOM_CONTRACT_CARD_ID = 25;
        const DOOM_CONTRACT_DAMAGE = ability(DOOM_CONTRACT_CARD_ID).numbers.damage;
        const FIELD_NEON_ENTITY_ID = -1;  // sentinel — distinct from any card.cardIndex

        const DEAD_LANDS_CARD_ID = 36;
        const DEAD_LANDS_DRAIN = ability(DEAD_LANDS_CARD_ID).numbers.fieldEnergyDrain;

        const LEONIK_SUMMON_CARD_ID = 30;
        const LEONIK_MAX_PICK = ability(LEONIK_SUMMON_CARD_ID).numbers.maxPick;
        const LEONIK_MAX_GRADE = ability(LEONIK_SUMMON_CARD_ID).grade!;

        const CORPSE_EXPLOSION_CARD_ID = 33;
        const CORPSE_EXPLOSION_DAMAGE = ability(CORPSE_EXPLOSION_CARD_ID).numbers.damage;
        const CORPSE_EXPLOSION_PICKS = ability(CORPSE_EXPLOSION_CARD_ID).numbers.picks;

        const NETHER_BLADE_CARD_ID = 19;
        const NETHER_BLADE_PASSIVE_DAMAGE = ability(NETHER_BLADE_CARD_ID).numbers.passive1Damage;
        const NETHER_BLADE_PASSIVE2_DAMAGE = ability(NETHER_BLADE_CARD_ID).numbers.passive2Damage;

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

        const applyScytheEffect = async (
            target: OpponentEntry, events: readonly BattleEvent[],
        ): Promise<void> => {
            const damaged = events.find((ev) => ev.type === 'damaged');
            const killing = events.some(
                (ev) => ev.type === 'defeated' && ev.target.kind === 'unit',
            );
            if (damaged && damaged.type === 'damaged') {
                console.log(`[scythe] target cardId=${target.card.cardId} HP: ${damaged.hpBefore} → ${damaged.hpAfter}`);
            }

            // Play the cut animation. For killing hits it hides the target and plays the split
            // halves; for mythic-survives it plays a dark flash without splitting.
            await scytheCutEffect.play(target.group, target.card.cardId, killing);

            if (killing) {
                reflowOpponentField();
                console.log(`[scythe] opponent idx=${target.cardIndex} defeated. Remaining: ${battle.getOpponentFieldCount()}`);
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
            const currentEnergy = opponentEnergyOf(targetIdx);
            const energyDrained = Math.min(2, currentEnergy);
            const damageMultiplier = 2 - energyDrained;  // 0 e → 2, 1 e → 1, ≥2 e → 0
            const damage = damageMultiplier * ENERGY_BURN_PER_MISSING_DAMAGE;

            const newEnergy = currentEnergy - energyDrained;
            setOpponentEnergy(targetIdx, newEnergy);

            let newHp = 0;
            let killing = false;
            if (damage > 0) {
                const currentHp = opponentHpOf(targetIdx);
                newHp = Math.max(0, currentHp - damage);
                setOpponentHp(targetIdx, newHp);
                killing = newHp <= 0;
                console.log(`[energy-burn] target cardId=${target.card.cardId} energy: ${currentEnergy} → ${newEnergy} (drained ${energyDrained}) damage=${damage} HP → ${newHp}${killing ? ' (defeated — card burns away)' : ''}`);
            } else {
                console.log(`[energy-burn] target cardId=${target.card.cardId} energy: ${currentEnergy} → ${newEnergy} (drained ${energyDrained}) no damage`);
            }

            // 상태는 연출을 기다리기 전에 다 바꾼다.
            if (killing) {
                defeatOpponentUnit(targetIdx);
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
                reflowOpponentField();
            }
        };

        // Used when an ITEM card from Your Hand resolves its effect — the spent card moves
        // into Your Tomb before the mesh is disposed. All current call sites are ITEM drops
        // (scythe, energy burn, doom contract, morale convert), so the burial is unconditional.
        const consumeHandCard = (entry: HandEntry, idx: number): void => {
            battle.sendToYourTomb(entry.card.cardId);
            battle.removeFromHand(entry.cardIndex);
            console.log(`[tomb] your cardId=${entry.card.cardId} → your tomb (used from hand)`);
            removeHandCardFromScreen(entry, idx);
        };

        // 카드를 화면에서 치운다. 무덤에 넣는 것은 전투가 이미 했다.
        const removeHandCardFromScreen = (entry: HandEntry, idx: number): void => {
            handOrder.splice(idx, 1);
            handGroup.remove(entry.group);
            handRenderer.getCardRenderer().dispose(entry.group);
        };

        // 파멸의 계약:
        //   1) 15 dmg to every alive opponent unit (HP state + death reflow)
        //   2) 15 dmg to the opponent master body
        //   3) Draw 1 card from the OPPONENT's deck → push to the OPPONENT's lost zone.
        //      (Not Your deck. In production this source will be the server-driven opponent
        //      deck snapshot.)
        // State mutations are timed to the effect's BOOM phase (~1400ms in) so the numbers
        // change on-screen the same beat the grimoire explodes.
        // 전투가 돌려준 일어난 일을 보고 화면을 고친다. 값은 이미 다 바뀌었다.
        const applyDoomContractToScreen = (events: readonly BattleEvent[]): void => {
            console.log(`[doom-contract] AoE ${DOOM_CONTRACT_DAMAGE} dmg to all opponent units + master; opponent deck → opponent lost zone`);
            let anyDefeated = false;
            for (const ev of events) {
                if (ev.type === 'damaged') {
                    const t = ev.target;
                    if (t.kind === 'unit') {
                        console.log(`  opponent idx=${t.battleCardId} HP: ${ev.hpBefore} → ${ev.hpAfter}${ev.hpAfter <= 0 ? ' (defeated)' : ''}`);
                    } else if (t.kind === 'opponentMaster') {
                        opponentMasterHpRenderer.setHp(opponentMasterHpGroup, opponentMasterHpFrame, ev.hpAfter);
                        console.log(`[opponent-master-hp] doom contract → ${ev.hpBefore} → ${ev.hpAfter}`);
                    }
                } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
                    const id = ev.target.battleCardId;
                    const e = opponentEntries.find((oe) => oe.cardIndex === id);
                    if (e) e.group.visible = false;
                    anyDefeated = true;
                } else if (ev.type === 'defeated' && ev.target.kind === 'opponentMaster') {
                    masterGroup.visible = false;
                } else if (ev.type === 'cardMoved' && ev.to === 'opponentLostZone') {
                    console.log(`  opponent deck → opponent lost zone: cardId ${ev.cardId} (opp deck remaining: ${battle.getOpponentDeckRemainingCount()})`);
                }
            }
            if (anyDefeated) reflowOpponentField();
        };

        const applyDoomContractEffect = async (events: readonly BattleEvent[]): Promise<void> => {
            // Effect timeline (DoomContractEffect.play phases): emerge 350 + shake 500 + suck
            // 500 + boom 300 + fade 400 ≈ 2050ms. The BOOM begins ~1350ms in — schedule the
            // screen update to land at that moment so units visibly die with the flash.
            const boomMs = 1380;
            const effectPromise = doomContractEffect.play();
            setTimeout(() => applyDoomContractToScreen(events), boomMs);
            await effectPromise;
        };

        // 망자의 늪 — swamp + wraiths + spectral cards visual. Pre-draws cardIds from the
        // deck, then plays SwampEffect. Each spectral card's arrival at the hand triggers
        // `onCardArrive`, which resolves the real card and appends it to Your Hand. If the
        // deck runs dry at < 3 cards, only that many wraiths/cards spawn.
        // Async, fire-and-forget from onDrop.
        const applySwampEffect = async (events: readonly BattleEvent[]): Promise<void> => {
            // 뽑는 것은 전투가 이미 했다. 화면은 돌려받은 카드 번호로 그린다.
            const drawn = events
                .filter((ev) => ev.type === 'cardMoved' && ev.from === 'yourDeck' && ev.to === 'hand')
                .map((ev) => ev as {cardId: number; battleCardId: number});
            const drawnIds = drawn.map((it) => it.cardId);
            // 알갱이가 닿을 때마다 앞에서부터 하나씩 꺼내 쓴다.
            let swampArrival = 0;
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
                    // 전투가 매긴 번호를 그대로 쓴다.
                    const issued = drawn[swampArrival++]?.battleCardId;
                    void handRenderer.appendCard(
                        handGroup, resolved[0], handCardFrame, issued,
                    ).then((newEntry) => {
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
        const applyMoraleConvertEffect = async (
            target: HandEntry, events: readonly BattleEvent[],
        ): Promise<void> => {
            const card = getCardById(target.card.cardId);
            const rawHp = card?.체력;
            const hpNum = typeof rawHp === 'number' ? rawHp : parseInt(String(rawHp ?? 0), 10) || 0;
            // 얼마나 얻는지는 전투가 이미 셌다. 여기서는 그 값으로 화면을 그린다.
            const gained = events.find(
                (ev) => ev.type === 'valueChanged' && ev.what === 'fieldEnergy',
            );
            const energyBefore = gained && gained.type === 'valueChanged' ? gained.before : battle.getFieldEnergy();
            const energyGain = gained && gained.type === 'valueChanged' ? gained.after - gained.before : 0;

            // Capture the source world position BEFORE removing the mesh.
            const sourceWorld = new THREE.Vector3(
                target.group.position.x,
                target.group.position.y,
                5,
            );

            // 유닛을 무덤으로 보내는 것도 전투가 이미 했다. 여기서는 화면에서 치운다.
            const placedIdx = placedOrder.indexOf(target);
            if (placedIdx >= 0) {
                placedOrder.splice(placedIdx, 1);
                handGroup.remove(target.group);
                handRenderer.getCardRenderer().dispose(target.group);
            }
            reflowHandAndPlaced();

            console.log(`[morale-convert] target cardId=${target.card.cardId} HP=${hpNum} → +${energyGain} energy pending (via animation); target → tomb`);

            if (energyGain <= 0) return;  // nothing to tick (HP 0-4)

            // 알갱이가 하나씩 닿을 때마다 숫자를 하나씩 올려 보인다. 실제 값은 이미 다 올랐다.
            let shownEnergy = energyBefore;

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
                shownEnergy += 1;
                energyRenderer.setEnergy(shownEnergy);
                energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);
            });

            console.log(`[morale-convert] effect complete; total field energy = ${battle.getFieldEnergy()}`);
        };

        // 넘쳐흐르는 사기 — drop on a placed ally to pull up to OVERFLOW_MORALE_MAX copies of
        // death-energy (cardId 93) out of the deck and attach them to that ally. If the deck
        // has fewer than MAX, attach however many were available (0-2). The card itself still
        // gets consumed (moved to tomb) regardless of how many energies were pulled — matches
        // the card's passive text "덱에서 찾아 최대 0~2개를 선택하여 유닛에게 수급".
        const applyOverflowMoraleEffect = async (
            target: HandEntry, events: readonly BattleEvent[],
        ): Promise<void> => {
            // 덱에서 꺼내 붙이는 것은 전투가 이미 했다. 화면은 몇 개가 붙었는지만 본다.
            const attachedEvents = events.filter((ev) => ev.type === 'energyAttached');
            const attached = attachedEvents.length;
            console.log(`[overflow-morale] target cardId=${target.card.cardId} → pulled ${attached} death-energy from deck (deck remaining=${battle.getYourDeckRemainingCount()})`);

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
            // 알갱이가 하나씩 닿을 때마다 앞에서부터 꺼내 쓴다.
            let overflowArrival = 0;
            await overflowMoraleEffect.play(deckPos, targetPos, attached, () => {
                const ev = attachedEvents[overflowArrival++];
                const newCount = ev && ev.type === 'energyAttached' ? ev.countAfter : 0;
                void updateCardEnergyVisual(target, newCount);
            });
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
            if (battle.getOpponentMasterHp() > 0) {
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
            battle.sendToYourTomb(sacrificed.card.cardId);
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
                    if (battle.getOpponentMasterHp() > 0) {
                        setOpponentMasterHp(battle.getOpponentMasterHp() - CORPSE_EXPLOSION_DAMAGE, 'corpse explosion');
                    }
                } else {
                    const prev = opponentHpOf(pick.cardIndex);
                    const newHp = Math.max(0, prev - CORPSE_EXPLOSION_DAMAGE);
                    setOpponentHp(pick.cardIndex, newHp);
                    const entry = opponentEntries.find((oe) => oe.cardIndex === pick.cardIndex);
                    console.log(`[corpse-explosion] projectile → opponent idx=${pick.cardIndex}${entry ? ` cardId=${entry.card.cardId}` : ''} ${prev} → ${newHp}${newHp <= 0 ? ' (defeated)' : ''}`);
                    // 상태는 여기서 다 바꾼다. 연출이 다 끝날 때까지 미루면 그 사이에
                    // 체력만 0 이고 필드에 남아 있는 상태가 된다. 화면 정리는 뒤에서 한다.
                    if (newHp <= 0) defeatOpponentUnit(pick.cardIndex);
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

            const masterDied = masterPicked && battle.getOpponentMasterHp() <= 0 && masterGroup.visible;
            // 여기부터는 화면 정리만 한다. 무덤과 필드에서 빼는 것은 이미 끝났다.
            const deadOpponentIndices: number[] = [];
            for (const idx of uniqueOpponentIdxs) {
                if (isOpponentAlive(idx)) continue;
                const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                if (!entry || !entry.group.visible) continue;
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
            const cards = battle.getYourDeckCards();
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
            const deckCards = battle.getYourDeckCards();
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
                // 고를 것이 없어도 카드는 쓴 것이 된다. 무덤에 넣고 섞는 것은 전투가 한다.
                send({
                    type: 'useCardOnField',
                    battleCardId: sourceEntry.cardIndex,
                    side: 'your',
                    pickedDeckIndexes: [],
                    shuffleSeed: makeShuffleSeed(),
                });
                const idx = handOrder.indexOf(sourceEntry);
                if (idx >= 0) removeHandCardFromScreen(sourceEntry, idx);
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

            // 무엇을 골랐는지만 보낸다. 덱에서 빼고 손패에 넣고 섞는 것은 전투가 한다.
            const selectedDeckIndices = Array.from(leonikSelectedPopupIndices)
                .map((i) => leonikEligibleDeckIndices[i]);
            const events = send({
                type: 'useCardOnField',
                battleCardId: sourceEntry.cardIndex,
                side: 'your',
                pickedDeckIndexes: selectedDeckIndices,
                shuffleSeed: makeShuffleSeed(),
            });
            const pulled = events
                .filter((ev) => ev.type === 'cardMoved' && ev.from === 'yourDeck' && ev.to === 'hand')
                .map((ev) => ev as {cardId: number; battleCardId: number});
            const pulledIds = pulled.map((it) => it.cardId);

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
                        // 전투가 매긴 번호를 그대로 쓴다.
                        const newEntry = await handRenderer.appendCard(
                            handGroup, resolved[0], handCardFrame, pulled[idx]?.battleCardId,
                        );
                        handOrder.push(newEntry);
                        reflowHandAndPlaced();
                    })();
                },
            );

            // 무덤에 넣고 섞는 것은 전투가 이미 했다. 화면에서 치우기만 한다.
            const idx = handOrder.indexOf(sourceEntry);
            if (idx >= 0) removeHandCardFromScreen(sourceEntry, idx);
            reflowHandAndPlaced();

            console.log(`[leonik] pulled ${pulledIds.join(',')} from deck → hand; leonik → tomb; deck shuffled; remaining=${battle.getYourDeckRemainingCount()}`);
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
                    battle.getTurnOwner() === 'your' &&
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
                                // 카드를 쓴다. 피해와 카드 이동은 전투가 한다.
                                void applyScytheEffect(opponentTarget, send({
                                    type: 'useCardOnUnit',
                                    battleCardId: droppedEntry.cardIndex,
                                    targetBattleCardId: opponentTarget.cardIndex,
                                }));
                                removeHandCardFromScreen(droppedEntry, handIndex);
                            } else if (cardId === ENERGY_BURN_CARD_ID) {
                                applyEnergyBurnEffect(opponentTarget);
                                consumeHandCard(droppedEntry, handIndex);
                            }
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
                                // 카드를 쓴다. 피해와 카드 이동은 전투가 한다.
                                const events = send({
                                    type: 'useCardOnField',
                                    battleCardId: droppedEntry.cardIndex,
                                    side: 'opponent',
                                });
                                void applyDoomContractEffect(events);
                                removeHandCardFromScreen(droppedEntry, handIndex);
                            }
                        } else if (cardId === MORALE_CONVERT_CARD_ID) {
                            // 사기 전환 — MUST land on a placed ally, else snap back unused.
                            const allyTarget = hitAllyAt(dropCx, dropCy);
                            if (allyTarget) {
                                // 카드를 쓴다. 유닛을 무덤으로 보내고 에너지를 얻는 것은 전투가 한다.
                                void applyMoraleConvertEffect(allyTarget, send({
                                    type: 'useCardOnUnit',
                                    battleCardId: droppedEntry.cardIndex,
                                    targetBattleCardId: allyTarget.cardIndex,
                                }));
                                removeHandCardFromScreen(droppedEntry, handIndex);
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
                                // 카드를 쓴다. 값을 바꾸고 카드를 무덤에 넣는 것은 전투가 한다.
                                const events = send({
                                    type: 'useCardOnField',
                                    battleCardId: droppedEntry.cardIndex,
                                    side: 'opponent',
                                });
                                const drained = events.find(
                                    (ev) => ev.type === 'valueChanged' && ev.what === 'opponentFieldEnergy',
                                );
                                const deadLandsDrain = drained && drained.type === 'valueChanged'
                                    ? {before: drained.before, after: drained.after}
                                    : null;
                                removeHandCardFromScreen(droppedEntry, handIndex);

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
                                    opponentEnergyTarget,
                                    rendererManager.getDomElement(),
                                    () => {
                                        // 값은 이미 전투가 바꿨다. 여기서는 그때 받은 것을 화면에 쓴다.
                                        if (deadLandsDrain) {
                                            opponentEnergyRenderer.setEnergy(deadLandsDrain.after);
                                            opponentEnergyRenderer.refresh(opponentFieldEnergyAreaFrame, opponentEnergyGroup, window.innerWidth, window.innerHeight);
                                            console.log(`[dead-lands] opponent field energy ${deadLandsDrain.before} → ${deadLandsDrain.after}`);
                                        }
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
                    // 필드 안에 떨어졌는지는 화면이 본다. 카드가 어디에 떨어졌는지는
                    // 화면에서만 알 수 있는 일이라 전투가 판단할 수 없다.
                    //
                    // 낼 수 있는 카드인지와 손패에서 빼고 필드에 놓는 것은 전투가 한다.
                    const playEvents = inside
                        ? send({type: 'playCardToField', battleCardId: droppedEntry.cardIndex})
                        : [];
                    const played = playEvents.some(
                        (ev) => ev.type === 'cardMoved' && ev.to === 'yourField',
                    );
                    if (played) {
                        handOrder.splice(handIndex, 1);
                        placedOrder.push(droppedEntry);
                        // 출격한 턴을 기록 — 이번 턴에는 공격/스킬 패널이 열리지 않는다.
                        // 나온 턴은 전투가 적어 둔다.
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
                        // 망자의 늪 — 뽑는 것과 카드 이동은 전투가 한다.
                        void applySwampEffect(send({
                            type: 'useCardOnField',
                            battleCardId: droppedEntry.cardIndex,
                            side: 'your',
                        }));
                        removeHandCardFromScreen(droppedEntry, handIndex);
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
                            // 덱에서 꺼내고 붙이고 무덤에 넣는 것은 전투가 한다.
                            void applyOverflowMoraleEffect(allyTarget, send({
                                type: 'useCardOnUnit',
                                battleCardId: droppedEntry.cardIndex,
                                targetBattleCardId: allyTarget.cardIndex,
                            }));
                            removeHandCardFromScreen(droppedEntry, handIndex);
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
                            // 죽음의 에너지는 전투가 붙인다. 차갑게 불타는 암흑 에너지는
                            // 붙인 뒤에도 그 유닛의 공격에 따라붙어서 아직 화면이 든다.
                            const attachEvents = cardId === DEATH_ENERGY_CARD_ID
                                ? send({
                                    type: 'useCardOnUnit',
                                    battleCardId: droppedEntry.cardIndex,
                                    targetBattleCardId: allyTarget.cardIndex,
                                })
                                : null;
                            if (attachEvents) removeHandCardFromScreen(droppedEntry, handIndex);
                            else consumeHandCard(droppedEntry, handIndex);
                            const targetWorld = new THREE.Vector3(
                                allyTarget.group.position.x,
                                allyTarget.group.position.y,
                                5,
                            );
                            // 손패에서 직접 떨군 에너지 카드 자신의 종족이 부착된다.
                            const droppedRace = cardRaceOf(cardId) ?? CardRace.UNDEAD;
                            const isColdDark = cardId === COLD_DARK_ENERGY_CARD_ID;
                            void overflowMoraleEffect.playDirectAttach(targetWorld, () => {
                                // 죽음의 에너지는 전투가 붙였다. 암흑 에너지는 아직 화면이 붙인다.
                                const attached = attachEvents?.find((ev) => ev.type === 'energyAttached');
                                let newCount: number;
                                if (attached && attached.type === 'energyAttached') {
                                    newCount = attached.countAfter;
                                } else {
                                    const unit = battle.findOnYourField(allyTarget.cardIndex);
                                    newCount = unit ? unit.addEnergy(droppedRace, 1) : 0;
                                }
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

        // 카드 한 장을 뽑고 화면에 붙인다. 뽑을 수 있는지는 전투가 판단한다.
        const drawOneCard = async (reason: string): Promise<boolean> => {
            return appendDrawnCardsToScreen(send({type: 'drawCard'}), reason);
        };

        // 전투가 뽑아 준 카드를 화면 손패에 붙인다. 뽑는 것은 이미 끝났다.
        const appendDrawnCardsToScreen = async (
            events: readonly BattleEvent[], reason: string,
        ): Promise<boolean> => {
            for (const ev of events) {
                if (ev.type === 'rejected') {
                    console.log(`[deck] ${reason} — ${ev.reason}`);
                    return false;
                }
                if (ev.type === 'cardMoved' && ev.from === 'yourDeck' && ev.to === 'hand') {
                    const resolved = resolveCards([ev.cardId], reason);
                    if (resolved.length === 0) return false;
                    // 전투가 매긴 번호를 그대로 쓴다. 안 그러면 나중에 이 카드를 못 찾는다.
                    const newEntry = await handRenderer.appendCard(
                        handGroup, resolved[0], handCardFrame, ev.battleCardId,
                    );
                    handOrder.push(newEntry);
                    reflowHandAndPlaced();
                    console.log(`[deck] ${reason} drew cardId=${ev.cardId}. Remaining: ${battle.getYourDeckRemainingCount()}`);
                }
            }
            return true;
        };

        // 'd' key — draw 1 card from the deck and append it to the hand. No deck visual.
        // New cards land at the end of handOrder; pagination reflow hides overflow on other pages.
        this.listen(document, 'keydown', async (e: KeyboardEvent) => {
            if (e.key !== 'd' && e.key !== 'D') return;
            await drawOneCard('draw');
        });

        // Pilot D-1 — field-energy HUD overlays
        const energyFrame = createDefaultFieldEnergyHudFrame();
        const energyRenderer = new FieldEnergyHudRendererV2(19);
        const energyElement = await energyRenderer.build(energyFrame);
        this.appendToBody(energyElement);

        // Opponent field energy HUD — 180° mirror of the player's (top 82.4%, left 90.4%)
        // around screen centre. The horizontal mirror is trivial: left = 100% - 90.4% - 7.2%
        // = 2.4%. The vertical mirror is SUBTLE: the HUD's height depends on viewport width
        // (image aspect 638/622 × widthPercent × vw), so a static `topPercent` would drift
        // at non-16:9 aspects. Instead anchor by the BOTTOM edge — "bottom: 82.4%" puts the
        // HUD's bottom edge at (100-82.4)=17.6% vh from top, the exact mirror of the player's
        // static TOP edge at 82.4% vh. This matches the opponent shaded-area mesh whose
        // stable anchor is also bottomEdgeYRatio = 0.176.
        // 이 화면의 시작 상대 필드 에너지다. 실제 대전에서는 서버가 준다.
        battle.setOpponentFieldEnergy(15);

        // Opponent field-energy SHADED AREA — a Three.js mesh at the 180°-mirror of the
        // player's Field Energy HUD. This is the visual target for the upcoming 죽음의 대지
        // drain effect (dark motes will converge here). Opacity 0.6 for position verification
        // now; once the final effect + position are confirmed the opacity drops to 0.
        const opponentFieldEnergyAreaFrame = createDefaultOpponentFieldEnergyAreaFrame();
        const opponentFieldEnergyAreaRenderer = new OpponentFieldEnergyAreaRendererV2();
        const opponentFieldEnergyAreaGroup =
            await opponentFieldEnergyAreaRenderer.build(opponentFieldEnergyAreaFrame);
        scene.add(opponentFieldEnergyAreaGroup);

        // 상대 패널과 숫자는 캔버스 안에 그린다. 화면 위에 얹는 조각(DOM)으로 두면 죽음의
        // 대지 연출이 그 뒤에서 돌아 무엇이 부서지는지 보이지 않는다.
        // 자리와 크기는 위 영역 프레임이 이미 재고 있어 그대로 쓴다.
        const opponentEnergyRenderer = new OpponentFieldEnergyHudRendererV2(battle.getOpponentFieldEnergy());
        const opponentEnergyGroup = await opponentEnergyRenderer.build(opponentFieldEnergyAreaFrame);
        scene.add(opponentEnergyGroup);

        // 죽음의 대지가 부서지는 대상에게 주는 되먹임을 캔버스 안 패널로 넘긴다.
        const opponentEnergyTarget = {
            setOffset: (dx: number, dy: number) =>
                opponentEnergyRenderer.setOffset(opponentEnergyGroup, dx, dy),
            setDamageLevel: (level: 0 | 1 | 2) =>
                opponentEnergyRenderer.setDamageLevel(opponentEnergyGroup, level),
        };

        const raceFrame = createDefaultFieldEnergyRaceHudFrame(1);
        const raceRenderer = new FieldEnergyRaceHudRendererV2();
        const raceElement = await raceRenderer.build(raceFrame);
        this.appendToBody(raceElement);

        const countFrame = createDefaultFieldEnergyCountHudFrame();
        const countRenderer = new FieldEnergyCountHudRendererV2(1);
        const countElement = await countRenderer.build(countFrame);
        this.appendToBody(countElement);

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
            if (fieldEnergyChargeCount < battle.getFieldEnergy()) {
                fieldEnergyChargeCount++;
                countRenderer.setCount(fieldEnergyChargeCount);
                countRenderer.update(countFrame, countElement, window.innerWidth, window.innerHeight);
            }
        });
        this.appendToBody(countPrevZone);
        this.appendToBody(countNextZone);

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
        this.appendToBody(racePrevZone);
        this.appendToBody(raceNextZone);

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
        this.appendToBody(guideElement);
        guideRenderer.show(guideElement, '카드를 드래그하여 이동하세요!', 3000);

        const timerFrame = createDefaultSandTimerHudFrame();
        const timerRenderer = new SandTimerHudRendererV2();
        const timerElement = await timerRenderer.build(timerFrame);
        this.appendToBody(timerElement);

        const turnFrame = createDefaultTurnHudFrame();
        const turnRenderer = new TurnHudRendererV2(1);
        const turnElement = await turnRenderer.build(turnFrame);
        this.appendToBody(turnElement);

        // ── 턴 전환 단일 진입점 ───────────────────────────────────────────────────────
        // Both transitions have two triggers now (button/hourglass, 'f' key/hourglass), so the
        // side effects live in one function each instead of being duplicated per trigger.

        // your → opponent. Triggers: 턴 종료 버튼 클릭, 모래시계 만료.
        // No-op unless it's currently your turn (idempotent).
        function endYourTurn(reason: string): void {
            // 넘어갈 수 있는지도, 암흑 화염을 정산하는 것도 전투가 한다.
            const events = send({type: 'endYourTurn'});
            if (events.some((ev) => ev.type === 'rejected')) return;

            timerRenderer.reset(timerElement);
            guideRenderer.show(guideElement, '상대방의 턴입니다.', 3000);
            console.log(`[turn-state] your → opponent (${reason}) · TURN ${battle.getTurnNumber()}`);
            applyDarkFlameToScreen(events);
        }

        // 암흑 화염으로 깎이고 쓰러진 것을 화면에 옮긴다. 값은 이미 다 바뀌었다.
        function applyDarkFlameToScreen(events: readonly BattleEvent[]): void {
            let anyDefeated = false;
            for (const ev of events) {
                if (ev.type === 'damaged' && ev.target.kind === 'unit') {
                    const idx = ev.target.battleCardId;
                    console.log(`[cold-dark-energy] 암흑 화염 → idx=${idx} HP ${ev.hpBefore} → ${ev.hpAfter}${ev.hpAfter <= 0 ? ' (defeated)' : ''}`);
                } else if (ev.type === 'defeated' && ev.target.kind === 'unit') {
                    const idx = ev.target.battleCardId;
                    const target = opponentEntries.find((oe) => oe.cardIndex === idx);
                    if (target) target.group.visible = false;
                    frozenBurningEffect.detach(idx);
                    anyDefeated = true;
                }
            }
            if (anyDefeated) reflowOpponentField();
        }

        // opponent → your. Triggers: 'f' 키, 모래시계 만료. Each full opponent→your cycle counts
        // as one turn, so we (a) increment TURN, (b) bump the main FIELD ENERGY by 1, (c) restart
        // the 60 s hourglass, and (d) DRAW one card from your deck into your hand (standard
        // turn-start draw), plus (e) announce the handback on the guide banner. No-op unless it's
        // currently the opponent's turn (idempotent).
        async function beginYourTurn(reason: string): Promise<void> {
            // 턴이 오르는 것, 필드 에너지가 느는 것, 빙결이 풀리는 것, 한 장 뽑는 것을
            // 전투가 한 번에 한다.
            const events = send({type: 'beginYourTurn'});
            if (events.some((ev) => ev.type === 'rejected')) {
                console.log(`[turn-state] ${reason} ignored — already your turn`);
                return;
            }
            guideRenderer.show(guideElement, '당신의 턴입니다.', 3000);

            turnRenderer.setTurn(battle.getTurnNumber());
            turnRenderer.update(turnFrame, turnElement, window.innerWidth, window.innerHeight);

            // Field Energy total (the big number, 19 → 20 → …), tracked by `battle.getFieldEnergy()`.
            // NOT the small `fieldEnergyChargeCount` above the Race marker — that one is a
            // per-card charge selector driven by prev/next hover zones.
            energyRenderer.setEnergy(battle.getFieldEnergy());
            energyRenderer.update(energyFrame, energyElement, window.innerWidth, window.innerHeight);

            timerRenderer.reset(timerElement);

            // 뽑은 카드와 풀린 빙결을 화면에 옮긴다. 값은 이미 다 바뀌었다.
            await appendDrawnCardsToScreen(events, 'turn-start');
            for (const ev of events) {
                if (ev.type === 'statusCleared' && ev.what === 'frozen') {
                    frozenBurningEffect.setState(ev.battleCardId, { freeze: false });
                    console.log(`[cold-dark-energy] idx=${ev.battleCardId} 빙결 해제 — 이번 턴 재빙결 불가`);
                }
            }

            console.log(`[turn-state] opponent → your (${reason}) · TURN ${battle.getTurnNumber()} · field energy ${battle.getFieldEnergy()}`);

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
                console.log(`[nether-blade] turn-start passive chain · TURN ${battle.getTurnNumber()}`);
                await triggerNetherBladePassive(entry);
            }
        }

        this.listen(document, 'keydown', (e: KeyboardEvent) => {
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

        // 열려 있는 팝업을 창 크기에 맞춰 다시 만든다.
        //
        // 팝업은 만들 때 창 크기를 재고 그 뒤로는 안 잰다. 작은 창에서 열어 두고 창을 키우면
        // 작은 채로 남는다. 그래서 창 크기가 바뀌면 다시 만들어야 하는데, 창을 끌어서 바꾸면
        // 이 일이 수십 번 불린다. 다시 만드는 것은 그림을 읽는 일이라 시간이 걸리고, 앞의 것이
        // 끝나기 전에 다음 것이 들어오면 팝업이 겹쳐 쌓인다.
        //
        // 그래서 끌기가 멈춘 뒤에 한 번만 만들고, 만드는 중에 또 바뀌면 끝난 뒤에 한 번 더 만든다.
        // 다섯 모두 안 열려 있으면 그냥 돌아오므로 열림 여부는 여기서 안 따진다.
        let popupRebuildTimer: ReturnType<typeof setTimeout> | null = null;
        let popupRebuilding = false;
        let popupRebuildAgain = false;

        const rebuildOpenPopups = async (): Promise<void> => {
            if (popupRebuilding) { popupRebuildAgain = true; return; }
            popupRebuilding = true;
            try {
                do {
                    popupRebuildAgain = false;
                    await reloadTombPopup();
                    await reloadOpponentTombPopup();
                    await reloadLostZonePopup();
                    await reloadOpponentLostZonePopup();
                    await reloadLeonikPopup();
                } while (popupRebuildAgain);
            } finally {
                popupRebuilding = false;
            }
        };

        const requestPopupRebuild = (): void => {
            if (popupRebuildTimer !== null) clearTimeout(popupRebuildTimer);
            popupRebuildTimer = setTimeout(() => {
                popupRebuildTimer = null;
                void rebuildOpenPopups();
            }, 150);
        };

        this.listen(window, 'resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            cameraManager.updateAspect(width, height);
            rendererManager.resize(width, height);

            backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height);
            yourFieldAreaRenderer.resize(yourFieldAreaFrame, yourFieldAreaGroup, width, height);
            opponentFieldAreaRenderer.resize(opponentFieldAreaFrame, opponentFieldAreaGroup, width, height);

            // 무덤 판과 로스트 존 판도 다시 잰다. 판 모양이 창 너비와 높이에서 나오고,
            // 누르는 자리는 그때그때 창 크기로 다시 재므로, 안 다시 그리면 그림과
            // 누르는 자리가 어긋난다.
            tombPanelRenderer.resize(tombPanelFrame, tombPanelGroup, width, height);
            opponentTombPanelRenderer.resize(opponentTombPanelFrame, opponentTombPanelGroup, width, height);
            lostZonePanelRenderer.resize(lostZonePanelFrame, lostZonePanelGroup, width, height);
            opponentLostZonePanelRenderer.resize(opponentLostZonePanelFrame, opponentLostZonePanelGroup, width, height);

            const cardRenderer = handRenderer.getCardRenderer();
            for (const entry of entries) {
                cardRenderer.resize(handCardFrame, entry.group);
            }
            reflowHandAndPlaced();

            opponentRenderer.resize(
                handCardFrame,
                opponentLayoutFrame,
                opponentGroup,
                width,
                height,
                opponentAliveIds(),
            );
            handPageButtonsRenderer.resize(handPageButtonsFrame, handPageButtonsGroup, width, height);
            // 턴 종료 버튼도 다시 잰다. 육각형 자리가 창 크기에서 나오므로,
            // 안 다시 재면 네온 테두리와 누름 자리가 처음 크기에 남는다.
            turnEndButtonRenderer.resize(turnEndButtonFrame, turnEndButtonGroup, width, height);

            energyRenderer.update(energyFrame, energyElement, width, height);
            opponentEnergyRenderer.resize(opponentFieldEnergyAreaFrame, opponentEnergyGroup, width, height);
            opponentFieldEnergyAreaRenderer.resize(opponentFieldEnergyAreaFrame, opponentFieldEnergyAreaGroup, width, height);
            raceRenderer.update(raceFrame, raceElement, width, height);
            countRenderer.update(countFrame, countElement, width, height);
            guideRenderer.update(guideFrame, guideElement, width, height);
            timerRenderer.update(timerFrame, timerElement, width, height);
            turnRenderer.update(turnFrame, turnElement, width, height);
            masterHpRenderer.resize(masterHpFrame, masterHpGroup, width, height);
            opponentMasterHpRenderer.resize(opponentMasterHpFrame, opponentMasterHpGroup, width, height);

            // 본체를 덮은 판과 필드 두 곳의 겨냥 자리를 다시 잰다. 셋 다 만들 때 창 크기를
            // 재고 그 뒤로 안 쟀다. 배경만 따라 줄어들고 이 셋은 옛 자리에 남아 있어서,
            // 겨냥 테두리가 대상에서 벗어난 데 그려졌다.
            const nextMasterArea = computeMasterArea(width, height);
            masterMesh.geometry?.dispose();
            masterMesh.geometry = new THREE.PlaneGeometry(nextMasterArea.width, nextMasterArea.height);
            masterGroup.position.set(nextMasterArea.centerX, nextMasterArea.centerY, 0);
            masterGroup.userData = {
                baseCardWidth: nextMasterArea.width,
                baseCardHeight: nextMasterArea.height,
            };

            opponentFieldNeonHost.position.set(
                opponentFieldAreaFrame.xPercent * width,
                opponentFieldAreaFrame.yPercent * height,
                0,
            );
            opponentFieldNeonHost.userData = {
                baseCardWidth:  opponentFieldAreaFrame.widthPercent  * width,
                baseCardHeight: opponentFieldAreaFrame.heightPercent * height,
            };

            yourFieldNeonHost.position.set(
                yourFieldAreaFrame.xPercent * width,
                yourFieldAreaFrame.yPercent * height,
                0,
            );
            yourFieldNeonHost.userData = {
                baseCardWidth:  yourFieldAreaFrame.widthPercent  * width,
                baseCardHeight: yourFieldAreaFrame.heightPercent * height,
            };

            // 붙어 있는 테두리는 붙일 때 크기를 읽어 둔 것이라, 대상이 커지거나 작아지면
            // 다시 읽어야 한다. 카드에 붙은 것도 함께 다시 읽는다.
            enemyNeonEffect.refreshSizes();
            allyTargetNeonEffect.refreshSizes();
            neonEffect.refreshSizes();

            // 도는 중인 연출도 창 크기에 맞춘다. 안 돌고 있으면 아무것도 안 한다.
            seaOfSpecterEffect.resize(width, height);

            // 액티브 패널을 카드 따라 옮긴다. 카드가 새 자리로 간 뒤라야 하므로 맨 마지막에 한다.
            if (activePanelGroup && activePanelAnchorOnCard) {
                const cardWidth = handCardFrame.cardWidthRatio * width;
                const cardHeight = cardWidth * handCardFrame.cardAspect;
                const cardPos = activePanelAnchorOnCard.entry.group.position;
                activePanelRenderer.resize(
                    activePanelFrame,
                    activePanelGroup,
                    {
                        x: cardPos.x + activePanelAnchorOnCard.xRatio * cardWidth,
                        y: cardPos.y + activePanelAnchorOnCard.yRatio * cardHeight,
                    },
                    width,
                );
            }

            requestPopupRebuild();
        });
    }
}

function resolveCards(cardIds: number[], label: string): CardFace[] {
    const out: CardFace[] = [];
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
