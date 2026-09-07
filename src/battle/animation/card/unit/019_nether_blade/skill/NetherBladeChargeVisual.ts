// 네더 블레이드 기술의 **충전(gather / hold) 비주얼**.
//
// 광역기와 단일기가 도입부를 공유하므로 그 부분만 떼어냈다. 소용돌이쳐 빨려드는
// 보라 입자, 궤도를 도는 위습, 중앙의 코어 오브와 회전 링, 어두운 배경과 안개,
// 화면 플래시, 비네트까지 — 전부 Canvas-2D로 그린다.
//
// 상태 갱신(update)과 그리기(draw)를 나눠 두었고, 페이즈 판단은 호출부가 한다.
// 광역기는 release/decay 동안에도 입자를 이어서 보여주므로 가시성을 값으로 받는다.

export interface ChargeDrawOptions {
    /** 어두운 배경 세기 (0 = 게임 화면 그대로) */
    readonly bgAlpha: number;
    /** 보라 안개 세기 */
    readonly fogT: number;
    /** 입자 / 위습 가시성 */
    readonly particleVis: number;
    readonly coreAlpha: number;
    readonly coreRadius: number;
    /** 코어 흔들림 + 링 회전 속도에 쓰이는 세기 */
    readonly intensity: number;
    /** 링 회전 배속 (hold 구간에서 2.5 정도로 올린다) */
    readonly ringSpin: number;
    readonly flashAlpha: number;
    /** 프레임 보정값 (16.67ms = 1) */
    readonly dt: number;
}

interface Particle {
    x: number; y: number;
    angle: number; dist: number;
    speed: number; size: number;
    alpha: number; life: number; maxLife: number;
    hue: number; spiral: number;
    tail: { x: number; y: number }[];
}

interface Wisp {
    angle: number; dist: number; speed: number;
    size: number; alpha: number; hue: number; phase: number;
    x: number; y: number;
}

const PARTICLE_COUNT = 160;
const WISP_COUNT = 10;

export class NetherBladeChargeVisual {
    private readonly cx: number;
    private readonly cy: number;
    private readonly particles: Particle[];
    private readonly wisps: Wisp[];
    private ringAngle = 0;
    private wispI = 0;

    constructor(
        private readonly vw: number,
        private readonly vh: number,
        centerX?: number,
        centerY?: number,
    ) {
        this.cx = centerX ?? vw / 2;
        this.cy = centerY ?? vh / 2;
        this.particles = Array.from({ length: PARTICLE_COUNT }, () => this.newParticle(true));
        this.wisps = Array.from({ length: WISP_COUNT }, () => this.newWisp());
    }

    // 입자는 중심으로 나선을 그리며 빨려들고, 도착하면 바깥에서 다시 태어난다.
    public update(dt: number, intensity: number): void {
        const partI = intensity * 0.4 + 0.6;
        for (const p of this.particles) {
            p.life += dt;
            if (p.life < 10) p.alpha += 0.08 * dt;
            if (p.life > p.maxLife - 10) p.alpha -= 0.10 * dt;
            if (p.alpha < 0) p.alpha = 0;
            p.angle += p.spiral * partI * dt;
            const pull = Math.max(0.05, 1 - p.dist / 400);
            p.dist -= p.speed * partI * (1.2 + pull * 4.0) * dt;
            p.x = this.cx + Math.cos(p.angle) * p.dist;
            p.y = this.cy + Math.sin(p.angle) * p.dist;
            p.tail.unshift({ x: p.x, y: p.y });
            if (p.tail.length > 12) p.tail.pop();
            if (p.dist < 8 || p.life > p.maxLife) this.resetParticle(p, false);
        }

        this.wispI = Math.min(intensity * 0.3, 1);
        for (const w of this.wisps) {
            w.angle += w.speed * dt;
            w.phase += 0.04 * dt;
            w.dist -= 0.3 * this.wispI * dt;
            if (w.dist < 20) this.resetWisp(w);
            w.x = this.cx + Math.cos(w.angle) * w.dist + Math.cos(w.phase * 2.1) * 12;
            w.y = this.cy + Math.sin(w.angle) * w.dist + Math.sin(w.phase * 1.7) * 12;
        }
    }

    // 화면 스케일 변환은 호출부가 감싸 준다 — 여기서는 칠하기만 한다.
    public draw(ctx: CanvasRenderingContext2D, opts: ChargeDrawOptions): void {
        const { vw, vh, cx: CX, cy: CY } = this;

        if (opts.bgAlpha > 0) {
            ctx.fillStyle = `rgba(5, 3, 8, ${opts.bgAlpha})`;
            ctx.fillRect(0, 0, vw, vh);
        }

        if (opts.fogT > 0) {
            const fog = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(vw, vh) * 0.50);
            fog.addColorStop(0, `rgba(60, 10, 120, ${0.35 * opts.fogT})`);
            fog.addColorStop(0.6, `rgba(30, 5, 80, ${0.18 * opts.fogT})`);
            fog.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, vw, vh);
        }

        if (opts.particleVis > 0) {
            for (const p of this.particles) {
                if (p.alpha <= 0) continue;
                const pa = p.alpha * opts.particleVis;
                for (let i = 0; i < p.tail.length; i++) {
                    const tt = p.tail[i];
                    const a = (1 - i / p.tail.length) * pa * 0.5;
                    ctx.beginPath();
                    ctx.arc(tt.x, tt.y, p.size * (1 - i / p.tail.length), 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${a})`;
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${pa})`;
                ctx.fill();
            }
            for (const w of this.wisps) {
                ctx.beginPath();
                ctx.arc(w.x, w.y, w.size * this.wispI, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${w.hue}, 80%, 70%, ${w.alpha * this.wispI * opts.particleVis})`;
                ctx.fill();
            }
        }

        if (opts.coreAlpha > 0) {
            const { coreAlpha, coreRadius, intensity } = opts;
            const jitter = (Math.random() - 0.5) * intensity * 2;
            ctx.save();
            ctx.translate(jitter, jitter);

            for (let i = 4; i >= 1; i--) {
                const gr = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius * (i * 1.8));
                gr.addColorStop(0, `rgba(200, 160, 255, ${coreAlpha * 0.15 / i})`);
                gr.addColorStop(0.5, `rgba(130, 70, 230, ${coreAlpha * 0.08 / i})`);
                gr.addColorStop(1, 'rgba( 80,  20, 180, 0)');
                ctx.beginPath();
                ctx.arc(CX, CY, coreRadius * (i * 1.8), 0, Math.PI * 2);
                ctx.fillStyle = gr;
                ctx.fill();
            }

            const flicker = 0.85 + Math.random() * 0.3;
            const gr = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius);
            gr.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha * flicker})`);
            gr.addColorStop(0.2, `rgba(230, 210, 255, ${coreAlpha * 0.95})`);
            gr.addColorStop(0.5, `rgba(160, 90, 255, ${coreAlpha * 0.7})`);
            gr.addColorStop(0.8, `rgba( 80, 30, 200, ${coreAlpha * 0.4})`);
            gr.addColorStop(1, 'rgba( 40,   0, 120, 0)');
            ctx.beginPath();
            ctx.arc(CX, CY, coreRadius, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();

            this.ringAngle += 0.06 * intensity * opts.ringSpin * opts.dt;
            ctx.save();
            ctx.translate(CX, CY);
            ctx.rotate(this.ringAngle);
            for (let i = 0; i < 3; i++) {
                ctx.rotate((Math.PI * 2) / 3);
                ctx.beginPath();
                ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 0.6);
                ctx.strokeStyle = `rgba(180, 120, 255, ${coreAlpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();

            ctx.restore();
        }

        if (opts.flashAlpha > 0) {
            const fc = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(vw, vh));
            fc.addColorStop(0, `rgba(255, 250, 255, ${opts.flashAlpha * 0.95})`);
            fc.addColorStop(0.3, `rgba(220, 180, 255, ${opts.flashAlpha * 0.6})`);
            fc.addColorStop(1, 'rgba(100,  60, 200, 0)');
            ctx.fillStyle = fc;
            ctx.fillRect(0, 0, vw, vh);
        }

        if (opts.bgAlpha > 0) {
            const vig = ctx.createRadialGradient(CX, CY, vh * 0.25, CX, CY, vh * 0.8);
            vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vig.addColorStop(1, `rgba(0, 0, 8, ${0.75 * opts.bgAlpha / 0.92})`);
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, vw, vh);
        }
    }

    private resetParticle(p: Particle, initial: boolean): void {
        const angle = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * Math.max(this.vw, this.vh) * 0.55;
        p.x = this.cx + Math.cos(angle) * dist;
        p.y = this.cy + Math.sin(angle) * dist;
        p.angle = angle;
        p.dist = dist;
        p.speed = 1.5 + Math.random() * 2.5;
        p.size = 1.5 + Math.random() * 3;
        p.alpha = initial ? Math.random() : 0;
        p.life = 0;
        p.maxLife = 60 + Math.random() * 60;
        p.hue = 260 + Math.random() * 40;
        p.spiral = 0.03 + Math.random() * 0.04;
        p.tail = [];
    }

    private newParticle(initial: boolean): Particle {
        const p: Particle = {
            x: 0, y: 0, angle: 0, dist: 0, speed: 0, size: 0,
            alpha: 0, life: 0, maxLife: 0, hue: 0, spiral: 0, tail: [],
        };
        this.resetParticle(p, initial);
        return p;
    }

    private resetWisp(w: Wisp): void {
        w.angle = Math.random() * Math.PI * 2;
        w.dist = 60 + Math.random() * 100;
        w.speed = 0.012 + Math.random() * 0.02;
        w.size = 2 + Math.random() * 4;
        w.alpha = 0.3 + Math.random() * 0.5;
        w.hue = 255 + Math.random() * 50;
        w.phase = Math.random() * Math.PI * 2;
        w.x = 0; w.y = 0;
    }

    private newWisp(): Wisp {
        const w: Wisp = { angle: 0, dist: 0, speed: 0, size: 0, alpha: 0, hue: 0, phase: 0, x: 0, y: 0 };
        this.resetWisp(w);
        return w;
    }
}
