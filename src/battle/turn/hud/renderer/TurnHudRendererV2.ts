import { DomFrameRenderer } from "../../../../core/renderer/DomFrameRenderer";
import { TurnHudFrame } from "../frame/TurnHudFrame";

interface BuildResult {
    readonly container: HTMLElement;
    readonly box: HTMLDivElement;
    readonly turnDisplay: HTMLDivElement;
}

export class TurnHudRendererV2 implements DomFrameRenderer<TurnHudFrame> {
    private turn: number;

    constructor(initialTurn: number = 1) {
        this.turn = initialTurn;
    }

    public setTurn(value: number): void {
        this.turn = value;
    }

    public build(frame: TurnHudFrame): Promise<HTMLElement> {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = frame.topPercent;
        container.style.left = frame.leftPercent;
        container.style.width = frame.widthPercent;
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.zIndex = frame.zIndex;
        container.style.pointerEvents = 'none';

        const box = document.createElement('div');
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
        box.style.borderRadius = frame.boxBorderRadius;
        box.style.width = '100%';
        box.style.background = frame.boxBackground;

        const turnDisplay = document.createElement('div');
        turnDisplay.style.color = frame.color;
        turnDisplay.style.fontWeight = frame.fontWeight;
        turnDisplay.innerText = `TURN ${this.turn}`;
        box.appendChild(turnDisplay);

        container.appendChild(box);

        const buildResult: BuildResult = { container, box, turnDisplay };
        (container as HTMLElement & { __buildResult?: BuildResult }).__buildResult = buildResult;

        this.applyViewportStyling(frame, buildResult, window.innerWidth, window.innerHeight);
        return Promise.resolve(container);
    }

    public update(
        frame: TurnHudFrame,
        element: HTMLElement,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const build = (element as HTMLElement & { __buildResult?: BuildResult }).__buildResult;
        if (!build) return;
        build.turnDisplay.innerText = `TURN ${this.turn}`;
        this.applyViewportStyling(frame, build, viewportWidth, viewportHeight);
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    private applyViewportStyling(
        frame: TurnHudFrame,
        build: BuildResult,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const paddingX = viewportWidth * frame.boxPaddingXRatio;
        const paddingY = viewportHeight * frame.boxPaddingYRatio;
        build.box.style.padding = `${paddingY}px ${paddingX}px`;

        const fontSize = (viewportHeight / frame.baseViewportHeight) * frame.baseFontSize;
        build.turnDisplay.style.fontSize = `${fontSize}px`;
    }
}
