import { DomFrameRenderer } from "../../../core/renderer/DomFrameRenderer";
import { SandTimerHudFrame } from "../frame/SandTimerHudFrame";

interface Grain {
    x: number;
    y: number;
    radius: number;
    speed: number;
}

interface BuildResult {
    readonly container: HTMLElement;
    readonly box: HTMLDivElement;
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    readonly timeDisplay: HTMLDivElement;
    // Stored so reset() can restart the rAF loop without the caller re-passing the frame.
    frame: SandTimerHudFrame;
    elapsed: number;
    lastTime: number;
    grains: Grain[];
    rafHandle: number | null;
}

const BASE_CANVAS_WIDTH = 30;
const BASE_CANVAS_HEIGHT = 60;
const MAX_GRAINS = 60;

// Ports showSandTimer() verbatim in structure, routing state/DOM through the Renderer so
// dispose() can cleanly cancel the rAF loop (legacy leaks it).
export class SandTimerHudRendererV2 implements DomFrameRenderer<SandTimerHudFrame> {
    public build(frame: SandTimerHudFrame): Promise<HTMLElement> {
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
        container.appendChild(box);

        const canvas = document.createElement('canvas');
        box.appendChild(canvas);

        const timeDisplay = document.createElement('div');
        timeDisplay.style.color = frame.color;
        timeDisplay.style.fontWeight = 'bold';
        box.appendChild(timeDisplay);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return Promise.reject(new Error('SandTimerHudRendererV2: 2D context unavailable'));
        }

        const build: BuildResult = {
            container,
            box,
            canvas,
            ctx,
            timeDisplay,
            frame,
            elapsed: 0,
            lastTime: performance.now(),
            grains: [],
            rafHandle: null,
        };
        (container as HTMLElement & { __buildResult?: BuildResult }).__buildResult = build;

        this.applyViewportStyling(frame, build, window.innerWidth, window.innerHeight);
        this.startLoop(frame, build);

        return Promise.resolve(container);
    }

    public update(
        frame: SandTimerHudFrame,
        element: HTMLElement,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const build = (element as HTMLElement & { __buildResult?: BuildResult }).__buildResult;
        if (!build) return;
        this.applyViewportStyling(frame, build, viewportWidth, viewportHeight);
    }

    // Restart the timer from 0 with a fresh rAF loop. Safe to call any time — if the timer
    // had already run out (rafHandle null), we re-start the loop; if it's still running we
    // just rewind elapsed and let the existing loop pick up the new time.
    public reset(element: HTMLElement): void {
        const build = (element as HTMLElement & { __buildResult?: BuildResult }).__buildResult;
        if (!build) return;
        build.elapsed = 0;
        build.lastTime = performance.now();
        build.grains.length = 0;
        if (build.rafHandle === null) {
            this.startLoop(build.frame, build);
        }
        this.draw(build.frame, build);  // immediate repaint so the "60" flashes on screen now
    }

    public dispose(element: HTMLElement): void {
        const build = (element as HTMLElement & { __buildResult?: BuildResult }).__buildResult;
        if (build && build.rafHandle !== null) {
            cancelAnimationFrame(build.rafHandle);
            build.rafHandle = null;
        }
        element.remove();
    }

    private applyViewportStyling(
        frame: SandTimerHudFrame,
        build: BuildResult,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const paddingX = viewportWidth * frame.boxPaddingXRatio;
        const paddingY = viewportHeight * frame.boxPaddingYRatio;
        build.box.style.padding = `${paddingY}px ${paddingX}px`;

        build.canvas.width = viewportWidth * frame.canvasWidthRatio;
        build.canvas.height = viewportHeight * frame.canvasHeightRatio;

        const fontSize = (viewportHeight / frame.baseViewportHeight) * frame.baseFontSize;
        build.timeDisplay.style.fontSize = `${fontSize}px`;
        build.timeDisplay.style.marginLeft = `${viewportWidth * frame.textMarginLeftRatio}px`;
    }

    private startLoop(frame: SandTimerHudFrame, build: BuildResult): void {
        const step = (time: number): void => {
            const delta = (time - build.lastTime) / 1000;
            build.lastTime = time;
            build.elapsed += delta;
            this.draw(frame, build);

            if (build.elapsed < frame.durationSeconds) {
                build.rafHandle = requestAnimationFrame(step);
            } else {
                build.grains.length = 0;
                this.draw(frame, build);
                build.rafHandle = null;
            }
        };
        build.rafHandle = requestAnimationFrame(step);
    }

    private draw(frame: SandTimerHudFrame, build: BuildResult): void {
        const { ctx, canvas, grains } = build;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawFrame(ctx, canvas);
        const progress = Math.min(1, build.elapsed / frame.durationSeconds);
        const neckY = canvas.height / 2;
        const topHeight = (1 - progress) * neckY * 0.7;
        const bottomHeight = progress * neckY * 0.7;

        this.drawTopSand(ctx, canvas, topHeight, neckY);
        const surfaceY = this.drawBottomSand(ctx, canvas, bottomHeight, neckY);

        if (grains.length < MAX_GRAINS && Math.random() < 0.5) {
            this.spawnGrain(grains, canvas, topHeight, neckY);
        }
        this.updateGrains(grains, surfaceY, neckY, canvas);
        this.drawGrains(ctx, grains);

        const remaining = Math.max(0, frame.durationSeconds - Math.floor(build.elapsed));
        build.timeDisplay.style.color =
            remaining <= frame.warningThresholdSeconds ? frame.warningColor : frame.color;
        build.timeDisplay.innerText = remaining.toString();
    }

    private drawFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        const sx = (x: number) => (x / BASE_CANVAS_WIDTH) * canvas.width;
        const sy = (y: number) => (y / BASE_CANVAS_HEIGHT) * canvas.height;
        const neckY = canvas.height / 2;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(sx(5), sy(0));
        ctx.bezierCurveTo(sx(11), sy(20), sx(13), neckY, sx(13), neckY);
        ctx.bezierCurveTo(sx(11), sy(40), sx(5), sy(60), sx(5), sy(60));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx(25), sy(0));
        ctx.bezierCurveTo(sx(19), sy(20), sx(17), neckY, sx(17), neckY);
        ctx.bezierCurveTo(sx(19), sy(40), sx(25), sy(60), sx(25), sy(60));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx(5), sy(0));
        ctx.lineTo(sx(25), sy(0));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx(5), sy(60));
        ctx.lineTo(sx(25), sy(60));
        ctx.stroke();
    }

    private drawTopSand(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        topHeight: number,
        neckY: number,
    ): void {
        const sx = (x: number) => (x / BASE_CANVAS_WIDTH) * canvas.width;
        ctx.fillStyle = '#ffd700';
        const yStart = neckY - topHeight;
        for (let y = yStart; y < neckY; y++) {
            const t = y / neckY;
            const leftX = cubicBezier(sx(5), sx(11), sx(13), sx(13), t);
            const rightX = cubicBezier(sx(25), sx(19), sx(17), sx(17), t);
            ctx.fillRect(leftX, y, rightX - leftX, 1);
        }
    }

    private drawBottomSand(
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        bottomHeight: number,
        neckY: number,
    ): number {
        const sx = (x: number) => (x / BASE_CANVAS_WIDTH) * canvas.width;
        ctx.fillStyle = '#ffd700';
        const yEnd = canvas.height - bottomHeight;
        for (let y = canvas.height; y > yEnd; y--) {
            const t = (y - neckY) / (canvas.height - neckY);
            const leftX = cubicBezier(sx(13), sx(11), sx(5), sx(5), t);
            const rightX = cubicBezier(sx(17), sx(19), sx(25), sx(25), t);
            ctx.fillRect(leftX, y, rightX - leftX, 1);
        }
        return yEnd;
    }

    private spawnGrain(grains: Grain[], canvas: HTMLCanvasElement, topHeight: number, neckY: number): void {
        const yStart = neckY - topHeight;
        const x = canvas.width / 2 + (Math.random() * 2 - 1);
        const y = yStart + Math.random() * topHeight * 0.2;
        const speed = 0.5 + Math.random() * 0.5;
        grains.push({ x, y, radius: 0.6, speed });
    }

    private updateGrains(grains: Grain[], surfaceY: number, neckY: number, canvas: HTMLCanvasElement): void {
        for (let i = grains.length - 1; i >= 0; i--) {
            const g = grains[i];
            g.y += g.speed;
            if (g.y >= neckY - 1 && g.y <= neckY + 1) {
                g.x = canvas.width / 2 + (Math.random() * 2 - 1);
            }
            if (g.y >= surfaceY) grains.splice(i, 1);
        }
    }

    private drawGrains(ctx: CanvasRenderingContext2D, grains: Grain[]): void {
        ctx.fillStyle = '#ffd700';
        for (const g of grains) {
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
