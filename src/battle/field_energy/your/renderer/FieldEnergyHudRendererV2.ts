import { DomFrameRenderer } from "../../../../core/renderer/DomFrameRenderer";
import { FieldEnergyHudFrame } from "../frame/FieldEnergyHudFrame";

interface BuildResult {
    readonly element: HTMLElement;
    readonly box: HTMLDivElement;
    readonly img: HTMLImageElement;
    readonly label: HTMLDivElement;
}

// Mirrors showFieldEnergy() in src/battle/field_energy/your/FieldEnergy.ts:
//   - fixed-position container + relative inner box + absolutely-positioned numeric label
//   - label is appended to the box inside the image-load handler, so its top offset is
//     calculated against the real image height (not 0 from a detached node)
//   - build() returns synchronously after wiring listeners — image loading and the first
//     layout pass run after the scenario appends the element, exactly as the legacy code does
export class FieldEnergyHudRendererV2 implements DomFrameRenderer<FieldEnergyHudFrame> {
    private energy: number;

    constructor(initialEnergy: number = 0) {
        this.energy = initialEnergy;
    }

    public setEnergy(value: number): void {
        this.energy = value;
    }

    public build(frame: FieldEnergyHudFrame): Promise<HTMLElement> {
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
        box.style.position = 'relative';
        box.style.width = '100%';
        box.style.borderRadius = '6px';
        box.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = frame.imageSrc;
        img.alt = 'field-energy-bg';
        img.style.display = 'block';
        img.style.width = '100%';
        img.style.height = 'auto';
        box.appendChild(img);

        const label = document.createElement('div');
        label.textContent = String(this.energy);
        label.style.position = 'absolute';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.color = frame.labelColor;
        label.style.fontWeight = 'bold';
        label.style.fontFamily = frame.labelFontFamily;
        label.style.textShadow = frame.labelTextShadow;
        label.style.textAlign = 'center';
        // Intentionally not appending the label to the box yet — the image-load handler does
        // it so label height can be measured after DOM attachment (see updateLabelPosition).

        container.appendChild(box);

        const buildResult: BuildResult = { element: container, box, img, label };
        (container as HTMLElement & { __buildResult?: BuildResult }).__buildResult = buildResult;

        const updateLabelPosition = (): void => {
            if (!container.isConnected) {
                // Caller hasn't appended the element yet — try again next frame.
                requestAnimationFrame(updateLabelPosition);
                return;
            }
            this.applyLabelGeometry(frame, buildResult, window.innerHeight);
        };

        img.addEventListener('load', updateLabelPosition);
        img.addEventListener('error', () => {
            console.warn(`FieldEnergyHudRendererV2: image failed to load — ${frame.imageSrc}`);
            updateLabelPosition();
        });
        if (img.complete && img.naturalWidth > 0) {
            // Image came from cache; schedule the layout pass after the caller has appended.
            requestAnimationFrame(updateLabelPosition);
        }

        return Promise.resolve(container);
    }

    public update(
        frame: FieldEnergyHudFrame,
        element: HTMLElement,
        _viewportWidth: number,
        viewportHeight: number,
    ): void {
        const build = (element as HTMLElement & { __buildResult?: BuildResult }).__buildResult;
        if (!build) return;
        build.label.textContent = String(this.energy);
        this.applyLabelGeometry(frame, build, viewportHeight);
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }

    private applyLabelGeometry(
        frame: FieldEnergyHudFrame,
        build: BuildResult,
        viewportHeight: number,
    ): void {
        const fontSize = (viewportHeight / frame.baseViewportHeight) * frame.baseFontSize;
        build.label.style.fontSize = `${fontSize}px`;
        build.label.style.lineHeight = 'normal';

        if (!build.box.contains(build.label)) {
            build.box.appendChild(build.label);
        }

        const textHeight = build.label.getBoundingClientRect().height;
        const imgHeight = build.img.getBoundingClientRect().height;
        const offset = fontSize * frame.labelVerticalOffsetRatio;
        build.label.style.top = `${(imgHeight - textHeight) / 2 + offset}px`;
    }
}
