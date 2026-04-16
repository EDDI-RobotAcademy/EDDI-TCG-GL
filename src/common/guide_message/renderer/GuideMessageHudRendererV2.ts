import { DomFrameRenderer } from "../../../core/renderer/DomFrameRenderer";
import { GuideMessageHudFrame } from "../frame/GuideMessageHudFrame";

// The banner is created hidden by build(); the scenario calls show(text, duration) to display
// it with a message and auto-hide after `duration` ms. dispose() clears any pending timeout.
export class GuideMessageHudRendererV2 implements DomFrameRenderer<GuideMessageHudFrame> {
    private currentTimeout: number | null = null;

    public build(frame: GuideMessageHudFrame): Promise<HTMLElement> {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = frame.topPercent;
        div.style.left = frame.leftPercent;
        div.style.width = frame.widthPercent;
        div.style.transform = frame.transform;
        div.style.padding = frame.padding;
        div.style.background = frame.background;
        div.style.color = frame.color;
        div.style.fontSize = frame.fontSize;
        div.style.fontWeight = frame.fontWeight;
        div.style.borderTop = frame.borderTop;
        div.style.borderBottom = frame.borderBottom;
        div.style.boxShadow = frame.boxShadow;
        div.style.zIndex = frame.zIndex;
        div.style.textAlign = frame.textAlign;
        div.style.pointerEvents = 'none';
        div.style.display = 'none';
        return Promise.resolve(div);
    }

    public show(element: HTMLElement, message: string, durationMs: number): void {
        if (this.currentTimeout !== null) {
            clearTimeout(this.currentTimeout);
        }
        element.innerText = message;
        element.style.display = 'block';
        this.currentTimeout = window.setTimeout(() => {
            element.style.display = 'none';
            this.currentTimeout = null;
        }, durationMs);
    }

    public update(
        _frame: GuideMessageHudFrame,
        _element: HTMLElement,
        _viewportWidth: number,
        _viewportHeight: number,
    ): void {
        // No viewport-dependent reflow beyond CSS percentage handling.
    }

    public dispose(element: HTMLElement): void {
        if (this.currentTimeout !== null) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        element.remove();
    }
}
