import { CameraManager } from "../../../core/camera/CameraManager";
import { SeaOfSpecterEffect } from "../animation/skill/veln/SeaOfSpecterEffect";
import { installTween } from "../../../core/tween/Tween";
import { CardCatalog } from "../../domain/ability/CardCatalog";
import {
    SIMULATION_HAND_CARD_IDS, SIMULATION_OPPONENT_CARD_IDS, SIMULATION_OPPONENT_ENERGY,
    seedSimulationBattle,
} from "../../simulation/SimulationBattleSetup";
import { createOpponentMasterAreaFrame } from "../master_area/frame/OpponentMasterAreaFrame";
import { OpponentMasterAreaRendererV2 } from "../master_area/renderer/OpponentMasterAreaRendererV2";
import { ZonePanels } from "../zone/control/ZonePanels";
import { createZoneSpecs } from "../zone/control/zoneSpecs";
import { ViewportResize } from "../resize/ViewportResize";
import { PointerRouter } from "../input/PointerRouter";
import {
    CardDropTarget, CardPickSession, CardPresentationContext, DropHit, PickTarget,
} from "../card/CardPresentation";
import { findCardPresentation } from "../card/CardPresentationRegistry";
import { FieldNeonHostRenderer } from "../field/neon_host/renderer/FieldNeonHostRenderer";
import { computeOpponentFieldAreaBounds } from "../field/opponent/area/frame/OpponentFieldAreaFrame";
import { isInsideArea } from "../../../core/frame/AreaBounds";
import { AttackChoice, BattleCommand } from "../../domain/flow/BattleCommand";
import { BattleEvent } from "../../domain/flow/BattleEvent";
import { findCardAbility, cardIdsTargeting } from "../../domain/ability/CardAbility";
import { AbilityTarget } from "../../domain/ability/AbilityTarget";
import { RendererManager } from "../../../core/renderer/RendererManager";
import { SceneManager } from "../../../core/scene/SceneManager";
import { AnimationLoop } from "../../../core/animation/AnimationLoop";
import { AudioController } from "../../../audio/AudioController";
import battleFieldMusic from '@resource/music/battle_field/battle-field.mp3';

import { createBattleFieldBackgroundFrame } from "../../../background/frame/BackgroundFrame";
import { BackgroundRendererV2 } from "../../../background/renderer/BackgroundRendererV2";

import {
    createDefaultYourFieldAreaFrame,
    computeYourFieldAreaBounds,
} from "../field/your/area/frame/YourFieldAreaFrame";
import { YourFieldAreaRendererV2 } from "../field/your/area/renderer/YourFieldAreaRendererV2";
import {
    createDefaultPlacedCardPlacementFrame,
    computePlacedCardPosition,
} from "../field/your/area/frame/PlacedCardPlacementFrame";

import { createDefaultOpponentFieldAreaFrame } from "../field/opponent/area/frame/OpponentFieldAreaFrame";
import { OpponentFieldAreaRendererV2 } from "../field/opponent/area/renderer/OpponentFieldAreaRendererV2";
import { createDefaultOpponentFieldLayoutFrame } from "../field/opponent/frame/OpponentFieldLayoutFrame";
import { OpponentFieldRendererV2 } from "../field/opponent/renderer/OpponentFieldRendererV2";

import { CardFace } from "../hand/entity/CardFace";
import { HandEntry } from "../hand/renderer/BattleFieldHandRendererV2";
import { createDefaultHandCardFrame } from "../hand/frame/HandCardFrame";
import {
    createDefaultBattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../hand/frame/BattleFieldHandLayoutFrame";
import { BattleFieldHandRendererV2 } from "../hand/renderer/BattleFieldHandRendererV2";
import { HandInteractionBridge } from "../hand/interaction/HandInteractionBridge";

import { createDefaultHandPageButtonsFrame } from "../hand/page/frame/HandPageButtonsFrame";
import { HandPageButtonsRendererV2 } from "../hand/page/renderer/HandPageButtonsRendererV2";

import * as THREE from "three";

import { getCardById } from "../../../card/utility";
import { CardJob } from "../../../card/job";
import { CardKind } from "../../../card/kind";
import { CardRace } from "../../../card/race";
import { CardGrade } from "../../../card/grade";
import { getSkillType, SkillType } from "../../../card/SkillType";

import { FieldEnergyPanels, RACE_LABEL } from "../field_energy/control/FieldEnergyPanels";

import {
    createAllyNeonBorderFrame,
    createEnemyNeonBorderFrame,
    createAllyTargetingNeonBorderFrame,
} from "../../../neon_border/frame/NeonBorderFrame";
import { NeonBorderEffect } from "../../../neon_border/effect/NeonBorderEffect";

import { createDefaultActivePanelFrame, ActivePanelButtonSpec } from "../active_panel/frame/ActivePanelFrame";
import { ActivePanelRendererV2 } from "../active_panel/renderer/ActivePanelRendererV2";
import { AttackAnimationV2 } from "../animation/attack/AttackAnimationV2";
import { createCardSkillPositionFrame } from "../../../animation/skill/frame/CardSkillPositionFrame";
import { CardMoveEasing, moveCard } from "../../../animation/motion/CardMove";
import { SkillTripHandle } from "../animation/common/SkillTripHandle";
import { FrozenBurningOverlayEffect } from "../animation/card/energy/151_cold_dark_energy/FrozenBurningOverlayEffect";
import { ColdDarkTraitMarkEffect } from "../animation/card/energy/151_cold_dark_energy/ColdDarkTraitMarkEffect";





import {
    createDefaultTurnEndButtonFrame,
    isPointInsideTurnEndButton,
} from "../turn/end_button/frame/TurnEndButtonFrame";
import { TurnEndButtonRendererV2 } from "../turn/end_button/renderer/TurnEndButtonRendererV2";
import { BattleSessionImpl } from "../../session/BattleSessionImpl";
import {
    createDefaultMasterHpFrame,
    createOpponentMasterHpFrame,
} from "../master_hp/frame/MasterHpFrame";
import { MasterHpRendererV2 } from "../master_hp/renderer/MasterHpRendererV2";

import { createDefaultGuideMessageHudFrame } from "../../../common/guide_message/frame/GuideMessageHudFrame";

declare const TWEEN: { Tween: any; Easing: any; update: (time?: number) => void };
import { GuideMessageHudRendererV2 } from "../../../common/guide_message/renderer/GuideMessageHudRendererV2";
import { createDefaultSandTimerHudFrame } from "../../../common/timer/frame/SandTimerHudFrame";
import { SandTimerHudRendererV2 } from "../../../common/timer/renderer/SandTimerHudRendererV2";
import { createDefaultTurnHudFrame } from "../turn/hud/frame/TurnHudFrame";
import { TurnHudRendererV2 } from "../turn/hud/renderer/TurnHudRendererV2";

import {Component} from "../../../router/Component";

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

    // 듣는 것을 적어 둔다. 화면을 버릴 때 뗀다.
    //
    // 창과 글쇠뿐 아니라 그리는 자리도 받는다. 전에는 그리는 자리에 붙인 것을 여기 안
    // 적어서, 화면을 버려도 안 떼졌다.
    private listen(
        target: Window | Document | HTMLElement,
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
            getAttack: (cardId) => {
                const raw = (getCardById(cardId) as any)?.['공격력'];
                return typeof raw === 'number' ? raw : parseInt(String(raw ?? 0), 10) || 0;
            },
            getSkill: (cardId, slot) => {
                // 카드 데이터의 열 이름은 띄어쓰기가 들어간 한글이다.
                //   "스킬 1"            그 스킬이 누구를 치는가
                //   "스킬1 데미지"       카드에 적힌 기본 피해
                //   "스킬1 언데드필요에너지" 등 셋   종족별 비용
                const card = getCardById(cardId) as any;
                if (!card) return null;

                const rangeRaw = card[`스킬 ${slot}`];
                if (rangeRaw === undefined || rangeRaw === null || rangeRaw === '' || rangeRaw === '0') {
                    return null;
                }

                const damageRaw = card[`스킬${slot} 데미지`];
                const damage = typeof damageRaw === 'number'
                    ? damageRaw
                    : parseInt(String(damageRaw ?? 0), 10) || 0;

                const cost = new Map<CardRace, number>();
                const columns: ReadonlyArray<readonly [CardRace, string]> = [
                    [CardRace.UNDEAD, `스킬${slot} 언데드필요에너지`],
                    [CardRace.HUMAN, `스킬${slot} 휴먼필요에너지`],
                    [CardRace.TRENT, `스킬${slot} 트런트필요에너지`],
                ];
                for (const [race, column] of columns) {
                    const amount = card[column] ?? 0;
                    if (amount > 0) cost.set(race, amount);
                }

                return { range: getSkillType(rangeRaw), damage, cost };
            },
        };

        // 전투 한 판을 여기서 시작한다.
        //
        // 규칙을 구동하는 것은 판을 든 쪽이 맡는다. 화면은 규칙 기계를 만들지도, 쥐지도
        // 않는다. 전에는 화면이 제 손으로 만들어 제 안에서 돌렸다 (규칙 25).
        const session = BattleSessionImpl.getInstance();
        const battle = session.start(cardCatalog);

        // 사용자가 한 일 하나를 보내고, 무슨 일이 있었는지 받는다.
        // 어디서 셈하는지는 화면이 모른다.
        const send = (command: BattleCommand): BattleEvent[] => session.send(command);

        // 화면은 전투 안을 직접 안 본다. 이 창구를 본다.
        // 판을 차리는 열 군데만 아직 전투를 직접 쓴다. R2-113 에서 뺀다.
        const view = session.read();


        // 창 크기가 바뀔 때 다시 재야 하는 것을 모은다. 만드는 자리에서 바로 등록한다.
        const onResize = new ViewportResize();

        const rendererManager = new RendererManager(container);
        // 감출 때 이것만 감춘다. 함께 쓰는 자리를 감추면 다른 화면까지 사라진다.
        this.canvas = rendererManager.getDomElement();

        // 누름을 누가 먼저 받을지 정한다. 등록하는 자리가 어디든 칸 이름이 순서를 정한다.
        const pointerRouter = new PointerRouter(rendererManager.getDomElement());

        // 지금 사용자가 대상을 눌러 고르는 중인가. 카드가 채운다.
        //
        // 이 동안 화면은 딴 일을 안 받는다. 손패를 집을 수 없고, 누른 것은 전부 이 고르기로
        // 간다. 무엇을 누를 수 있는지와 눌렀을 때 무슨 일이 일어나는지는 카드가 안다.
        // **쌓아 둔다.** 레오닉의 부름으로 창을 열어 둔 채로 네더 블레이드를 내면 그 패시브가
        // 저절로 돌아 또 기다린다. 자리가 하나면 나중 것이 앞의 것을 덮어써서, 네더 블레이드
        // 고르기를 마친 뒤 레오닉의 창이 눌리지 않았다.
        //
        // 나중에 시작한 것이 위에 놓이고, 그것이 끝나면 아래 것이 다시 살아난다.
        const pickSessions: CardPickSession[] = [];
        const topPickSession = (): CardPickSession | null =>
            pickSessions.length > 0 ? pickSessions[pickSessions.length - 1] : null;

        // 고르는 중에 누른 것이 무엇인가. 본체를 먼저 보고 그다음 상대 유닛을 본다.
        //
        // 본체가 더 작아서 먼저 봐야 한다. 상대 유닛 쪽을 먼저 보면 겹친 자리에서 본체를
        // 못 누른다. 아무것도 못 맞히면 null — 그 누름은 그냥 먹힌다.
        const resolvePickTarget = (): PickTarget | null => {
            if (view.isOpponentMasterAlive()) {
                const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
                if (masterHits.length > 0) return {kind: 'opponentMaster'};
            }

            // 보이는 상대 유닛만. 맞은 것에서 그 유닛의 덩어리까지 거슬러 올라간다.
            const hits = sharedRaycaster.intersectObjects(opponentGroup.children, true);
            for (const hit of hits) {
                let walk: THREE.Object3D | null = hit.object;
                while (walk && walk.parent !== opponentGroup) walk = walk.parent;
                if (!(walk instanceof THREE.Group) || !walk.visible) continue;
                const entry = opponentEntries.find((oe) => oe.group === walk);
                if (entry) return {kind: 'opponentUnit', entry};
            }
            return null;
        };
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
        onResize.add('layout', (w, h) => backgroundRenderer.resize(backgroundFrame, backgroundGroup, w, h));

        const yourFieldAreaFrame = createDefaultYourFieldAreaFrame();
        const yourFieldAreaRenderer = new YourFieldAreaRendererV2();
        const yourFieldAreaGroup = await yourFieldAreaRenderer.build(yourFieldAreaFrame);
        scene.add(yourFieldAreaGroup);
        onResize.add('layout', (w, h) => yourFieldAreaRenderer.resize(yourFieldAreaFrame, yourFieldAreaGroup, w, h));

        // Pilot E new — opponent field area + opponent units
        const opponentFieldAreaFrame = createDefaultOpponentFieldAreaFrame();
        const opponentFieldAreaRenderer = new OpponentFieldAreaRendererV2();
        const opponentFieldAreaGroup = await opponentFieldAreaRenderer.build(opponentFieldAreaFrame);
        scene.add(opponentFieldAreaGroup);
        onResize.add('layout', (w, h) => opponentFieldAreaRenderer.resize(opponentFieldAreaFrame, opponentFieldAreaGroup, w, h));

        // 필드 영역 전체에 겨냥 테두리를 붙일 때 매달리는 빈 자리 둘.
        //
        // 상대 필드 쪽은 파멸의 계약을 집었을 때, 내 필드 쪽은 망자의 늪을 집었을 때 쓴다.
        const fieldNeonHostRenderer = new FieldNeonHostRenderer();
        const opponentFieldNeonHost = fieldNeonHostRenderer.build(opponentFieldAreaFrame);
        scene.add(opponentFieldNeonHost);
        const yourFieldNeonHost = fieldNeonHostRenderer.build(yourFieldAreaFrame);
        scene.add(yourFieldNeonHost);
        onResize.add('layout', (w, h) => {
            fieldNeonHostRenderer.resize(opponentFieldNeonHost, opponentFieldAreaFrame, w, h);
            fieldNeonHostRenderer.resize(yourFieldNeonHost, yourFieldAreaFrame, w, h);
        });

        // 상대 본체를 누를 수 있는 영역. 보이지 않는 판이다.
        const masterAreaFrame = createOpponentMasterAreaFrame();
        const masterAreaRenderer = new OpponentMasterAreaRendererV2();
        const masterGroup = await masterAreaRenderer.build(masterAreaFrame);
        scene.add(masterGroup);
        // 안 보이는 판이라 안 맞아도 눈에 안 띈다. 창 크기 문제가 여기서 여러 번 났다.
        onResize.add('layout', (w, h) => masterAreaRenderer.resize(masterAreaFrame, masterGroup, w, h));

        // 상대 본체 HP는 전투가 든다. 여기서는 표기만 맞춘다.

        const opponentMasterHpFrame = createOpponentMasterHpFrame();
        const opponentMasterHpRenderer = new MasterHpRendererV2();
        const opponentMasterHpGroup = await opponentMasterHpRenderer.build(opponentMasterHpFrame);
        scene.add(opponentMasterHpGroup);
        onResize.add('layout', (w, h) => opponentMasterHpRenderer.resize(opponentMasterHpFrame, opponentMasterHpGroup, w, h));

        // ── 메인 캐릭터(본체) HP ──────────────────────────────────────────────────
        // 수치는 hp/{n}.png 이미지에 새겨져 있고, 렌더러가 HP가 바뀔 때마다 텍스처를
        // 갈아 끼운다. 100에서 시작한다.
        const masterHpFrame = createDefaultMasterHpFrame();
        const masterHpRenderer = new MasterHpRendererV2();
        const masterHpGroup = await masterHpRenderer.build(masterHpFrame);
        scene.add(masterHpGroup);
        onResize.add('layout', (w, h) => masterHpRenderer.resize(masterHpFrame, masterHpGroup, w, h));
        // 내 본체 HP도 전투가 든다.

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
        // 손패의 시작 카드는 확인용 차림표가 정한다.
        const hand = resolveCards([...SIMULATION_HAND_CARD_IDS], 'hand');

        // 섞을 때 쓸 씨앗을 만든다. 도메인 안에서는 무작위를 못 쓰므로 밖에서 만들어 넣는다.
        // 씨앗을 적어 두면 같은 순서를 다시 만들 수 있다. 재접속과 다시 보기에 그것이 필요하다.
        const makeShuffleSeed = (): number => Math.floor(Math.random() * 0xffffffff);


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

        // 스킬을 쓰러 나가 있는 카드와, 끝나고 돌아갈 자리.
        //
        // 스킬을 쓰는 동안 카드는 제자리를 비우고 화면 가운데로 나간다. 그 사이에 창 크기가
        // 바뀌면 제자리가 달라지는데, 카드는 나갈 때 적어 둔 옛 자리로 돌아가 버린다.
        // 그래서 나가 있는 동안에는 카드를 세우는 대신 돌아갈 자리를 고쳐 둔다.
        const skillTripHome = new Map<THREE.Group, THREE.Vector3>();

        // 지금 스킬 자리에 서 있는 카드. 창 크기가 바뀌면 스킬 자리도 달라지므로 옮겨 준다.
        const skillTripParked = new Set<THREE.Group>();


        // 카드를 내보내는 연출을 돌리는 동안 제자리를 맡아 둔다. 도는 중에 창 크기가 바뀌면
        // 제자리를 다시 세는 쪽이 맡아 둔 값을 고치고, 연출은 돌아갈 때 그 값을 읽는다.
        const withSkillTripHome = async (
            group: THREE.Group,
            play: (trip: SkillTripHandle) => Promise<void>,
        ): Promise<void> => {
            const home = group.position.clone();
            skillTripHome.set(group, home);
            try {
                await play({
                    home,
                    parked: (parked: boolean) => {
                        if (parked) skillTripParked.add(group);
                        else skillTripParked.delete(group);
                    },
                });
            } finally {
                skillTripHome.delete(group);
                skillTripParked.delete(group);
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
        // 상대 필드의 시작 배치도 확인용 차림표가 정한다.
        const opponentCards = resolveCards([...SIMULATION_OPPONENT_CARD_IDS], 'opponent');
        SIMULATION_OPPONENT_ENERGY.forEach((count, index) => {
            if (opponentCards[index]) {
                opponentCards[index] = { ...opponentCards[index], energyCount: count };
            }
        });
        const opponentLayoutFrame = createDefaultOpponentFieldLayoutFrame();
        const opponentRenderer = new OpponentFieldRendererV2();
        const opponentGroup = await opponentRenderer.build(opponentCards, handCardFrame, opponentLayoutFrame);
        scene.add(opponentGroup);

        // ── 턴 종료 단추 — 오른쪽의 육각형. 누르면 상대에게 차례를 넘긴다.
        const turnEndButtonFrame = createDefaultTurnEndButtonFrame();
        const turnEndButtonRenderer = new TurnEndButtonRendererV2();
        const turnEndButtonGroup = await turnEndButtonRenderer.build(turnEndButtonFrame);
        scene.add(turnEndButtonGroup);
        // 육각형 자리가 창 크기에서 나온다. 안 다시 재면 네온 테두리와 누름 자리가 처음 크기에 남는다.
        onResize.add('layout', (w, h) => turnEndButtonRenderer.resize(turnEndButtonFrame, turnEndButtonGroup, w, h));

        // 마우스가 단추 위에 올라오면 네온 테두리를 켠다. 여기가 눌리는 자리라고 알리는 것이다.
        //
        // 육각형 안인지로 본다. 네모로 재면 모서리 바깥에서도 켜진다.
        let turnEndButtonHovered = false;
        const setTurnEndButtonHover = (hover: boolean): void => {
            if (turnEndButtonHovered === hover) return;
            turnEndButtonHovered = hover;
            turnEndButtonRenderer.setHover(turnEndButtonGroup, hover);
        };
        this.listen(rendererManager.getDomElement(), 'mousemove', (e: MouseEvent) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const worldX = e.clientX - w / 2;
            const worldY = h / 2 - e.clientY;
            setTurnEndButtonHover(
                isPointInsideTurnEndButton(worldX, worldY, turnEndButtonFrame, w, h),
            );
        });
        // 화면 밖으로 나가면 끈다. 나가는 순간에는 mousemove 가 안 온다.
        this.listen(rendererManager.getDomElement(), 'mouseleave', () => {
            setTurnEndButtonHover(false);
        });

        // 무덤과 로스트 존 넷. 판을 세우고 창을 다는 일은 그 폴더가 한다.
        //
        // 넷이 같은 모양이다 — 누를 수 있는 판 하나와 눌렀을 때 열리는 창 하나. 다른 것은
        // 판이 어떻게 생겼는지와 창이 어느 목록을 보여 주는지 둘뿐이다.
        const zonePanels = await ZonePanels.build(
            scene,
            createZoneSpecs(view),
            onResize,
            resolveCards,
            (message) => guideRenderer.show(guideElement, message, 3000),
        );




        // 확인용 판을 여기서 한 번에 차린다.
        //
        // 전에는 이 열 줄이 그리는 코드 사이사이에 흩어져 있었다. 무덤 그리는 코드 옆에
        // 무덤 채우는 줄이 있는 식이었다. 네트워크가 붙으면 이 한 줄만 빠진다.
        //
        // 손패와 상대 필드를 여기서 넘기는 것은 신원 번호가 화면이 만든 순서라서다.
        // 진짜 대전에서는 그 번호도 서버가 준다.
        seedSimulationBattle(
            battle,
            cardCatalog,
            entries.map((e) => ({battleCardId: e.cardIndex, cardId: e.card.cardId})),
            opponentCards.map((oc) => ({
                cardId: oc.cardId, energyCount: oc.energyCount, raceId: oc.raceId,
            })),
        );

        // 살아 있는 차례는 전투가 든 상대 필드 목록 그 자체다.
        // 상대 필드 카드가 어느 자리에 서는지도 이 차례로 정해진다.
        const opponentAliveIds = (): number[] =>
            view.opponentAliveIds();
        const isOpponentAlive = (cardIndex: number): boolean =>
            view.isOpponentAlive(cardIndex);
        const opponentEnergyOf = (cardIndex: number): number =>
            view.opponentUnitEnergyCount(cardIndex);

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

        // 사용자가 액티브 패널에서 고른 것. 대상을 고를 때까지 들고 있다가 명령에 담는다.
        // 얼마나 아픈지는 전투가 정하므로 여기서 안 든다.
        let pendingAttack: AttackChoice = 'general';
        // 연출 이름. 'general' / 'skill1' / 'skill2' 를 그대로 쓴다.
        let pendingAttackType: string = 'general';

        // Pilot E — hand page prev/next buttons with click handling
        const handPageButtonsFrame = createDefaultHandPageButtonsFrame();
        const handPageButtonsRenderer = new HandPageButtonsRendererV2();
        const handPageButtonsGroup = await handPageButtonsRenderer.build(handPageButtonsFrame);
        scene.add(handPageButtonsGroup);
        onResize.add('layout', (w, h) => handPageButtonsRenderer.resize(handPageButtonsFrame, handPageButtonsGroup, w, h));

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
        // 고르던 것을 화면에서 정리한다.
        //
        // 기다리던 것을 놓는 것은 전투가 한다. 턴을 끝내는 자리에서 함께 한다 (R2-103).
        // 여기서는 화면이 든 것만 치운다. 기다리던 약속을 안 풀면 그 자리에서 영영 멈춘다.
        function cancelPendingTargeting(): void {
            // 고르는 중에 턴이 넘어갔다. 그만두는 것은 전투가 이미 했고, 화면 쪽은 그 카드가 안다.
            //
            // 기다리던 약속을 반드시 풀어야 한다. 안 풀면 그 자리에서 영영 멈춘다. 그리고
            // 중단 표시를 세워 다음 카드의 패시브로 넘어가지 않게 한다.
            passiveChainAborted = true;
            // 쌓여 있는 것을 위에서부터 다 그만둔다.
            while (pickSessions.length > 0) {
                const session = pickSessions[pickSessions.length - 1];
                session.onCancel();
                // 카드가 제 끝내기를 안 불렀으면 여기서 뺀다. 안 그러면 영영 남는다.
                if (pickSessions[pickSessions.length - 1] === session) pickSessions.pop();
                console.log('[pick] 고르기 미완료 — 취소');
            }
            // 패널 / attackMode 타겟팅 + 선택 네온까지 한 번에 정리.
            clearAllSelection();
        }

        function passTurnOnExpiry(reason: string): void {
            cancelPendingTargeting();
            if (view.isYourTurn()) {
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
        // DoomContract takes extra deps: it uses a render-target + warp shader pipeline, which
        // needs the WebGLRenderer, the active camera, and a hook into AnimationLoop's render
        // path (setRenderOverride) to intercept per-frame rendering during the warp phase.
        // 창 크기가 바뀌면 도는 중인 연출도 함께 늘고 줄어야 한다. 한 자리에 모아 두고
        // 한꺼번에 알린다. 안 돌고 있는 연출은 알려도 아무 일도 안 한다.
        //
        // 카드에 직접 얹히는 것은 여기 없다. 카드가 늘고 줄 때 함께 따라간다.
        const resizableEffects: Array<{ resize(w: number, h: number): void }> = [
            attackAnimation,
            seaOfSpecterEffect,
        ];

        // 쓸 때마다 새로 만드는 연출은 위 목록에 못 넣는다. 도는 동안만 여기 담아 두고,
        // 끝나면 뺀다. 창 크기가 바뀌면 여기 담긴 것에도 알린다.
        const runningEffects = new Set<{ resize(w: number, h: number): void }>();

        const whileRunning = async (
            effect: { resize(w: number, h: number): void },
            run: () => Promise<void>,
        ): Promise<void> => {
            runningEffects.add(effect);
            try {
                await run();
            } finally {
                runningEffects.delete(effect);
            }
        };

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
        pointerRouter.add('modal', (e: MouseEvent) => {
            if (e.button !== 0) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const worldX = e.clientX - w / 2;
            const worldY = h / 2 - e.clientY;


            // ── -0.5) 카드를 쓴 뒤 사용자가 대상을 눌러 고르는 중 ──────────────────
            //
            // 이 동안은 누른 것이 전부 이 고르기로 간다. 무엇을 누를 수 있는지와 눌렀을 때
            // 무슨 일이 일어나는지는 카드가 안다. 화면은 누른 것이 무엇인지만 찾아 준다.
            const picking = topPickSession();
            if (picking !== null) {
                e.stopImmediatePropagation();
                sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
                if (picking.kind === 'ownSurface') {
                    // 카드가 띄운 제 창이다. 그 안이 어떻게 생겼는지는 카드만 안다.
                    // 레이캐스터는 미리 맞춰 둔다 — 카드가 단추를 찾을 때 쓴다.
                    picking.onClickAt(worldX, worldY);
                    return;
                }
                const target = resolvePickTarget();
                // 아무것도 못 맞혔으면 그 누름은 그냥 먹는다.
                if (target) picking.onPick(target);
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
            if (!zonePanels.anyOpen()) {
                if (isPointInsideTurnEndButton(worldX, worldY, turnEndButtonFrame, w, h)) {
                    e.stopImmediatePropagation();
                    endYourTurn('turn-end button');
                    return;
                }
            }

            // ── 판 넷과 열린 창 ──────────────────────────────────────────────────
            //
            // 판을 누르면 그 창이 열리고 닫힌다. 창이 열려 있으면 그 창이 누름을 먹는다.
            // 넷 중 어느 것인지 가리는 일은 그 폴더가 한다.
            sharedRaycaster.setFromCamera(ndcFromEvent(e), camera);
            if (zonePanels.handleClick(sharedRaycaster, worldX, worldY, w, h)) {
                e.stopImmediatePropagation();
                return;
            }
        });

        // Page button click
        pointerRouter.add('hud', (e: MouseEvent) => {
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
            const origPos = group.position.clone();
            skillTripHome.set(group, origPos);

            // 옮기는 일은 moveCard 가 한다. 예전에는 여기서 직접 계산했는데,
            // 그 식이 TWEEN 의 Quadratic.InOut 과 같은 곡선이라 값이 바뀌지 않는다.
            //
            // 갈 곳을 값이 아니라 물어보는 방법으로 준다. 가는 도중에 창 크기가 바뀌면
            // 갈 곳도 달라지는데, 값으로 굳혀 두면 옛 자리로 끝까지 가 버린다.
            const moveToLive = (to: () => { x: number; y: number; z: number }, durMs: number): Promise<void> =>
                moveCard(group, to, durMs, CardMoveEasing.inOut);

            const skillSlot = () => {
                const slot = createCardSkillPositionFrame(window.innerHeight);
                // Forward: lift z by +1 so the card draws above other field meshes during travel.
                return { x: slot.x, y: slot.y, z: origPos.z + 1 };
            };

            await moveToLive(skillSlot, 700);
            // 여기부터 돌아가기 전까지는 스킬 자리에 서 있다.
            skillTripParked.add(group);
            // Cast — run the effect at the panel slot, or just hold briefly.
            if (effectCallback) {
                const at = skillSlot();
                const panelPos = new THREE.Vector3(at.x, at.y, at.z);
                try {
                    await effectCallback(panelPos);
                } catch (err) {
                    console.error('[nether-blade] panel effect failed:', err);
                }
            } else {
                await new Promise<void>((r) => setTimeout(r, 300));
            }
            // Return to original slot.
            skillTripParked.delete(group);
            await moveToLive(() => origPos, 700);
            // Snap to exact original to avoid sub-pixel drift.
            group.position.copy(origPos);
            skillTripHome.delete(group);
            skillTripParked.delete(group);
        };

        pointerRouter.add('target', withResolving(async (e: MouseEvent) => {
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

                        const skillSlot: 1 | 2 | null =
                            btnType === 'skill1' ? 1 : btnType === 'skill2' ? 2 : null;

                        // 누구를 치는지만 묻는다. 대상을 골라야 하는 공격인지 여기서 갈리기 때문이다.
                        // 얼마나 아픈지는 안 묻는다. 전투가 명령을 받고 정한다.
                        const skillType = attackerId != null
                            ? view.attackRange(attackerId, skillSlot)
                            : SkillType.Single;

                        // ── 스킬 에너지 요구량 검사 ────────────────────────────────
                        // cardData의 "스킬N {종족}필요에너지" 3개 열이 그 스킬의 종족별 비용이다.
                        // 카드에 붙은 에너지도 종족별로 보관하므로 종족을 하나씩 대조한다.
                        // 일반 공격(general)은 비용 없음.
                        if (skillSlot !== null && attackerId != null && selectedAttackerEntry) {
                            const cost = view.skillCost(attackerId, skillSlot);
                            const missing = view.missingSkillEnergy(
                                selectedAttackerEntry.cardIndex, attackerId, skillSlot,
                            );
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
                            console.log(`${btnType} (AoE) → hitting all opponents`);
                            const atkEntry = selectedAttackerEntry;

                            // 때리는 것과 쓰러뜨리는 것은 전투가 한다. 본체까지 갈지도 여기서 정한다.
                            // 연출을 기다리기 전에 값을 다 바꾼다. 기다리는 동안 화면이 닫혀도
                            // 체력만 0 이고 필드에 남아 있는 어중간한 상태가 안 생긴다.
                            // 본체까지 갈지는 카드에 적힌 범위가 정한다. 전투가 판단한다.
                            const aoeEvents = send({
                                type: 'attackEveryOpponent',
                                attackerBattleCardId: atkEntry?.cardIndex ?? -1,
                                attack: skillSlot ?? 'general',
                            });

                            if (atkEntry) {
                                clearAllSelection();
                                // 네더 블레이드는 스킬 자리로 나갔다 돌아오기만 한다. 신화
                                // 등급에 맞는 광역기 연출은 아직 안 만들었다. 벨른은 온전한
                                // 광역기 연출을 그대로 쓴다.
                                if (atkEntry.card.cardId === NETHER_BLADE_CARD_ID) {
                                    await playSkillPanelMoveOnly(atkEntry.group);
                                } else {
                                    await withSkillTripHome(atkEntry.group, (trip) =>
                                        seaOfSpecterEffect.play(atkEntry.group, trip));
                                }
                            }

                            // 따라붙은 것은 전투가 이미 붙였다. 여기서는 그린다.
                            showColdDarkTraits(aoeEvents);

                            for (const ev of aoeEvents) {
                                if (ev.type !== 'damaged' || ev.target.kind !== 'unit') continue;
                                const idx = ev.target.battleCardId;
                                const entry = opponentEntries.find((oe) => oe.cardIndex === idx);
                                if (!entry) continue;

                                const currentHp = ev.hpBefore;
                                const newHp = ev.hpAfter;


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
                            pendingAttack = skillSlot ?? 'general';
                            pendingAttackType = btnType;
                            for (const entry of opponentEntries) {
                                if (entry.group.visible) {
                                    enemyNeonEffect.attach(entry.cardIndex, entry.group);
                                }
                            }
                            if (view.isOpponentMasterAlive()) {
                                enemyNeonEffect.attach(-1, masterGroup);
                            }
                            console.log(`${btnType} (Single) — choose opponent target or master`);
                        }
                    } else if (btnType === 'details') {
                        console.log('Details clicked — not implemented in pilot');
                        clearActivePanel();
                    }
                    return;
                }
            }

            // Check master click while in attack mode
            if (interactionState === 'attackMode' && view.isOpponentMasterAlive()) {
                const masterHits = sharedRaycaster.intersectObjects(masterGroup.children, true);
                if (masterHits.length > 0) {
                    e.stopImmediatePropagation();
                    const attackerEntry = selectedAttackerEntry;

                    clearAllSelection();

                    // 때리는 것은 전투가 한다. 연출을 기다리기 전에 값을 다 바꾼다.
                    const events = send({
                        type: 'attackOpponentMaster',
                        attackerBattleCardId: attackerEntry?.cardIndex ?? -1,
                        attack: pendingAttack,
                    });

                    if (attackerEntry) {
                        await withSkillTripHome(attackerEntry.group, (trip) =>
                            attackAnimation.playAttack(attackerEntry.group, masterGroup, pendingAttackType, trip));
                    }

                    for (const ev of events) {
                        if (ev.type === 'damaged' && ev.target.kind === 'opponentMaster') {
                            opponentMasterHpRenderer.setHp(opponentMasterHpGroup, opponentMasterHpFrame, ev.hpAfter);
                            console.log(`[opponent-master-hp] attack on MASTER (${pendingAttackType}) → ${ev.hpBefore} → ${ev.hpAfter}`);
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
                        attack: pendingAttack,
                    });

                    if (attackerEntry) {
                        await withSkillTripHome(attackerEntry.group, (trip) =>
                            attackAnimation.playAttack(attackerEntry.group, targetEntry.group, pendingAttackType, trip));
                    }
                    const hit = attackEvents.find((ev) => ev.type === 'damaged');
                    const currentHp = hit && hit.type === 'damaged' ? hit.hpBefore : 0;
                    const newHp = hit && hit.type === 'damaged' ? hit.hpAfter : 0;

                    // 따라붙은 것은 전투가 이미 붙였다. 여기서는 그린다.
                    showColdDarkTraits(attackEvents);

                    console.log(`Single-target attack: attacker=${attackerId} (${pendingAttackType}) → opponent idx=${targetIdx} cardId=${targetEntry.card.cardId} (HP: ${currentHp} → ${newHp})`);

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
                            console.log(`Opponent idx=${targetIdx} defeated! Remaining: ${view.opponentAliveCount()}`);
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
        // 오른쪽 단추. 왼쪽과 겨루지 않지만 누름 순서를 한 자리에서 보게 같이 둔다.
        pointerRouter.add('target', (e: MouseEvent) => void (async () => {
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
            if (!view.canYourUnitAct(selectedEntry.cardIndex)) {
                guideRenderer.show(guideElement, '이번 턴에 출격한 유닛으로 공격할 수 없습니다.', 3000);
                console.log(`[summoning-sickness] cardId=${selectedEntry.card.cardId} deployed on TURN ${view.turnNumber()} — panel blocked`);
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
        })());

        // 필드 에너지 — 표기 셋과 상대 쪽 판, 그리고 유닛에 붙이는 일까지 한 곳이 든다.
        //
        // 카드에 붙은 에너지는 전투가 든다. 종족마다 따로 센다 — 스킬 비용이 종족별 3개 열
        // (스킬N 언데드/휴먼/트런트필요에너지)로 정의되어 있고, 앞으로 여러 종족을 동시에
        // 요구하는 스킬이 추가될 예정이라 총량만으로는 판정할 수 없다.
        // 화면은 그 위에 얹은 그림만 든다.
        const fieldEnergy = await FieldEnergyPanels.build({
            scene,
            appendToBody: (element) => this.appendToBody(element),
            pointerRouter,
            onResize,
            handCardFrame,
            yourFieldEnergy: () => view.yourFieldEnergy(),
            opponentFieldEnergy: () => view.opponentFieldEnergy(),
            // 쓸 수 있는지 보고 깎고 붙이는 것은 전투가 한다.
            chargeUnit: (entry, race) => {
                const events = send({
                    type: 'attachFieldEnergyToUnit',
                    targetBattleCardId: entry.cardIndex,
                    race,
                });
                const attached = events.find((ev) => ev.type === 'energyAttached');
                return attached && attached.type === 'energyAttached' ? attached.totalAfter : null;
            },
            hitDeployedUnitAt: (event) => {
                sharedRaycaster.setFromCamera(ndcFromEvent(event), camera);
                const hits = sharedRaycaster.intersectObjects(handGroup.children, true);
                for (const hit of hits) {
                    let walkGroup: THREE.Object3D | null = hit.object;
                    while (walkGroup && walkGroup.parent !== handGroup) {
                        walkGroup = walkGroup.parent;
                    }
                    if (!(walkGroup instanceof THREE.Group) || !walkGroup.visible) continue;
                    const entry = findEntryByGroup(walkGroup);
                    if (entry && placedOrder.includes(entry)) return entry;
                }
                return null;
            },
            whileRunning: (effect, run) => whileRunning(effect, run),
        });

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

        // 따라붙은 것을 화면에 그린다. 붙이는 것은 전투가 이미 했다.
        //
        // 일어난 일에 [따라붙었다] 가 없으면 지닌 유닛의 공격이 아니었다는 뜻이다.
        function showColdDarkTraits(events: readonly BattleEvent[]): void {
            for (const ev of events) {
                if (ev.type !== 'coldDarkCarried') continue;
                const idx = ev.battleCardId;
                const target = opponentEntries.find((oe) => oe.cardIndex === idx);
                if (!target || !target.group.visible) continue;
                if (!ensureFrozenBurningOverlay(idx)) continue;

                frozenBurningEffect.setState(idx, {
                    flame: ev.darkFlame,
                    freeze: view.isOpponentUnitFrozen(idx),
                });
                console.log(
                    `[cold-dark-energy] idx=${idx} 암흑 화염 부여` +
                    (ev.frozen ? ' · 빙결 부여' : ' · 빙결 면역(연속 빙결 불가)'),
                );
            }
        }

        // 카드 능력의 숫자와 고르는 방식은 battle/ability/CardAbility 에 값으로 적혀 있다.
        // 전에는 이 화면 파일 안에 흩어져 있어서, 카드를 더할 때마다 이 파일이 커졌다.
        const ability = (cardId: number) => {
            const found = findCardAbility(cardId);
            if (!found) throw new Error(`카드 능력을 찾을 수 없다: ${cardId}`);
            return found;
        };



        const OPPONENT_TARGETING_ITEM_IDS: readonly number[] = cardIdsTargeting(AbilityTarget.OPPONENT_UNIT);




        // 이 에너지를 보유한 아군 유닛. 보유 개수가 아니라 보유 여부만 의미가 있다.

        // 상대 유닛의 상태이상은 전투가 든다. 암흑 화염, 빙결, 재빙결 불가.

        const ALLY_TARGETING_ITEM_IDS: readonly number[] = cardIdsTargeting(AbilityTarget.ALLY_UNIT);


        const FIELD_NEON_ENTITY_ID = -1;  // sentinel — distinct from any card.cardIndex




        const NETHER_BLADE_CARD_ID = 19;

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

        // 에너지 번 연출. 무엇이 일어났는지는 전투가 이미 정했다. 여기서는 그리기만 한다.
        // 카드를 화면에서 치운다. 무덤에 넣는 것은 전투가 이미 했다.
        // 카드를 화면에서 치운다. 무덤에 넣는 것은 전투가 이미 했다.
        //
        // **번호가 아니라 카드로 찾는다.** 전에는 부르는 쪽이 번호를 넘겼는데, 시체 폭발과
        // 레오닉의 부름은 떨어뜨리고 몇 초 뒤에 빠진다. 그 사이에 다른 카드가 빠지면 번호가
        // 밀려 엉뚱한 카드가 손패 목록에서 빠지고 정렬이 깨진다.
        const removeHandCardFromScreen = (entry: HandEntry): void => {
            const idx = handOrder.indexOf(entry);
            if (idx >= 0) handOrder.splice(idx, 1);
            handGroup.remove(entry.group);
            handRenderer.getCardRenderer().dispose(entry.group);
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

        // 카드가 정한 자리에 무엇이 있는지 찾는다. 없으면 null — 카드가 제자리로 돌아간다.
        const resolveCardDropHit = (
            dropTarget: CardDropTarget, dropX: number, dropY: number,
            canDropOnAlly?: (entry: HandEntry) => boolean,
        ): DropHit | null => {
            if (dropTarget === 'opponentUnit') {
                const target = hitOpponentAt(dropX, dropY);
                return target ? {kind: 'opponentUnit', entry: target} : null;
            }
            if (dropTarget === 'allyUnit') {
                const target = hitAllyAt(dropX, dropY);
                if (!target) return null;
                // 카드가 고르는 조건을 더 두었으면 그것도 본다. 시체 폭발은 언데드만 된다.
                if (canDropOnAlly && !canDropOnAlly(target)) return null;
                return {kind: 'allyUnit', entry: target};
            }
            const area = dropTarget === 'opponentFieldArea'
                ? computeOpponentFieldAreaBounds(
                    opponentFieldAreaFrame, window.innerWidth, window.innerHeight,
                )
                : computeYourFieldAreaBounds(
                    yourFieldAreaFrame, window.innerWidth, window.innerHeight,
                );
            return isInsideArea(area, dropX, dropY) ? {kind: 'area'} : null;
        };

        // 카드 연출이 쓸 수 있는 것을 모아 건넨다.
        //
        // 화면을 통째로 넘기지 않는다. 넘기면 카드가 아무거나 만질 수 있게 되고, 갈림길을
        // 파일로 흩어 놓은 것이 될 뿐이다. 여기 적힌 것이 곧 [카드 연출이 할 수 있는 일] 이다.
        const cardPresentationContext: CardPresentationContext = {
            scene,
            createEffect: (make) => make(scene, {
                renderer: rendererManager.getRenderer(),
                camera,
                animationLoop,
            }),
            withEffectGear: (run) => run({
                renderer: rendererManager.getRenderer(),
                camera,
                animationLoop,
            }),
            send,
            view,
            catalog: cardCatalog,
            hand: {
                cardFrame: handCardFrame,
                removeCard: (entry) => removeHandCardFromScreen(entry),
                reflow: () => reflowHandAndPlaced(),
                appendCard: (cardId, battleCardId) => {
                    const resolved = resolveCards([cardId], 'card-draw');
                    if (resolved.length === 0) return;
                    // 그림을 읽는 동안 기다리지 않는다. 다 읽히면 줄을 다시 세운다.
                    void handRenderer.appendCard(
                        handGroup, resolved[0], handCardFrame, battleCardId,
                    ).then((newEntry) => {
                        handOrder.push(newEntry);
                        reflowHandAndPlaced();
                    });
                },
                worldCenter: () => ({
                    x: 0,
                    y: handLayoutFrame.baselineYHeightRatio * window.innerHeight +
                        handLayoutFrame.baselineYWidthOffsetRatio * window.innerWidth,
                }),
            },
            whileRunning: (effect, run) => whileRunning(effect, run),
            opponentField: {
                reflow: () => reflowOpponentField(),
                flashAndShake: (group) => flashAndShakeTarget(group),
                redrawEnergyCount: (entry, count) =>
                    opponentRenderer.getCardRenderer()
                        .updateEnergyCount(entry.group, count, handCardFrame),
                hideUnit: (battleCardId) => {
                    const target = opponentEntries.find((oe) => oe.cardIndex === battleCardId);
                    if (target) target.group.visible = false;
                },
                unitWorldPosition: (battleCardId) => {
                    const target = opponentEntries.find((oe) => oe.cardIndex === battleCardId);
                    return target
                        ? {x: target.group.position.x, y: target.group.position.y}
                        : null;
                },
                isUnitVisible: (battleCardId) => {
                    const target = opponentEntries.find((oe) => oe.cardIndex === battleCardId);
                    return target ? target.group.visible : false;
                },
                bounds: () => computeOpponentFieldAreaBounds(
                    opponentFieldAreaFrame, window.innerWidth, window.innerHeight,
                ),
            },
            picking: {
                begin: (session) => { pickSessions.push(session); },
                end: () => { pickSessions.pop(); },
                markPickable: () => {
                    // 보이는 상대 유닛 전부와 본체에 붉은 테두리를 씌운다.
                    for (const oe of opponentEntries) {
                        if (oe.group.visible) enemyNeonEffect.attach(oe.cardIndex, oe.group);
                    }
                    if (view.isOpponentMasterAlive()) {
                        enemyNeonEffect.attach(FIELD_NEON_ENTITY_ID, masterGroup);
                    }
                },
                clearPickable: () => enemyNeonEffect.detachAll(),
                hitButtonIn: (group) => {
                    const hits = sharedRaycaster.intersectObjects(group.children, true);
                    for (const hit of hits) {
                        const buttonType = hit.object.userData.buttonType;
                        if (typeof buttonType === 'string') return buttonType;
                    }
                    return null;
                },
            },
            yourField: {
                removeUnit: (entry) => {
                    const placedIdx = placedOrder.indexOf(entry);
                    if (placedIdx < 0) return;
                    placedOrder.splice(placedIdx, 1);
                    handGroup.remove(entry.group);
                    handRenderer.getCardRenderer().dispose(entry.group);
                },
                bounds: () => computeYourFieldAreaBounds(
                    yourFieldAreaFrame, window.innerWidth, window.innerHeight,
                ),
                dropFromLineup: (entry) => {
                    // 줄에서만 뺀다. 그림은 제자리에 남아 있어서 날아가는 연출이 쓸 수 있다.
                    const idx = placedOrder.indexOf(entry);
                    if (idx >= 0) placedOrder.splice(idx, 1);
                },
                disposeUnit: (entry) => {
                    handGroup.remove(entry.group);
                    handRenderer.getCardRenderer().dispose(entry.group);
                },
            },
            fieldEnergy: {
                worldPosition: () => fieldEnergy.worldPosition(),
                setEnergy: (count) => fieldEnergy.setEnergy(count),
                syncToTruth: () => fieldEnergy.syncToTruth(),
            },
            cardEnergy: {
                setCount: (entry, count) => void fieldEnergy.showCardEnergy(entry, count),
                attachColdDarkMarks: (entry) => attachColdDarkTraitMarks(entry),
            },
            // 덱이 오른쪽 아래, 필드 에너지 표기 왼쪽에 있다.
            deckWorldPosition: () => ({
                x: (0.81 - 0.5) * window.innerWidth,
                y: (0.5 - 0.87) * window.innerHeight,
            }),
            opponentMaster: {
                setHp: (hp) => void opponentMasterHpRenderer.setHp(
                    opponentMasterHpGroup, opponentMasterHpFrame, hp,
                ),
                hide: () => { masterGroup.visible = false; },
                worldPosition: () => ({x: masterGroup.position.x, y: masterGroup.position.y}),
                isVisible: () => masterGroup.visible,
            },
            opponentFieldEnergy: {
                bounds: () => fieldEnergy.opponentBounds(),
                setEnergy: (count) => fieldEnergy.setOpponentEnergy(count),
                setOffset: (dx, dy) => fieldEnergy.setOpponentOffset(dx, dy),
                setDamageLevel: (level) => fieldEnergy.setOpponentDamageLevel(level),
            },
            canvasElement: rendererManager.getDomElement(),
            skillTrip: {
                play: (unit, atPanel) => playSkillPanelMoveOnly(unit, atPanel),
            },
            showCarriedStatus: (events) => showColdDarkTraits(events),
            resolveCards: (cardIds, label) => resolveCards([...cardIds], label),
            makeShuffleSeed: () => makeShuffleSeed(),
            whileResolving: (work) => runResolving(work),
            isAborted: () => passiveChainAborted,
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
                    view.isYourTurn() &&
                    pickSessions.length === 0,
                onPickup: (entityId, group) => {
                    clearActivePanel();
                    group.renderOrder = 100;
                    group.position.z = 1;
                    neonEffect.detachAll();
                    neonEffect.attach(entityId, group);
                    selectedAttackerEntry = findEntryByGroup(group) ?? null;
                    interactionState = 'cardSelected';

                    // 집은 카드를 어디에 놓을 수 있는지 테두리로 알린다.
                    //
                    // 어디에 놓을 수 있는지는 카드가 정한다. 전에는 카드 번호로 다섯 갈래를
                    // 갈라 봤고, 카드가 늘 때마다 그 다섯을 고쳐야 했다.
                    const pickedCardId = selectedAttackerEntry?.card.cardId;
                    const picked = pickedCardId != null
                        ? findCardPresentation(pickedCardId) : null;

                    if (picked?.dropTarget === 'opponentUnit') {
                        // 보이는 상대 유닛 전부. 본체는 안 된다.
                        for (const oe of opponentEntries) {
                            if (oe.group.visible) enemyNeonEffect.attach(oe.cardIndex, oe.group);
                        }
                    } else if (picked?.dropTarget === 'opponentFieldArea') {
                        // 유닛 하나가 아니라 상대 필드 영역 전체다.
                        enemyNeonEffect.attach(FIELD_NEON_ENTITY_ID, opponentFieldNeonHost);
                    } else if (picked?.dropTarget === 'yourFieldArea') {
                        allyTargetNeonEffect.attach(FIELD_NEON_ENTITY_ID, yourFieldNeonHost);
                    } else if (picked?.dropTarget === 'allyUnit') {
                        // 필드에 선 아군. 카드가 고르는 조건을 더 두었으면 그것만.
                        //
                        // 테두리의 신원은 놓인 차례를 쓴다. 카드 번호는 같은 아군이 둘일 때
                        // 겹친다.
                        let count = 0;
                        for (let i = 0; i < placedOrder.length; i++) {
                            const entry = placedOrder[i];
                            if (!entry.group.visible) continue;
                            if (picked.canDropOnAlly && !picked.canDropOnAlly(entry)) continue;
                            allyTargetNeonEffect.attach(i, entry.group);
                            count++;
                        }
                        if (count === 0) {
                            console.log(`[pickup] cardId=${pickedCardId} 놓을 수 있는 아군이 없다 — 제자리로 돌아간다`);
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

                    // 옮긴 카드는 카드 종류와 상관없이 제 파일이 받는다.
                    //
                    // 어디에 떨어져야 하는지는 카드가 정하고, 그 자리에 무엇이 있는지 찾는
                    // 일은 화면이 한다. 찾은 것을 넘겨 준다.
                    //
                    // 종류 판정보다 먼저다. 전에 ITEM 안에만 두었더니 ENERGY 인 죽음의
                    // 에너지와 SUPPORT 인 넘쳐 흐르는 사기가 아무 데도 안 걸렸다.
                    const presentation = findCardPresentation(cardId);
                    // 떨어뜨려 쓰는 카드만 여기서 받는다. 유닛 카드는 필드에 놓는 길로 간다.
                    if (presentation?.dropTarget && presentation.onDrop) {
                        const dropCx = group.position.x;
                        const dropCy = group.position.y;
                        const dropped = {
                            battleCardId: droppedEntry.cardIndex,
                            cardId,
                            entry: droppedEntry,
                        };
                        const hit = resolveCardDropHit(
                            presentation.dropTarget, dropCx, dropCy,
                            presentation.canDropOnAlly?.bind(presentation),
                        );
                        // 카드가 던지더라도 제자리 복귀는 반드시 한다. 안 그러면 카드가
                        // 떨어뜨린 자리에 그대로 멈춰 있는다.
                        try {
                            if (hit) presentation.onDrop(cardPresentationContext, dropped, hit);
                        } catch (error) {
                            console.error(`[card] cardId=${cardId} 사용 중 오류`, error);
                        }

                        // 집은 카드에 둘렀던 테두리는 놓는 순간 끈다. 카드가 손에서
                        // 떠났으므로 어느 경우에도 남으면 안 된다.
                        neonEffect.detachAll();

                        // 어디에 놓을 수 있는지 알리던 테두리는, 고르기가 시작됐으면 안 끈다.
                        // 그 카드가 [이제 무엇을 누를 수 있는지] 알리려고 방금 다시 켠 것이라
                        // 여기서 끄면 안내가 사라진다.
                        if (pickSessions.length === 0) {
                            enemyNeonEffect.detachAll();
                            allyTargetNeonEffect.detachAll();
                        }
                        selectedAttackerEntry = null;
                        interactionState = 'idle';
                        reflowHandAndPlaced();
                        return;
                    }

                    // 아이템·서포트·에너지 카드는 위에서 제 파일이 받는다. 여기 오는 것은
                    // 필드에 놓는 유닛 카드와, 아직 못 쓰는 카드다.
                    //
                    // 못 쓰는 카드는 아래에서 전투가 거절하고 제자리로 돌아간다.
                    if (kind !== CardKind.UNIT) {
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
                        // 여기는 떨어뜨린 그 자리라 번호가 아직 맞다.
                        handOrder.splice(handIndex, 1);
                        placedOrder.push(droppedEntry);
                        // 나온 턴은 전투가 적어 둔다. 이번 턴에는 공격·스킬 패널이 안 열린다.
                        //
                        // 낼 때 도는 패시브가 있으면 그 카드가 돌린다. 기다리지 않는다 —
                        // 아래의 줄 세우기가 먼저 끝나야 카드가 제자리에 선다.
                        const deployed = findCardPresentation(cardId);
                        if (deployed?.onDeploy) {
                            const entry = droppedEntry;
                            // 새 사슬의 시작. 지난 턴에 중단된 표시를 여기서 푼다.
                            passiveChainAborted = false;
                            void deployed.onDeploy(cardPresentationContext, {
                                battleCardId: entry.cardIndex,
                                group: entry.group,
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
        // 등록을 다 했다. 이제 듣기 시작한다.
        //
        // 손패 끌어다 놓기보다 앞에 붙는다. 창이 열려 있을 때 누름이 손패로 새어 나가면
        // 안 되기 때문이다. 전에는 capture 표시로 그것을 맞췄다.
        pointerRouter.attach('mousedown', (target, type, listener, options) =>
            this.listen(target, type, listener, options as AddEventListenerOptions));

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
                    console.log(`[deck] ${reason} drew cardId=${ev.cardId}. Remaining: ${view.yourDeckRemainingCount()}`);
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
            console.log(`[turn-state] your → opponent (${reason}) · TURN ${view.turnNumber()}`);
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

            turnRenderer.setTurn(view.turnNumber());
            turnRenderer.update(turnFrame, turnElement, window.innerWidth, window.innerHeight);

            // 남은 필드 에너지 전체다. 종족 표기 위의 작은 개수 고르개가 아니다.
            fieldEnergy.syncToTruth();

            timerRenderer.reset(timerElement);

            // 뽑은 카드와 풀린 빙결을 화면에 옮긴다. 값은 이미 다 바뀌었다.
            await appendDrawnCardsToScreen(events, 'turn-start');
            for (const ev of events) {
                if (ev.type === 'statusCleared' && ev.what === 'frozen') {
                    frozenBurningEffect.setState(ev.battleCardId, { freeze: false });
                    console.log(`[cold-dark-energy] idx=${ev.battleCardId} 빙결 해제 — 이번 턴 재빙결 불가`);
                }
            }

            console.log(`[turn-state] opponent → your (${reason}) · TURN ${view.turnNumber()} · field energy ${view.yourFieldEnergy()}`);

            // ── 턴마다 도는 패시브 ──────────────────────────────────────────────
            //
            // 필드에 서 있는 카드 중 턴 시작 때 도는 패시브를 가진 것을 차례로 돌린다.
            // 그 카드가 사용자에게 고르라고 기다리면 여기서 기다린다. 그래서 여럿이 서
            // 있어도 하나씩 차례를 지킨다 — 첫째의 고르기가 끝나야 둘째가 나간다.
            //
            // 어느 카드가 그런 패시브를 가졌는지는 카드가 안다. 화면이 카드 번호로 고르지 않는다.
            const turnStartUnits = placedOrder.filter((e) => {
                if (!e.group.visible) return false;
                return findCardPresentation(e.card.cardId)?.onTurnStart !== undefined;
            });
            passiveChainAborted = false;
            for (const entry of turnStartUnits) {
                if (passiveChainAborted) {
                    console.log('[passive] 턴이 넘어가 남은 패시브 중단');
                    break;
                }
                const presentation = findCardPresentation(entry.card.cardId);
                console.log(`[passive] turn-start · cardId=${entry.card.cardId} · TURN ${view.turnNumber()}`);
                await presentation?.onTurnStart?.(cardPresentationContext, {
                    battleCardId: entry.cardIndex,
                    group: entry.group,
                });
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
                    await zonePanels.rebuildOpenPopups();
                    // 카드가 띄운 창은 그 카드가 다시 그린다. 화면은 알려 주기만 한다.
                    for (const session of pickSessions) {
                        if (session.kind === 'ownSurface') session.onViewportChanged?.();
                    }
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

        // 남은 것들을 등록한다. 만드는 자리가 여기저기라 아직 한데 모여 있는 것도 있다.
        //
        // 손패 카드는 목록을 훑어야 하고, HUD 는 DOM 이라 같은 모양이 아니다.
        onResize.add('layout', (width, height) => {
            cameraManager.updateAspect(width, height);
            rendererManager.resize(width, height);

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

            guideRenderer.update(guideFrame, guideElement, width, height);
            timerRenderer.update(timerFrame, timerElement, width, height);
            turnRenderer.update(turnFrame, turnElement, width, height);
        });

        // 붙어 있는 테두리는 붙일 때 대상의 크기를 읽어 둔 것이라, 대상이 다시 재진 뒤에
        // 다시 읽어야 한다.
        onResize.add('attached', () => {
            enemyNeonEffect.refreshSizes();
            allyTargetNeonEffect.refreshSizes();
            neonEffect.refreshSizes();
        });

        // 스킬 자리에 서 있는 카드를 새 스킬 자리로 옮긴다. 그 자리도 창 높이에서 나온다.
        onResize.add('attached', (_width, height) => {
            if (skillTripParked.size === 0) return;
            const slot = createCardSkillPositionFrame(height);
            for (const group of skillTripParked) {
                group.position.set(slot.x, slot.y, group.position.z);
            }
        });

        // 도는 중인 연출도 창 크기에 맞춘다. 안 돌고 있으면 아무것도 안 한다.
        onResize.add('attached', (width, height) => {
            for (const effect of resizableEffects) effect.resize(width, height);
            for (const effect of runningEffects) effect.resize(width, height);
        });

        // 액티브 패널은 카드를 따라간다. 카드가 새 자리로 간 뒤여야 하므로 맨 마지막이다.
        onResize.add('last', (width) => {
            if (!activePanelGroup || !activePanelAnchorOnCard) return;
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
        });

        onResize.add('last', () => requestPopupRebuild());

        this.listen(window, 'resize', () => {
            onResize.apply(window.innerWidth, window.innerHeight);
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
