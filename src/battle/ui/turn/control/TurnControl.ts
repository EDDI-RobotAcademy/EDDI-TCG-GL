import * as THREE from "three";

import {BattleCommand} from "../../../domain/flow/BattleCommand";
import {BattleEvent} from "../../../domain/flow/BattleEvent";
import {ViewportResize} from "../../../../core/resize/ViewportResize";
import {
    createDefaultSandTimerHudFrame,
    SandTimerHudFrame,
} from "../../../../common/timer/frame/SandTimerHudFrame";
import {SandTimerHudRendererV2} from "../../../../common/timer/renderer/SandTimerHudRendererV2";
import {createDefaultTurnHudFrame, TurnHudFrame} from "../hud/frame/TurnHudFrame";
import {TurnHudRendererV2} from "../hud/renderer/TurnHudRendererV2";
import {
    createDefaultTurnEndButtonFrame,
    isPointInsideTurnEndButton,
    TurnEndButtonFrame,
} from "../end_button/frame/TurnEndButtonFrame";
import {TurnEndButtonRendererV2} from "../end_button/renderer/TurnEndButtonRendererV2";

// 차례를 넘기는 일을 다루는 곳이다.
//
// 넘어가는 길이 넷이다 — 턴 종료 단추를 누르거나, 모래시계가 다 되거나, f 를 누르거나,
// 되돌릴 수 없는 동작이 끝나 보류했던 넘김이 풀리거나.
//
// 넷이 넘어갈 때 하는 일은 같다. 전투에 알리고, 안내를 띄우고, 턴 수를 올리고, 모래시계를
// 처음부터 돌린다. 전에는 이 넷이 화면 안 여섯 군데에 흩어져 있었고, 넘기는 순간에 무엇을
// 하는지 알려면 여섯 군데를 다 읽어야 했다.
//
// 넘어간 뒤에 화면이 무엇을 옮기는지는 여기가 정하지 않는다. 암흑 화염으로 쓰러진 것,
// 뽑힌 카드, 풀린 빙결, 턴마다 도는 패시브는 그것을 아는 쪽이 한다. 여기는 [넘어갔다] 를
// 알리고 그쪽을 부른다.

// 차례 넘기기가 바깥에 기대는 것.
export interface TurnDeps {
    readonly scene: THREE.Scene;
    readonly canvasElement: HTMLElement;
    appendToBody(element: HTMLElement): void;
    // 화면을 떠날 때 함께 떼도록 화면이 든다.
    listen(target: HTMLElement | Document, type: string, handler: (event: never) => void): void;
    readonly onResize: ViewportResize;
    // 사용자가 한 일 하나를 보내고 무슨 일이 있었는지 받는다.
    readonly send: (command: BattleCommand) => BattleEvent[];
    isYourTurn(): boolean;
    turnNumber(): number;
    yourFieldEnergy(): number;
    // 화면 가운데에 잠깐 띄우는 안내.
    announce(message: string): void;
    // 아직 고르기가 끝나지 않은 것을 화면에서 치운다. 아무것도 못 한 상태로 되돌린다.
    cancelPendingTargeting(): void;
    // 내 차례가 끝났다. 암흑 화염으로 깎이고 쓰러진 것을 화면에 옮긴다.
    onTurnEnded(events: readonly BattleEvent[]): void;
    // 내 차례가 시작됐다. 오른 에너지, 뽑힌 카드, 풀린 빙결을 화면에 옮긴다.
    onTurnBegan(events: readonly BattleEvent[]): Promise<void>;
    // 필드에 선 카드 중 차례가 시작될 때 도는 것을 차례로 돌린다.
    runTurnStartPassives(): Promise<void>;
}

export class TurnControl {
    // 되돌릴 수 없는 동작이 몇 겹 돌고 있나. 0 보다 크면 보류한다.
    private resolvingDepth = 0;
    // 모래시계가 다 됐지만 동작이 끝나기를 기다리는 중.
    private passDeferred = false;
    // 단추 위에 마우스가 올라와 있나. 같은 값을 다시 넣지 않으려고 든다.
    private buttonHovered = false;

    private constructor(
        private readonly deps: TurnDeps,
        private readonly timerFrame: SandTimerHudFrame,
        private readonly timerRenderer: SandTimerHudRendererV2,
        private readonly timerElement: HTMLElement,
        private readonly turnFrame: TurnHudFrame,
        private readonly turnRenderer: TurnHudRendererV2,
        private readonly turnElement: HTMLElement,
        private readonly buttonFrame: TurnEndButtonFrame,
        private readonly buttonRenderer: TurnEndButtonRendererV2,
        private readonly buttonGroup: THREE.Group,
    ) {}

    public static async build(deps: TurnDeps): Promise<TurnControl> {
        const timerFrame = createDefaultSandTimerHudFrame();
        const timerRenderer = new SandTimerHudRendererV2();
        const timerElement = await timerRenderer.build(timerFrame);
        deps.appendToBody(timerElement);

        const turnFrame = createDefaultTurnHudFrame();
        const turnRenderer = new TurnHudRendererV2(1);
        const turnElement = await turnRenderer.build(turnFrame);
        deps.appendToBody(turnElement);

        // 턴 종료 단추 — 오른쪽의 육각형. 누르면 상대에게 차례를 넘긴다.
        const buttonFrame = createDefaultTurnEndButtonFrame();
        const buttonRenderer = new TurnEndButtonRendererV2();
        const buttonGroup = await buttonRenderer.build(buttonFrame);
        deps.scene.add(buttonGroup);

        const control = new TurnControl(
            deps,
            timerFrame, timerRenderer, timerElement,
            turnFrame, turnRenderer, turnElement,
            buttonFrame, buttonRenderer, buttonGroup,
        );

        control.installHover();
        control.installKey();
        control.installExpiry();

        deps.onResize.add('layout', (width, height) => {
            timerRenderer.update(timerFrame, timerElement, width, height);
            turnRenderer.update(turnFrame, turnElement, width, height);
            // 육각형 자리가 창 크기에서 나온다. 안 다시 재면 네온 테두리와 누름 자리가
            // 처음 크기에 남는다.
            buttonRenderer.resize(buttonFrame, buttonGroup, width, height);
        });

        return control;
    }

    // 모래시계를 처음부터 돌린다. 화면이 다 차려진 뒤에 한 번 부른다 — 그림을 읽는 동안
    // 흘러간 시간을 사용자의 차례에서 깎지 않는다.
    public startCountdown(): void {
        this.timerRenderer.reset(this.timerElement);
    }

    // 매 프레임 — 단추의 네온 테두리가 숨 쉬듯 밝아진다.
    public updateAnimation(): void {
        this.buttonRenderer.updateAnimation(this.buttonGroup, this.buttonFrame);
    }

    // ── 넘기기 ──────────────────────────────────────────────────────────────────

    // 내 차례 → 상대 차례. 누르는 길은 턴 종료 단추와 모래시계 둘.
    // 내 차례가 아니면 아무 일도 없다.
    public endTurn(reason: string): void {
        // 넘어갈 수 있는지도, 암흑 화염을 정산하는 것도 전투가 한다.
        const events = this.deps.send({type: 'endYourTurn'});
        if (events.some((ev) => ev.type === 'rejected')) return;

        this.timerRenderer.reset(this.timerElement);
        this.deps.announce('상대방의 턴입니다.');
        console.log(
            `[turn-state] your → opponent (${reason}) · TURN ${this.deps.turnNumber()}`,
        );
        this.deps.onTurnEnded(events);
    }

    // 상대 차례 → 내 차례. 한 바퀴가 한 턴이라 턴 수가 오르고, 필드 에너지가 하나 늘고,
    // 모래시계가 처음부터 돌고, 한 장을 뽑는다. 상대 차례가 아니면 아무 일도 없다.
    public async beginTurn(reason: string): Promise<void> {
        // 턴이 오르는 것, 필드 에너지가 느는 것, 빙결이 풀리는 것, 한 장 뽑는 것을
        // 전투가 한 번에 한다.
        const events = this.deps.send({type: 'beginYourTurn'});
        if (events.some((ev) => ev.type === 'rejected')) {
            console.log(`[turn-state] ${reason} ignored — already your turn`);
            return;
        }
        this.deps.announce('당신의 턴입니다.');

        this.turnRenderer.setTurn(this.deps.turnNumber());
        this.turnRenderer.update(
            this.turnFrame, this.turnElement, window.innerWidth, window.innerHeight,
        );
        this.timerRenderer.reset(this.timerElement);

        // 뽑힌 카드와 풀린 빙결과 오른 에너지를 화면에 옮긴다. 값은 이미 다 바뀌었다.
        await this.deps.onTurnBegan(events);

        console.log(
            `[turn-state] opponent → your (${reason}) · TURN ${this.deps.turnNumber()}` +
            ` · field energy ${this.deps.yourFieldEnergy()}`,
        );

        await this.deps.runTurnStartPassives();
    }

    // 모래시계가 다 됐다. 그 순간 차례를 쥔 쪽이 차례를 잃는다.
    private passOnExpiry(reason: string): void {
        this.deps.cancelPendingTargeting();
        if (this.deps.isYourTurn()) this.endTurn(reason);
        else void this.beginTurn(reason);
    }

    // ── 되돌릴 수 없는 동작 중의 만료 ───────────────────────────────────────────

    // 고르기가 끝난 뒤의 되돌릴 수 없는 동작을 감싼다. 도는 동안 모래시계가 다 되면 즉시
    // 넘기지 않고, 끝난 직후에 넘긴다. 모래시계도 그 시점부터 다시 돈다.
    public async whileResolving<T>(work: () => Promise<T>): Promise<T> {
        this.resolvingDepth += 1;
        try {
            return await work();
        } finally {
            this.resolvingDepth -= 1;
            if (this.resolvingDepth === 0 && this.passDeferred) {
                this.passDeferred = false;
                console.log('[turn-state] 동작 완료 — 보류했던 턴 넘김 실행');
                this.passOnExpiry('timer expired (deferred)');
            }
        }
    }

    // ── 누름 ────────────────────────────────────────────────────────────────────

    // 턴 종료 단추가 눌렸나. 눌렸으면 차례를 넘기고 true — 그 누름은 여기서 끝난다.
    //
    // 육각형 안인지로 본다. 네모로 재면 모서리 바깥에서도 눌린다.
    public handleClick(
        worldX: number, worldY: number, viewportWidth: number, viewportHeight: number,
    ): boolean {
        if (!isPointInsideTurnEndButton(
            worldX, worldY, this.buttonFrame, viewportWidth, viewportHeight,
        )) {
            return false;
        }
        this.endTurn('turn-end button');
        return true;
    }

    // ── 세우기 ──────────────────────────────────────────────────────────────────

    // 마우스가 단추 위에 올라오면 네온 테두리를 켠다. 여기가 눌리는 자리라고 알리는 것이다.
    private installHover(): void {
        const setHover = (hover: boolean): void => {
            if (this.buttonHovered === hover) return;
            this.buttonHovered = hover;
            this.buttonRenderer.setHover(this.buttonGroup, hover);
        };
        this.deps.listen(this.deps.canvasElement, 'mousemove', (event: never) => {
            const e = event as unknown as MouseEvent;
            const width = window.innerWidth;
            const height = window.innerHeight;
            setHover(isPointInsideTurnEndButton(
                e.clientX - width / 2, height / 2 - e.clientY,
                this.buttonFrame, width, height,
            ));
        });
        // 화면 밖으로 나가면 끈다. 나가는 순간에는 mousemove 가 안 온다.
        this.deps.listen(this.deps.canvasElement, 'mouseleave', () => setHover(false));
    }

    private installKey(): void {
        this.deps.listen(document, 'keydown', (event: never) => {
            const e = event as unknown as KeyboardEvent;
            if (e.key !== 'f' && e.key !== 'F') return;
            void this.beginTurn(`'f' key`);
        });
    }

    // 모래시계가 다 됐을 때. 되돌릴 수 없는 동작이 도는 중이면 보류한다 — 여기서 모래시계를
    // 다시 돌리지 않는다. 동작이 끝난 시점부터 다시 돈다. 아직 고르는 중이라면 고르던 것을
    // 치워 아무 일도 없던 상태로 되돌린 뒤 그대로 넘어간다.
    private installExpiry(): void {
        this.timerRenderer.setOnExpire(this.timerElement, () => {
            if (this.resolvingDepth > 0) {
                this.passDeferred = true;
                console.log('[turn-state] 모래시계 만료 — 진행 중인 동작 완료 후 턴 넘김 예약');
                return;
            }
            this.passOnExpiry('timer expired');
        });
    }
}
