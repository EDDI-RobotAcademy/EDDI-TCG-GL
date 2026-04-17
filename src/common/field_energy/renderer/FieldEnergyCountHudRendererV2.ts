import { DomFrameRenderer } from "../../../core/renderer/DomFrameRenderer";
import { FieldEnergyCountHudFrame } from "../frame/FieldEnergyCountHudFrame";

export class FieldEnergyCountHudRendererV2 implements DomFrameRenderer<FieldEnergyCountHudFrame> {
    private count: number;

    constructor(initialCount: number = 0) {
        this.count = initialCount;
    }

    public setCount(value: number): void {
        this.count = value;
    }

    public async build(frame: FieldEnergyCountHudFrame): Promise<HTMLElement> {
        const element = document.createElement('div');
        element.style.position = 'fixed';
        element.style.top = frame.topPercent;
        element.style.left = frame.leftPercent;
        element.style.width = frame.widthPercent;
        element.style.aspectRatio = '1';
        element.style.transform = frame.transform;
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.color = frame.color;
        element.style.fontWeight = frame.fontWeight;
        element.style.zIndex = frame.zIndex;
        element.style.pointerEvents = 'none';
        element.style.borderRadius = '6px';
        element.style.lineHeight = '1';

        const span = document.createElement('span');
        span.style.transform = 'translateY(3px)';
        span.innerText = String(this.count);
        element.appendChild(span);

        (element as any).__textSpan = span;
        this.applyFontSize(frame, span, window.innerHeight);
        return element;
    }

    public update(
        frame: FieldEnergyCountHudFrame,
        element: HTMLElement,
        _viewportWidth: number,
        viewportHeight: number,
    ): void {
        const span = (element as any).__textSpan as HTMLElement | undefined;
        if (span) {
            span.innerText = String(this.count);
            this.applyFontSize(frame, span, viewportHeight);
        }
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    private applyFontSize(frame: FieldEnergyCountHudFrame, textEl: HTMLElement, viewportHeight: number): void {
        const fontSize = (viewportHeight / frame.baseViewportHeight) * frame.baseFontSize;
        textEl.style.fontSize = `${fontSize}px`;
    }
}
