import * as THREE from "three";

// Energy Burn — "mana in the air, consumed by dark flame".
//   1) Energy motes (cyan/blue mana wisps) fade in around the card at preset positions.
//   2) Dark violet flames (FBM procedural, ember hotspots) rise from below the card.
//   3) Flames SWALLOW the motes one at a time — each mote flares bright, then bursts into
//      orange sparks as it's consumed. Only `drainedCount` motes are shown (0, 1, or 2).
//   4) Flames linger a moment, then fade.
//
// All effect meshes are scene-local and disposed on completion.
export class EnergyBurnEffect {
    constructor(private readonly scene: THREE.Scene) {}

    public async play(
        targetGroup: THREE.Group,
        drainedCount: number,
        killing: boolean = false,
    ): Promise<void> {
        const targetPos = targetGroup.position.clone();
        const ud = targetGroup.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cw = (ud.baseCardWidth ?? 100) * (targetGroup.scale.x || 1);
        const ch = (ud.baseCardHeight ?? 160) * (targetGroup.scale.y || 1);

        // Phase 0 — dark-fire lightning bolt slams down onto the card, triggering the burn.
        // Awaits so the fire and motes materialise in the wake of the strike.
        await this.playLightningStrike(targetPos, cw, ch);

        // ── Card-surface flames — attached to the card group so they move/scale with it.
        // Sized in the card's LOCAL coords (pre-scale) so the group's own scale handles sizing.
        const baseCw = ud.baseCardWidth ?? 100;
        const baseCh = ud.baseCardHeight ?? 160;
        const surfaceFlame = this.createCardSurfaceFlameMesh(baseCw, baseCh);
        // Plane is 1.9× card width × 2.4× card height — flames spread wider (dome) and tall
        // above the card. Plane centered at +0.60·Ch so the card sits in the lower ~42% and
        // the upper airspace has room for rising tongues. (See CARD_UV_* constants.)
        surfaceFlame.position.set(0, baseCh * 0.60, 0.05);
        surfaceFlame.renderOrder = 50;
        // Tag the overlay so external traversals (flash/shake, burn-away) can skip it —
        // its ShaderMaterial has no `.color`, and it shouldn't dissolve like a card mesh.
        surfaceFlame.userData.__energyBurnSurfaceFlame = true;
        targetGroup.add(surfaceFlame);
        const sfMat = surfaceFlame.material as THREE.ShaderMaterial;

        // Plane is much wider/taller than the card so flame tongues + rising embers have room.
        const planeW = cw * 2.6;
        const planeH = ch * 3.2;
        const burn = this.createBurnMesh(planeW, planeH, drainedCount);
        // Plane centered slightly above the card so flames fully engulf it vertically.
        burn.position.set(targetPos.x, targetPos.y + ch * 0.25, 3);
        burn.renderOrder = 510;
        this.scene.add(burn);

        const mat = burn.material as THREE.ShaderMaterial;

        // Shader clock — drives FBM flame flicker + mote pulse + surface-flame motion.
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            mat.uniforms.u_time.value = t;
            sfMat.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Ignite the surface flames immediately — they're visible throughout the effect.
        void this.tweenUniform(sfMat.uniforms.u_alpha, 1.0, 180, 'easeOutQuad');

        // Phase 1 — motes fade in fast, flames ignite hot (~220ms). Violent ignition, not a
        // slow build: we want the fire to GRAB the mana immediately.
        await Promise.all([
            this.tweenUniform(mat.uniforms.u_moteAlpha, 1.0, 180, 'easeOutQuad'),
            this.tweenUniform(mat.uniforms.u_flameIntensity, 0.9, 220, 'easeOutQuad'),
        ]);

        // Phase 2 — flames surge to full + motes get burned in sequence (~950ms).
        // u_burnPhase ramps 0→1; shader treats each mote's consume window as a slice of that
        // range so motes ignite, explode, and vanish one at a time.
        await Promise.all([
            this.tweenUniform(mat.uniforms.u_flameIntensity, 1.15, 200, 'easeOutQuad'),
            this.tweenUniform(mat.uniforms.u_burnPhase, 1.0, 950, 'easeInOutQuad'),
        ]);

        // Phase 3 — hold at peak. On KILLING hits the card dissolves DURING the hold so the
        // flame is visibly consuming it; on non-killing hits, just a short roar and fade.
        if (killing) {
            // Short roar before the card starts to burn, then dissolve the card while the
            // flame stays full intensity. Surface-flame's u_burnProgress is tweened alongside
            // the card-mesh dissolve so the surface flames ALSO vanish from consumed regions.
            await this.delay(120);
            await Promise.all([
                this.playCardBurnAway(targetGroup),
                this.tweenUniform(sfMat.uniforms.u_burnProgress, 1.0, 820, 'easeOutQuad'),
            ]);
            await this.delay(100);
        } else {
            await this.delay(180);
        }

        await Promise.all([
            this.tweenUniform(mat.uniforms.u_flameIntensity, 0.0, 520, 'easeInQuad'),
            this.tweenUniform(mat.uniforms.u_moteAlpha, 0.0, 260, 'easeInQuad'),
            // Surface flames fade in sync with the background fire. On killing hits the card
            // is already invisible by this point (burn-away set cardGroup.visible=false), so
            // the fade is just for safety + memory cleanup.
            this.tweenUniform(sfMat.uniforms.u_alpha, 0.0, 420, 'easeInQuad'),
        ]);

        clockRunning = false;
        this.scene.remove(burn);
        this.disposeMesh(burn);
        targetGroup.remove(surfaceFlame);
        this.disposeMesh(surfaceFlame);
    }

    private createBurnMesh(planeW: number, planeH: number, drainedCount: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time: { value: 0 },
                u_flameIntensity: { value: 0 },   // 0-1, overall flame presence
                u_burnPhase: { value: 0 },        // 0-1, progress of mote consumption
                u_moteAlpha: { value: 0 },        // 0-1, visibility envelope for motes
                u_moteCount: { value: Math.max(0, Math.min(2, drainedCount | 0)) },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float u_time;
                uniform float u_flameIntensity;
                uniform float u_burnPhase;
                uniform float u_moteAlpha;
                uniform int   u_moteCount;

                varying vec2 v_uv;

                // ── Hash + FBM noise ──────────────────────────────────────────────────────
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
                }
                float vnoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0;
                    float amp = 0.5;
                    for (int i = 0; i < 6; i++) {
                        v += amp * vnoise(p);
                        p *= 2.03;
                        amp *= 0.5;
                    }
                    return v;
                }

                // ── Mote position lookup (0, 1, or 2 motes) ─────────────────────────────
                vec2 motePos(int idx) {
                    if (idx == 0) return vec2(0.32, 0.60);
                    return vec2(0.68, 0.64);
                }
                // Per-mote consume window inside u_burnPhase.
                //   mote 0: phase 0.10-0.55  (catches fire mid, explodes late)
                //   mote 1: phase 0.42-0.92
                vec2 moteWindow(int idx) {
                    if (idx == 0) return vec2(0.10, 0.55);
                    return vec2(0.42, 0.92);
                }

                // ── Temperature-to-colour ramp ─────────────────────────────────────────
                // t=0 → cold shadow; t=1 → super-hot white-yellow ember core.
                // Sickly bile-green poisons the mid-temp band for an unclean necrotic feel.
                vec3 flameColour(float t) {
                    vec3 shadow  = vec3(0.03, 0.00, 0.06);  // near-black purple
                    vec3 violet  = vec3(0.28, 0.02, 0.46);  // dark violet body
                    vec3 bile    = vec3(0.18, 0.38, 0.08);  // sickly necrotic green
                    vec3 magenta = vec3(0.92, 0.10, 0.36);  // hot magenta
                    vec3 ember   = vec3(1.00, 0.55, 0.14);  // orange-yellow hot core
                    vec3 sear    = vec3(1.00, 0.92, 0.68);  // white-hot innermost

                    vec3 c = mix(shadow, violet, smoothstep(0.00, 0.28, t));
                    // Bile tint leaks through the mid band (0.25-0.50) — the fire is diseased.
                    c = mix(c, bile,    smoothstep(0.28, 0.48, t) * (1.0 - smoothstep(0.48, 0.58, t)) * 0.55);
                    c = mix(c, magenta, smoothstep(0.40, 0.65, t));
                    c = mix(c, ember,   smoothstep(0.68, 0.88, t));
                    c = mix(c, sear,    smoothstep(0.92, 1.00, t));
                    return c;
                }

                // ── Mana-stream strands — cyan filaments siphoned FROM mote TO flame core ─
                float manaStream(vec2 uv, int idx) {
                    vec2 mp = motePos(idx);
                    vec2 mouth = vec2(0.5, 0.18);

                    vec2 dir = mouth - mp;
                    float len = length(dir);
                    vec2 tangent = dir / max(len, 0.0001);
                    vec2 normal = vec2(-tangent.y, tangent.x);

                    vec2 rel = uv - mp;
                    float s = clamp(dot(rel, tangent) / max(len, 0.0001), 0.0, 1.0);
                    float perp = dot(rel, normal);

                    // Wiggle — noise-driven offset so the strand looks live, not straight.
                    float wiggle = (fbm(vec2(s * 6.0, u_time * 1.7 + float(idx) * 2.3)) - 0.5) * 0.07;
                    float d = abs(perp - wiggle);

                    float thickness = mix(0.012, 0.004, s);

                    vec2 win = moteWindow(idx);
                    float t = clamp((u_burnPhase - win.x) / max(0.0001, win.y - win.x), 0.0, 1.0);
                    // Strand active early-to-mid mote life; dies before the explosion.
                    float active = smoothstep(0.05, 0.25, t) * (1.0 - smoothstep(0.60, 0.80, t));

                    // Pulse flow — travelling bright "snake" of energy heading to the mouth.
                    float flow = 0.5 + 0.5 * sin(s * 16.0 - u_time * 9.0 - float(idx) * 2.0);

                    float core = smoothstep(thickness, 0.0, d);
                    float halo = smoothstep(thickness * 3.0, thickness * 0.8, d) * 0.45;

                    return (core + halo) * (0.55 + 0.45 * flow) * active * u_moteAlpha;
                }

                // ── Domain-warped flame — tongue-like, hot core, dark smoke edges ─────
                // Returns (temperature 0-1, density 0-1). Density drives alpha, temperature
                // drives colour.
                vec2 renderFlame(vec2 uv) {
                    float t = u_time;

                    // Domain warp — curls the sampling grid so flame edges look like licking tongues.
                    vec2 warp = vec2(
                        fbm(vec2(uv.x * 2.4, uv.y * 2.0 - t * 1.6)),
                        fbm(vec2(uv.x * 2.4 + 11.3, uv.y * 2.0 - t * 1.9 + 5.2))
                    );
                    vec2 q = vec2(uv.x, uv.y) + (warp - 0.5) * 0.35;

                    // Upward-flowing noise, multi-octave. Y stretched so flames look tall not square.
                    float rise = t * 1.9;
                    float n = fbm(vec2(q.x * 3.4, q.y * 2.1 - rise));
                    // Second layer at different speed + frequency for turbulence.
                    float n2 = fbm(vec2(q.x * 6.0 + 3.1, q.y * 4.2 - rise * 1.3));
                    float noiseField = n * 0.7 + n2 * 0.3;

                    // Vertical envelope — strong at bottom, narrows and weakens toward top.
                    float vert = pow(max(0.0, 1.0 - uv.y), 1.25);
                    // Width narrows as flame rises (tongue tapering).
                    float widthScale = 0.52 + 0.45 * (1.0 - uv.y);
                    float centerDist = abs(uv.x - 0.5) / widthScale;
                    float horiz = pow(max(0.0, 1.0 - centerDist * 1.6), 1.5);

                    // LOCALIZED bulges near each mote — flame grows thicker where motes are.
                    // Scales up as that mote's burn window peaks.
                    for (int i = 0; i < 2; i++) {
                        if (i >= u_moteCount) break;
                        vec2 mp = motePos(i);
                        vec2 win = moteWindow(i);
                        float burnT = clamp((u_burnPhase - win.x) / max(0.0001, win.y - win.x), 0.0, 1.0);
                        // Bell curve — peaks mid-consume, reaches to the mote's position.
                        float bulge = smoothstep(0.0, 0.5, burnT) * (1.0 - smoothstep(0.7, 1.0, burnT));
                        float d = distance(uv, mp);
                        float near = smoothstep(0.28, 0.04, d);
                        horiz += near * bulge * 1.4;
                        vert  += near * bulge * 0.7;
                    }

                    float envelope = clamp(vert * horiz, 0.0, 2.0);
                    // Flame shape — thresholded noise. Soft edges near tips.
                    float density = smoothstep(0.28, 0.82, noiseField * envelope + 0.12 * envelope);

                    // VILE CRAWL — low-frequency noise biases temperature into the bile-green
                    // range so patches of the flame look necrotic/infested. Does NOT reduce
                    // density (that was making flames invisible) — purely a colour shift.
                    float crawl = fbm(vec2(q.x * 1.7 + 4.1, q.y * 1.4 - t * 0.45));
                    float vile = smoothstep(0.48, 0.72, crawl);

                    // Temperature — hotter near the core (high noise * high envelope).
                    float temperature = clamp(noiseField * envelope * 1.15, 0.0, 1.0);
                    // Vile pockets: push temp into bile band (~0.38) so flameColour pulls green.
                    temperature = mix(temperature, 0.38, vile * 0.45);
                    // Boost temperature further near active burning motes.
                    for (int i = 0; i < 2; i++) {
                        if (i >= u_moteCount) break;
                        vec2 mp = motePos(i);
                        vec2 win = moteWindow(i);
                        float burnT = clamp((u_burnPhase - win.x) / max(0.0001, win.y - win.x), 0.0, 1.0);
                        float bulge = smoothstep(0.0, 0.4, burnT) * (1.0 - smoothstep(0.6, 1.0, burnT));
                        float d = distance(uv, mp);
                        temperature += smoothstep(0.20, 0.0, d) * bulge * 0.7;
                    }
                    temperature = clamp(temperature, 0.0, 1.0);

                    return vec2(temperature, density);
                }

                // ── Rising embers — small bright specks flying upward ─────────────────
                float renderEmbers(vec2 uv) {
                    float sum = 0.0;
                    // 8 ember "columns" with different speeds + offsets. Each one loops.
                    for (int i = 0; i < 8; i++) {
                        float fi = float(i);
                        float colX = hash(vec2(fi, 2.9));
                        float speed = 0.35 + hash(vec2(fi, 7.3)) * 0.55;
                        float phase = hash(vec2(fi, 13.1));
                        float drift = (hash(vec2(fi, 19.2)) - 0.5) * 0.14;

                        float lifeT = fract(u_time * speed + phase);  // 0-1 rising
                        float yPos = 1.0 - lifeT;                      // start bottom, rise up
                        float xPos = colX + drift * sin(u_time * 2.1 + fi);

                        vec2 p = vec2(xPos, yPos);
                        float d = distance(uv, p);
                        float r = 0.0055 + 0.003 * sin(u_time * 9.0 + fi);
                        // Fade in fast, fade out near top.
                        float alpha = smoothstep(0.0, 0.12, lifeT) * (1.0 - smoothstep(0.7, 1.0, lifeT));
                        sum += smoothstep(r, 0.0, d) * alpha;
                    }
                    return clamp(sum, 0.0, 1.0);
                }

                // ── Single mote render (cool cyan → hot → explode in sparks) ──────────
                vec4 renderMote(vec2 uv, int idx) {
                    vec2 p = motePos(idx);
                    float d = distance(uv, p);

                    // Pulse radius while alive.
                    float pulse = 0.5 + 0.5 * sin(u_time * 5.0 + float(idx) * 1.7);
                    float baseR = 0.042 + 0.012 * pulse;

                    vec2 win = moteWindow(idx);
                    float lifeT = clamp((u_burnPhase - win.x) / max(0.0001, win.y - win.x), 0.0, 1.0);

                    // Flare: 0.0-0.5 → swell + heat up.
                    float flare = smoothstep(0.0, 0.5, lifeT) * (1.0 - smoothstep(0.5, 0.85, lifeT));
                    // Explosion shell: 0.55-1.0 — radiating spark blast, ring expanding outward.
                    float boomT = smoothstep(0.55, 1.0, lifeT);
                    // Dying: 0.75-1.0 — core shrinks to nothing.
                    float dying = smoothstep(0.75, 1.0, lifeT);

                    float r = baseR * (1.0 + flare * 0.9) * (1.0 - dying);
                    vec3 col = vec3(0.0);
                    float alpha = 0.0;

                    if (r > 0.0005) {
                        float core = smoothstep(r, r * 0.35, d);
                        float halo = smoothstep(r * 3.2, r * 1.1, d) * 0.6;
                        vec3 cool = vec3(0.42, 0.88, 1.0);
                        vec3 white = vec3(1.0, 0.98, 0.85);
                        vec3 hot = vec3(1.0, 0.55, 0.20);
                        // Cool mana → white-hot when igniting → orange just before exploding.
                        vec3 mcol = mix(cool, white, flare);
                        mcol = mix(mcol, hot, smoothstep(0.6, 0.9, lifeT));
                        col += mcol * (core + halo);
                        alpha += (core + halo) * u_moteAlpha * (1.0 - dying * 0.95);
                    }

                    // Explosion ring — expanding radial burst of orange sparks.
                    if (boomT > 0.0) {
                        float ringR = baseR * (1.5 + boomT * 4.5);
                        float ringThick = baseR * 1.2;
                        float ring = smoothstep(ringR - ringThick, ringR - ringThick * 0.3, d)
                                   * (1.0 - smoothstep(ringR, ringR + ringThick * 0.8, d));
                        // Break the ring into spokes by angle noise.
                        vec2 rel = uv - p;
                        float ang = atan(rel.y, rel.x);
                        float spokes = 0.25 + 0.75 * smoothstep(0.3, 0.8, abs(sin(ang * 7.0 + u_time * 3.0 + float(idx) * 2.0)));
                        float sparkIntensity = ring * spokes * (1.0 - boomT) * 1.2;
                        col += vec3(1.0, 0.55, 0.18) * sparkIntensity;
                        alpha += sparkIntensity * u_moteAlpha;
                    }

                    return vec4(col, clamp(alpha, 0.0, 1.0));
                }

                void main() {
                    // 1) Flame body (temperature, density)
                    vec2 flameTD = renderFlame(v_uv);
                    float temperature = flameTD.x;
                    float density     = flameTD.y;
                    vec3 flameCol = flameColour(temperature);
                    float flameA = density * u_flameIntensity;

                    // 2) Motes + mana-drain strands from mote to flame mouth
                    vec4 motes = vec4(0.0);
                    float streamSum = 0.0;
                    if (u_moteCount >= 1) {
                        vec4 m0 = renderMote(v_uv, 0);
                        motes.rgb = motes.rgb * (1.0 - m0.a) + m0.rgb;
                        motes.a = clamp(motes.a + m0.a * (1.0 - motes.a), 0.0, 1.0);
                        streamSum += manaStream(v_uv, 0);
                    }
                    if (u_moteCount >= 2) {
                        vec4 m1 = renderMote(v_uv, 1);
                        motes.rgb = motes.rgb * (1.0 - m1.a) + m1.rgb;
                        motes.a = clamp(motes.a + m1.a * (1.0 - motes.a), 0.0, 1.0);
                        streamSum += manaStream(v_uv, 1);
                    }

                    // 3) Embers (additive brightness only when flames are active)
                    float ember = renderEmbers(v_uv) * u_flameIntensity;

                    // Composite: motes first, flame on top (consumes motes), streams + embers additive.
                    vec3 col = motes.rgb * (1.0 - flameA) + flameCol * flameA;
                    float a  = motes.a * (1.0 - flameA) + flameA;

                    // Mana strands — cyan at the source, shifting toward magenta as they near
                    // the flame mouth (mana corrupting into shadow-fire as it's consumed).
                    col += mix(vec3(0.45, 0.85, 1.0), vec3(0.85, 0.2, 0.5), 0.5) * streamSum;
                    a = clamp(a + streamSum, 0.0, 1.0);

                    col += vec3(1.0, 0.75, 0.35) * ember;
                    a = clamp(a + ember * 0.8, 0.0, 1.0);

                    gl_FragColor = vec4(col, a);
                }
            `,
        });

        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ── Card-surface flames — a card-sized plane with procedural fire that clings to
    // the card surface for the duration of the effect. Attached to the card group so it
    // moves/scales with the card; the group's scale handles screen-space sizing.
    // Card's UV extent within the surface-flame plane. With plane 1.9× wider and 2.4× taller,
    // the card occupies a smaller sub-rect of the plane; the rest is "air" where flames spill.
    // Derivation: plane centered on (0, +0.60·baseCh). Plane half-sizes (0.95·Cw, 1.2·Ch).
    //   x: card.left = -0.5·Cw → plane_y_bottom-relative (x - (-0.95·Cw)) / 1.9·Cw = 0.45/1.9 = 0.2368
    //   x: card.right = +0.5·Cw → 1.45/1.9 = 0.7632
    //   y: plane bottom at (0.60 - 1.2)·Ch = -0.60·Ch. card bottom = -0.5·Ch → 0.10·Ch above plane bottom → 0.10/2.4 = 0.0417
    //   y: card top = +0.5·Ch → 1.10·Ch above plane bottom → 1.10/2.4 = 0.4583
    private static readonly CARD_UV_X0 = 0.237;
    private static readonly CARD_UV_X1 = 0.763;
    private static readonly CARD_UV_Y0 = 0.042;
    private static readonly CARD_UV_Y1 = 0.458;

    private createCardSurfaceFlameMesh(baseCw: number, baseCh: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
                // Mirrors playCardBurnAway's u_progress so the overlay dissolves IN STEP with
                // the card: pixels that have been consumed on the card can't have fire.
                u_burnProgress: { value: 0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                uniform float u_burnProgress;
                varying vec2 v_uv;

                // Card's UV box within the plane — flames are strongest here; outside is "air".
                const vec2 CARD_UV_MIN = vec2(${EnergyBurnEffect.CARD_UV_X0}, ${EnergyBurnEffect.CARD_UV_Y0});
                const vec2 CARD_UV_MAX = vec2(${EnergyBurnEffect.CARD_UV_X1}, ${EnergyBurnEffect.CARD_UV_Y1});

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float amp = 0.5;
                    for (int i = 0; i < 5; i++) { v += amp * vnoise(p); p *= 2.03; amp *= 0.5; }
                    return v;
                }

                void main() {
                    // Map plane UV → card UV. Outside the card box, cardUV lies outside [0, 1]².
                    vec2 cardUV = (v_uv - CARD_UV_MIN) / (CARD_UV_MAX - CARD_UV_MIN);
                    bool insideCard = cardUV.x >= 0.0 && cardUV.x <= 1.0 && cardUV.y >= 0.0 && cardUV.y <= 1.0;

                    // Sync with card burn-away: drop flames where the card underneath is gone.
                    // Identical mask formula to playCardBurnAway — edges of the card burn first.
                    if (insideCard) {
                        vec2 c = cardUV - 0.5;
                        float edgeBias = max(abs(c.x), abs(c.y)) * 2.0;
                        float bn = fbm(cardUV * 4.5);
                        float bn2 = fbm(cardUV * 9.2 + vec2(3.1, 0.0));
                        float burnMask = clamp(bn * 0.5 + bn2 * 0.2 + edgeBias * 0.60, 0.0, 1.3);
                        float threshold = 1.45 - u_burnProgress * 1.50;
                        if (burnMask > threshold) discard;
                    }

                    // Domain-warped flame noise. Strong warp so tongues twist and curl.
                    vec2 warp = vec2(
                        fbm(vec2(v_uv.x * 3.2, v_uv.y * 2.0 - u_time * 2.1)),
                        fbm(vec2(v_uv.x * 3.2 + 5.1, v_uv.y * 2.0 - u_time * 2.5 + 2.0))
                    );
                    vec2 q = v_uv + (warp - 0.5) * 0.45;

                    float n1 = fbm(vec2(q.x * 3.0, q.y * 1.8 - u_time * 2.6));
                    float n2 = fbm(vec2(q.x * 5.8 + 3.0, q.y * 3.6 - u_time * 3.4));
                    float noiseField = n1 * 0.7 + n2 * 0.3;

                    // SOFT envelope — just says "this is roughly where fire can exist".
                    // NO trapezoid, NO linear taper. The flame SHAPE is carved by noise below.
                    // Vertical: full across card band + well above; gentle exponential fade up top.
                    float vert = 1.0 - smoothstep(0.08, 0.95, v_uv.y);
                    vert = pow(vert, 0.75);  // slightly stronger near bottom (card body)
                    // Horizontal: gaussian-like bell wider than the card so flames spill sideways.
                    // Sigma chosen so envelope is ~1 across the whole card width (0.24-0.76) and
                    // decays gently toward the plane edges.
                    float cx = (v_uv.x - 0.5);
                    float horiz = exp(-cx * cx * 9.0);
                    float envelope = vert * horiz;

                    // ORGANIC FLAME CARVING — sharp threshold on (noise × envelope) produces
                    // tongue-like, irregular boundaries. This is what kills the trapezoid look:
                    // the edge of the flame is drawn by the noise field, not the envelope.
                    float flameRaw = noiseField * (0.25 + envelope * 1.35);
                    float density = smoothstep(0.48, 0.66, flameRaw);

                    // DARK FIRE palette — violet-to-deep-magenta only.
                    float temp = clamp(noiseField * (0.60 + envelope * 0.80), 0.0, 1.0);
                    vec3 abyss   = vec3(0.02, 0.00, 0.04);
                    vec3 shadow  = vec3(0.10, 0.01, 0.18);
                    vec3 violet  = vec3(0.32, 0.04, 0.50);
                    vec3 hotMage = vec3(0.68, 0.08, 0.45);
                    vec3 col = mix(abyss, shadow, smoothstep(0.00, 0.22, temp));
                    col = mix(col, violet,  smoothstep(0.28, 0.55, temp));
                    col = mix(col, hotMage, smoothstep(0.62, 0.90, temp));

                    // Flicker for liveliness.
                    float flicker = 0.85 + 0.15 * sin(u_time * 14.0 + v_uv.x * 6.0);

                    // BURN FADE — flames need fuel. As the card dissolves, the fire has less
                    // to burn; by the time the card is mostly gone (u_burnProgress ≳ 0.7) the
                    // surrounding "air" flames die out as well. Inside-card pixels already
                    // discard via the mask above, so this mostly affects the spillover area.
                    float burnFade = 1.0 - smoothstep(0.25, 0.90, u_burnProgress);

                    float a = density * u_alpha * flicker * burnFade;
                    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
                }
            `,
        });

        // 1.9× wider, 2.4× taller than the card — wide dome of fire escaping the card sides
        // as well as towering above it.
        const geometry = new THREE.PlaneGeometry(baseCw * 1.9, baseCh * 2.4);
        return new THREE.Mesh(geometry, material);
    }

    // ── Dark-fire lightning strike — jagged bolt slams down onto the card ────────
    // Triple flash (ignite, flicker, final crack) over ~200ms. The bolt is an FBM-displaced
    // vertical line with a white-hot core and magenta/violet halo. After the strike the
    // main flame + mana motes spawn in its afterglow.
    private async playLightningStrike(
        targetPos: THREE.Vector3,
        cw: number,
        ch: number,
    ): Promise<void> {
        // Bolt plane: tall (comes from well above card), narrow-ish (enough for jagged offsets).
        const planeW = cw * 2.2;
        const planeH = ch * 5.5;
        const bolt = this.createLightningMesh(planeW, planeH);
        // Anchor the bolt so its BOTTOM lands at the card's centre and it climbs offscreen.
        bolt.position.set(targetPos.x, targetPos.y + planeH * 0.5 - ch * 0.1, 4);
        bolt.renderOrder = 520;
        this.scene.add(bolt);

        const mat = bolt.material as THREE.ShaderMaterial;
        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            mat.uniforms.u_time.value = (performance.now() - clockStart) / 1000;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Triple flash:
        //   crack   — sudden on, brief hold         (~70ms)
        //   flicker — half-fade + flash again       (~70ms)
        //   final   — full on, then linger briefly  (~80ms)
        await this.tweenUniform(mat.uniforms.u_alpha, 1.0, 25, 'easeOutQuad');
        await this.delay(40);
        await this.tweenUniform(mat.uniforms.u_alpha, 0.15, 30, 'easeInQuad');
        await this.tweenUniform(mat.uniforms.u_alpha, 1.0, 30, 'easeOutQuad');
        await this.delay(50);
        await this.tweenUniform(mat.uniforms.u_alpha, 0.0, 90, 'easeInQuad');

        clockRunning = false;
        this.scene.remove(bolt);
        this.disposeMesh(bolt);
    }

    private createLightningMesh(planeW: number, planeH: number): THREE.Mesh {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
            uniforms: {
                u_time:  { value: 0 },
                u_alpha: { value: 0 },
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float u_time;
                uniform float u_alpha;
                varying vec2 v_uv;

                float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                float vnoise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float amp = 0.5;
                    for (int i = 0; i < 5; i++) { v += amp * vnoise(p); p *= 2.05; amp *= 0.5; }
                    return v;
                }

                void main() {
                    // Centreline + jagged displacement. High-freq noise along y, frozen in time
                    // during each flash (u_time advances slowly so the bolt doesn't crawl).
                    float n1 = fbm(vec2(u_time * 2.5, v_uv.y * 9.0));
                    float n2 = fbm(vec2(u_time * 2.5 + 3.1, v_uv.y * 22.0));
                    float displacement = (n1 - 0.5) * 0.18 + (n2 - 0.5) * 0.06;
                    float boltX = 0.5 + displacement;
                    float dist = abs(v_uv.x - boltX);

                    // Main bolt — thin bright core + violet glow halo.
                    float core = smoothstep(0.009, 0.0, dist);
                    float glow = smoothstep(0.11, 0.0, dist) * 0.45;
                    float outerGlow = smoothstep(0.22, 0.0, dist) * 0.18;

                    // Branches — shorter side bolts in the upper half, fading out at the card.
                    float branchNoise = fbm(vec2(u_time * 3.5, v_uv.y * 14.0 + 7.1));
                    float branchOffset = (branchNoise - 0.5) * 0.35;
                    float branchX = 0.5 + branchOffset;
                    float branchDist = abs(v_uv.x - branchX);
                    // Active only in upper ~60% (above the strike point) and where noise peaks.
                    float branchGate = smoothstep(0.15, 0.45, v_uv.y) * smoothstep(0.55, 0.72, branchNoise);
                    float branch = smoothstep(0.006, 0.0, branchDist) * branchGate;
                    float branchGlow = smoothstep(0.05, 0.0, branchDist) * branchGate * 0.6;

                    // Colours — WHITE-HOT core, magenta halo, deep violet outer, classic dark-fire
                    // lightning look (violet-purple bolt instead of blue).
                    vec3 hot    = vec3(1.00, 0.94, 1.00);
                    vec3 magma  = vec3(0.95, 0.22, 0.75);
                    vec3 violet = vec3(0.40, 0.04, 0.55);

                    float beamMask = core + glow + outerGlow + branch + branchGlow;
                    vec3 col = mix(violet, magma, clamp((glow + branchGlow) * 2.0, 0.0, 1.0));
                    col = mix(col, hot, clamp(core + branch * 0.9, 0.0, 1.0));

                    // Impact burst at the bottom (where bolt hits card): radial bright flare.
                    vec2 impact = vec2(0.5, 0.08);
                    float impactD = distance(v_uv, impact);
                    float impactGlow = smoothstep(0.25, 0.0, impactD) * 0.55;
                    float impactCore = smoothstep(0.08, 0.0, impactD) * 1.0;
                    col += hot * impactCore + magma * impactGlow;
                    beamMask += impactCore + impactGlow;

                    // Subtle flicker on the overall intensity.
                    float flicker = 0.85 + 0.15 * sin(u_time * 70.0);

                    float a = clamp(beamMask * flicker * u_alpha, 0.0, 1.0);
                    gl_FragColor = vec4(col, a);
                }
            `,
        });

        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, material);
    }

    // ── Energy icon burn-away — burns just the attached-energy icon + text meshes.
    // Target meshes are identified by `userData.slotType === 'energy' | 'energyText'` (set
    // by HandCardRendererV2). They get swapped to a noise-dissolve shader with an ember
    // burning line, tweened to full burn over ~500ms, then removed + disposed.
    //
    // Used on NON-KILLING hits only: after the icons burn, the caller should call
    // HandCardRendererV2.updateEnergyCount with the post-drain count to redraw remaining
    // energy (if any). On killing hits, playCardBurnAway already processes the icons.
    public async playEnergyIconBurnAway(cardGroup: THREE.Group): Promise<void> {
        const targets: THREE.Mesh[] = [];
        cardGroup.traverse((obj) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const st = (obj.userData as { slotType?: string }).slotType;
            if (st === 'energy' || st === 'energyText') targets.push(obj);
        });
        if (targets.length === 0) return;

        const burnMats: THREE.ShaderMaterial[] = [];
        for (const mesh of targets) {
            const origMat = mesh.material;
            if (Array.isArray(origMat)) continue;
            const texture = (origMat as THREE.MeshBasicMaterial).map;
            if (!texture) continue;

            const burnMat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                uniforms: {
                    u_texture:  { value: texture },
                    u_progress: { value: 0 },
                },
                vertexShader: `
                    varying vec2 v_uv;
                    void main() {
                        v_uv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    precision highp float;
                    uniform sampler2D u_texture;
                    uniform float u_progress;
                    varying vec2 v_uv;

                    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                    float vnoise(vec2 p) {
                        vec2 i = floor(p); vec2 f = fract(p);
                        vec2 u = f * f * (3.0 - 2.0 * f);
                        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                    }
                    float fbm(vec2 p) {
                        float v = 0.0; float amp = 0.5;
                        for (int i = 0; i < 4; i++) { v += amp * vnoise(p); p *= 2.0; amp *= 0.5; }
                        return v;
                    }

                    void main() {
                        vec4 src = texture2D(u_texture, v_uv);
                        if (src.a < 0.01) discard;

                        // Noise mask only (no edge bias) — small icons look better dissolving
                        // uniformly than having corners burn first. Threshold drops with progress.
                        float mask = fbm(v_uv * 6.0);
                        float threshold = 1.05 - u_progress * 1.20;
                        if (mask > threshold) discard;

                        float edgeBand = 0.13;
                        float edge = smoothstep(threshold - edgeBand, threshold, mask);
                        float approach = smoothstep(threshold - edgeBand * 2.8, threshold, mask);

                        // Scorch the icon violet-black just before the front reaches each pixel.
                        vec3 scorch = mix(vec3(1.0), vec3(0.24, 0.04, 0.35), approach * 0.8);
                        vec3 col = src.rgb * scorch;

                        // Ember burning line — magenta halo + warm core.
                        vec3 edgeHot  = vec3(1.0, 0.70, 0.25);
                        vec3 edgeHalo = vec3(0.95, 0.20, 0.50);
                        vec3 edgeCol = mix(edgeHalo, edgeHot, 0.55);
                        col = mix(col, edgeCol, edge);

                        float a = clamp(src.a + edge * 0.4, 0.0, 1.0);
                        gl_FragColor = vec4(col, a);
                    }
                `,
            });

            mesh.material = burnMat;
            burnMats.push(burnMat);
        }

        if (burnMats.length === 0) return;

        // Animate progress 0→1 (~500ms, easeOutQuad — quick ignite, slow finish).
        await new Promise<void>((resolve) => {
            const start = performance.now();
            const DUR = 500;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / DUR);
                const v = 1 - (1 - t) * (1 - t);
                for (const m of burnMats) m.uniforms.u_progress.value = v;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        // Remove + dispose swapped meshes. Leave the underlying textures alone — they may
        // be held elsewhere (card renderer's own loading cache); Material.dispose() won't
        // touch them.
        for (const mesh of targets) {
            cardGroup.remove(mesh);
            mesh.geometry?.dispose();
            const m = mesh.material;
            if (m instanceof THREE.ShaderMaterial) m.dispose();
        }
    }

    // ── Card burn-away — dissolves the target card's meshes from the edges inward ──
    // For each mesh with a texture map under the card group, we swap its material for a
    // bespoke shader that: samples the original texture, computes a per-pixel burn mask
    // from FBM noise, and renders a bright ember front along the advancing mask edge.
    // The burn advances with `u_progress` (0 → 1). Once done, the card is gone.
    public async playCardBurnAway(cardGroup: THREE.Group): Promise<void> {
        const burnMaterials: THREE.ShaderMaterial[] = [];
        const originalMaterials: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[] }[] = [];

        cardGroup.traverse((obj) => {
            if (!(obj instanceof THREE.Mesh)) return;
            // Skip our own overlays (e.g., the surface flame attached to targetGroup).
            if (obj.userData.__energyBurnSurfaceFlame) return;
            const origMat = obj.material;
            if (Array.isArray(origMat)) return;
            const texture = (origMat as THREE.MeshBasicMaterial).map;
            if (!texture) return;

            originalMaterials.push({ mesh: obj, material: origMat });

            const burnMat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                uniforms: {
                    u_texture:  { value: texture },
                    u_progress: { value: 0 },
                    u_time:     { value: 0 },
                },
                vertexShader: `
                    varying vec2 v_uv;
                    void main() {
                        v_uv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    precision highp float;
                    uniform sampler2D u_texture;
                    uniform float u_progress;
                    uniform float u_time;
                    varying vec2 v_uv;

                    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
                    float vnoise(vec2 p) {
                        vec2 i = floor(p); vec2 f = fract(p);
                        vec2 u = f * f * (3.0 - 2.0 * f);
                        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
                    }
                    float fbm(vec2 p) {
                        float v = 0.0; float amp = 0.5;
                        for (int i = 0; i < 5; i++) { v += amp * vnoise(p); p *= 2.03; amp *= 0.5; }
                        return v;
                    }

                    void main() {
                        vec4 src = texture2D(u_texture, v_uv);
                        if (src.a < 0.001) discard;

                        // Burn mask — DETERMINISTIC (no u_time), so the surface-flame overlay
                        // and the card-dissolve shader discard the exact same UV positions in
                        // lockstep. Edges have higher mask values (edgeBias) and burn first.
                        vec2 c = v_uv - 0.5;
                        float edgeBias = max(abs(c.x), abs(c.y)) * 2.0;
                        float n = fbm(v_uv * 4.5);
                        float n2 = fbm(v_uv * 9.2 + vec2(3.1, 0.0));
                        float mask = clamp(n * 0.5 + n2 * 0.2 + edgeBias * 0.60, 0.0, 1.3);

                        float threshold = 1.45 - u_progress * 1.50;
                        if (mask > threshold) discard;

                        // Burning front + scorch band.
                        float edgeBand = 0.10;
                        float edge = smoothstep(threshold - edgeBand, threshold, mask);
                        float approach = smoothstep(threshold - edgeBand * 3.0, threshold, mask);

                        vec3 scorch = mix(vec3(1.0), vec3(0.22, 0.04, 0.30), approach * 0.85);
                        vec3 col = src.rgb * scorch;

                        // ── SURFACE FLAMES — procedural upward-flowing fire licking the card
                        // in a WIDE band below the burn front. This is what makes the burning
                        // card look alive: the whole "about to burn" zone is covered in flames
                        // rather than only a thin ember line at the edge.
                        float flameZone = smoothstep(threshold - 0.45, threshold - 0.02, mask);
                        vec2 flameQ = vec2(v_uv.x * 4.0, v_uv.y * 3.0 - u_time * 2.4);
                        float fn = fbm(flameQ);
                        float fn2 = fbm(flameQ * 2.1 + vec2(5.0, 0.0));
                        float flameNoise = fn * 0.7 + fn2 * 0.3;
                        float flameMask = smoothstep(0.42, 0.80, flameNoise) * flameZone;

                        vec3 flameViolet = vec3(0.35, 0.04, 0.52);
                        vec3 flameMagenta = vec3(0.95, 0.15, 0.42);
                        vec3 flameOrange  = vec3(1.0, 0.60, 0.18);
                        vec3 flameYellow  = vec3(1.0, 0.88, 0.45);
                        vec3 flameCol = mix(flameViolet, flameMagenta, smoothstep(0.42, 0.60, flameNoise));
                        flameCol = mix(flameCol, flameOrange, smoothstep(0.58, 0.78, flameNoise));
                        flameCol = mix(flameCol, flameYellow, smoothstep(0.80, 0.95, flameNoise));
                        col = mix(col, flameCol, flameMask * 0.88);

                        // Bright ember line right along the burn front (on top of flames).
                        vec3 hotEdge = vec3(1.0, 0.85, 0.35);
                        vec3 haloEdge = vec3(1.0, 0.25, 0.55);
                        vec3 edgeCol = mix(haloEdge, hotEdge, 0.65);
                        col = mix(col, edgeCol, edge);

                        float a = src.a;
                        a = clamp(a + flameMask * 0.25 + edge * 0.45, 0.0, 1.0);

                        gl_FragColor = vec4(col, a);
                    }
                `,
            });

            obj.material = burnMat;
            burnMaterials.push(burnMat);
        });

        if (burnMaterials.length === 0) return;

        const clockStart = performance.now();
        let clockRunning = true;
        const runClock = () => {
            if (!clockRunning) return;
            const t = (performance.now() - clockStart) / 1000;
            for (const m of burnMaterials) m.uniforms.u_time.value = t;
            requestAnimationFrame(runClock);
        };
        requestAnimationFrame(runClock);

        // Drive progress across all swapped materials simultaneously.
        await new Promise<void>((resolve) => {
            const start = performance.now();
            const DUR = 820;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / DUR);
                const v = 1 - (1 - t) * (1 - t); // easeOutQuad — begins fast then holds
                for (const m of burnMaterials) m.uniforms.u_progress.value = v;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });

        clockRunning = false;

        // Hide the card and dispose the swapped materials. Leave original textures alone —
        // they were being reused from the card's existing render, and any lifetime beyond
        // this point is managed by whoever built the card group.
        cardGroup.visible = false;
        for (const entry of originalMaterials) {
            (entry.mesh.material as THREE.ShaderMaterial).dispose?.();
            entry.mesh.material = entry.material;  // restore in case caller reuses the group
        }
    }

    // ── Utilities ─────────────────────────────────────────────────────────────────
    private tweenUniform(
        uniform: { value: number },
        target: number,
        duration: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): Promise<void> {
        return new Promise((resolve) => {
            const start = performance.now();
            const from = uniform.value;
            const step = () => {
                const t = Math.min(1, (performance.now() - start) / duration);
                const v = this.applyEasing(t, easing);
                uniform.value = from + (target - from) * v;
                if (t < 1) requestAnimationFrame(step);
                else resolve();
            };
            requestAnimationFrame(step);
        });
    }

    private applyEasing(
        t: number,
        easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad',
    ): number {
        switch (easing) {
            case 'easeInQuad':    return t * t;
            case 'easeOutQuad':   return 1 - (1 - t) * (1 - t);
            case 'easeInOutQuad': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            default:              return t;
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private disposeMesh(mesh: THREE.Mesh): void {
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
    }
}
