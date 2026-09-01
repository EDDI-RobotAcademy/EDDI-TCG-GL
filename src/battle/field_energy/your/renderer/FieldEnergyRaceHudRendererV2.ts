import { DomFrameRenderer } from "../../../../core/renderer/DomFrameRenderer";
import {
    FieldEnergyRaceHudFrame,
    resolveFieldEnergyRaceImageSrc,
} from "../frame/FieldEnergyRaceHudFrame";

// Mirrors showFieldEnergyRace() in src/common/card_race/CardRace.ts — container with an <img>
// whose width flexes via CSS percentage. No font geometry to recalc, so update() is effectively
// "swap image src if frame.raceId changed since build".
export class FieldEnergyRaceHudRendererV2 implements DomFrameRenderer<FieldEnergyRaceHudFrame> {
    public async build(frame: FieldEnergyRaceHudFrame): Promise<HTMLElement> {
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

        const img = document.createElement('img');
        img.src = resolveFieldEnergyRaceImageSrc(frame);
        img.alt = `field-energy-race-${frame.raceId}`;
        img.style.width = '100%';
        img.style.height = 'auto';
        container.appendChild(img);

        return container;
    }

    public update(
        frame: FieldEnergyRaceHudFrame,
        element: HTMLElement,
        _viewportWidth: number,
        _viewportHeight: number,
    ): void {
        const img = element.querySelector('img');
        if (!(img instanceof HTMLImageElement)) return;
        const desired = resolveFieldEnergyRaceImageSrc(frame);
        if (!img.src.endsWith(desired)) {
            img.src = desired;
            img.alt = `field-energy-race-${frame.raceId}`;
        }
    }

    public dispose(element: HTMLElement): void {
        element.remove();
    }
}
