import { DomFrameRenderer } from "../../../core/renderer/DomFrameRenderer";
import { FieldEnergyCountHudFrame } from "../frame/FieldEnergyCountHudFrame";

// Mirrors showFieldEnergyCount() in src/common/field_energy/FieldEnergyCount.ts — a fixed,
// translate(-50%, -50%) centered numeric div. Font size scales with viewport height on resize.
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
        element.style.transform = frame.transform;
        element.style.color = frame.color;
        element.style.fontWeight = frame.fontWeight;
        element.style.zIndex = frame.zIndex;
        element.style.pointerEvents = 'none';
        element.innerText = String(this.count);

        this.applyFontSize(frame, element, window.innerHeight);
        return element;
    }

    public update(
        frame: FieldEnergyCountHudFrame,
        element: HTMLElement,
        _viewportWidth: number,
        viewportHeight: number,
    ): void {
        element.innerText = String(this.count);
        this.applyFontSize(frame, element, viewportHeight);
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    private applyFontSize(frame: FieldEnergyCountHudFrame, element: HTMLElement, viewportHeight: number): void {
        const fontSize = (viewportHeight / frame.baseViewportHeight) * frame.baseFontSize;
        element.style.fontSize = `${fontSize}px`;
    }
}
