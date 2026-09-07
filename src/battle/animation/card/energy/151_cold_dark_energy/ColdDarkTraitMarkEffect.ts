import * as THREE from 'three';

// 차갑게 불타는 암흑 에너지를 보유한 유닛 카드에 붙는 두 개의 상태 마크.
// 캔버스 정지 이미지가 아니라 셰이더 평면이라 매 프레임 살아 움직인다.
//   · 암흑 화염 — 아마테라스풍 칠흑 불꽃이 일정한 속도로 계속 타오른다.
//   · 빙결      — 육각 눈 결정이 반짝이고, 표면을 빛줄기가 스쳐 지난다.
// 두 마크 모두 원반 배지 안에 갇히므로 카드 아트 위에서도 형태가 읽힌다.

export type TraitMarkKind = 'flame' | 'freeze';

interface Mark {
    readonly mesh: THREE.Mesh;
    readonly material: THREE.ShaderMaterial;
    readonly parent: THREE.Object3D;
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// 두 마크가 공유하는 노이즈 + 배지 유틸.
const COMMON_GLSL = `
precision highp float;
uniform float u_time;
varying vec2 vUv;

const float PI = 3.14159265;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = rot * p * 2.03;
        a *= 0.5;
    }
    return v;
}

// Ridged multifractal. 부드러운 fbm은 덩어리를 만들지만, 능선을 세우는 이 변형은
// **필라멘트**를 만든다 — 불꽃의 갈라진 혀가 여기서 나온다.
float ridged(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        float n = noise(p);
        v += a * (1.0 - abs(2.0 * n - 1.0));
        p = p * 2.1 + vec2(5.7, 3.3);
        a *= 0.55;
    }
    return v;
}

// 선분까지의 거리 — 눈 결정 가지를 그리는 데 쓴다.
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}
`;

// ── 암흑 화염 ──────────────────────────────────────────────────────────────────
// 실루엣을 손으로 깎으려던 시도(폭 함수 / 스윕)는 전부 도형처럼 보였다. 불꽃은
// **ridged 노이즈로 세운 필라멘트를 하드 임계값으로 자르는** 방식이라야 나온다.
//   ridged  — 능선이 날카로워 갈라진 혀가 생긴다 (fbm은 덩어리만 만든다)
//   2단 중첩 — r1의 결과를 r2의 좌표에 먹여 혀가 서로 감긴다
//   env/side — 위로 갈수록, 옆으로 갈수록 사그라드는 포락선
//   임계값   — smoothstep(0.38, 0.68)로 잘라야 혀가 분리되어 보인다
// 색은 아마테라스 — 겉이 주황/진홍으로 타고 속은 칠흑.
const FLAME_FRAGMENT = COMMON_GLSL + `
void main() {
    vec2 p = (vUv - 0.5) * 2.0;      // -1..1
    float r = length(p);
    if (r > 1.0) discard;

    // 속도는 일정하게. 주기적으로 확 빨라지면 타는 게 아니라 튀는 것으로 보인다.
    float T = u_time;

    // 배지 좌표 → 불꽃 좌표. fy = 0 이 불꽃 밑동, 1 부근이 끝.
    float fx = p.x * 1.15;
    float fy = (p.y + 0.90) / 1.72;
    if (fy < -0.05) { fy = -0.05; }

    // 높이별 가로 흔들림 — 불기둥 전체가 좌우로 일렁인다.
    float xw = fx
        + 0.25 * (fbm(vec2(fy * 1.5, T * 0.5)) - 0.5)
        + 0.04 * sin(T * 0.8 + fy * 3.0);

    // ★ ridged 2단. r1을 r2의 좌표에 먹여 혀끼리 감기게 한다.
    // 배지가 작아 레퍼런스보다 주파수를 낮춰(5→4, 9→7) 결을 굵게 잡았다.
    float r1 = ridged(vec2(xw * 4.0, fy * 1.3 - T * 1.7));
    float r2 = ridged(vec2(xw * 7.0 + r1 * 2.0, fy * 2.2 - T * 2.6));
    float ribs = r1 * 0.65 + r2 * 0.45;

    // 포락선 — 위로 갈수록 사그라들고, 폭도 위로 갈수록 좁아진다.
    float env = pow(max(0.0, 1.0 - fy), 1.2);
    float width = 0.66 * (1.0 - fy * 0.55) + 0.05;
    float side = 1.0 - smoothstep(width * 0.5, width, abs(xw));

    float raw = ribs * env * side;

    // 하드 임계값 — 여기서 필라멘트가 개별 혀로 분리된다.
    float body = smoothstep(0.38, 0.68, raw);
    // 임계값 주변의 얇은 띠 = 타오르는 가장자리.
    float edge = smoothstep(0.26, 0.42, raw) * (1.0 - smoothstep(0.50, 0.72, raw));
    // 그 바깥 넓은 띠 = 식어가는 암적층.
    float halo = smoothstep(0.18, 0.34, raw) * (1.0 - smoothstep(0.42, 0.66, raw));

    // 밑동의 은은한 열기 + 중심 코어.
    float haze = smoothstep(0.35, 0.05, fy) * (1.0 - smoothstep(0.2, 0.5, abs(xw) / 0.55)) * 0.55;
    float core = smoothstep(0.30, 0.12, fy) * (1.0 - smoothstep(0.05, 0.18, abs(xw)));

    // 원반 밖으로 새지 않게 자른다.
    float discMask = 1.0 - smoothstep(0.70, 0.96, r);
    body *= discMask;
    edge *= discMask;
    halo *= discMask;
    haze *= discMask;
    core *= discMask;

    vec3 pitch   = vec3(0.012, 0.006, 0.014);   // 심부 — 거의 순흑
    vec3 darkRed = vec3(0.32, 0.022, 0.026);
    vec3 crimson = vec3(0.88, 0.08, 0.03);
    vec3 ember   = vec3(1.00, 0.48, 0.10);

    // 배지 바탕은 회색빛 숯색 — 검은 불꽃을 검은 바탕에 그리면 윤곽선만 남는다.
    vec3 col = mix(vec3(0.20, 0.17, 0.20), vec3(0.11, 0.09, 0.12), smoothstep(0.0, 0.9, r));
    float alpha = smoothstep(1.0, 0.94, r) * 0.92;

    // 아래에서 위로: 암적 무리 → 칠흑 본체 → 타는 가장자리 → 주황 심지.
    col = mix(col, darkRed, halo * 0.75);
    col = mix(col, pitch, body);
    // ribs를 속에 그대로 남겨 칠흑이 통짜로 보이지 않게 한다.
    col = mix(col, darkRed, body * smoothstep(0.55, 0.95, ribs) * 0.45);
    col = mix(col, crimson, edge * 0.95);
    col = mix(col, ember, pow(edge, 2.6) * 0.85);

    // 밑동 열기 — 불덩이가 앉아 있는 느낌.
    col += darkRed * haze * 0.9;
    col += ember * core * 0.34;

    // 불티 — 불꽃 위쪽에서 떨어져 나와 천천히 떠오른다.
    float emberNoise = noise(vec2(p.x * 6.5, p.y * 4.5 - T * 2.3));
    float emberDot = smoothstep(0.90, 1.0, emberNoise)
                   * smoothstep(0.30, 0.80, fy) * (1.0 - smoothstep(0.9, 1.2, fy)) * discMask;
    col += ember * emberDot * 0.60;

    // 배지 테두리 링 — 은은하게 달군 상태로 유지.
    float ring = smoothstep(0.80, 0.87, r) * (1.0 - smoothstep(0.94, 1.0, r));
    col = mix(col, crimson, ring * 0.80);

    gl_FragColor = vec4(col, alpha);
}
`;

// ── 빙결 ──────────────────────────────────────────────────────────────────────
// 6방향 눈 결정을 극좌표 폴딩으로 그리고, 회전하는 빛줄기 + 명멸하는 반짝임을 얹는다.
const FREEZE_FRAGMENT = COMMON_GLSL + `
void main() {
    vec2 p = (vUv - 0.5) * 2.0;      // -1..1
    float r = length(p);
    if (r > 1.0) discard;

    // 60° 단위로 접어 한 가지만 그리면 6방향이 자동으로 완성된다.
    float a = atan(p.y, p.x);
    a = mod(a, PI / 3.0);
    a = abs(a - PI / 6.0);
    vec2 q = vec2(cos(a), sin(a)) * r;

    // 중심에서 뻗는 주 가지 + 양옆 잔가지 2쌍.
    float d = sdSegment(q, vec2(0.0), vec2(0.66, 0.0));
    d = min(d, sdSegment(q, vec2(0.30, 0.0), vec2(0.44, 0.145)));
    d = min(d, sdSegment(q, vec2(0.30, 0.0), vec2(0.44, -0.145)));
    d = min(d, sdSegment(q, vec2(0.48, 0.0), vec2(0.60, 0.115)));
    d = min(d, sdSegment(q, vec2(0.48, 0.0), vec2(0.60, -0.115)));

    float flake = 1.0 - smoothstep(0.030, 0.072, d);
    float glow  = 1.0 - smoothstep(0.05, 0.30, d);   // 결정 주변 냉기 발광

    // 표면을 스쳐 지나는 빛줄기 — 각도를 따라 도는 하이라이트.
    float sweepAngle = atan(p.y, p.x) - u_time * 1.15;
    float sweep = pow(max(0.0, cos(sweepAngle)), 14.0);

    // 반짝임 — 결정 위 임의 지점이 시간에 따라 명멸한다.
    float twNoise = noise(p * 9.0 + floor(u_time * 5.0) * 21.7);
    float twinkle = smoothstep(0.80, 1.0, twNoise) * flake;
    // 전체 호흡 — 결정이 느리게 밝아졌다 어두워진다.
    float breathe = 0.78 + 0.22 * sin(u_time * 2.0);

    vec3 iceDeep  = vec3(0.20, 0.46, 0.72);
    vec3 iceLight = vec3(0.80, 0.95, 1.00);

    vec3 col = vec3(0.030, 0.048, 0.075);            // 배지 바탕 (짙은 남색)
    float alpha = smoothstep(1.0, 0.94, r) * 0.90;

    col = mix(col, iceDeep, glow * 0.55);
    col = mix(col, iceLight, flake * breathe);
    col += iceLight * flake * sweep * 0.85;          // 빛줄기가 지날 때 번쩍
    col += vec3(1.0) * twinkle * 0.95;               // 점 반짝임

    // 배지 테두리 링 — 빛줄기와 같은 위상으로 함께 빛난다.
    float ring = smoothstep(0.80, 0.87, r) * (1.0 - smoothstep(0.94, 1.0, r));
    col = mix(col, iceLight, ring * (0.60 + sweep * 0.40));

    gl_FragColor = vec4(col, alpha);
}
`;

export class ColdDarkTraitMarkEffect {
    // 하나의 보유 유닛에 마크 2개가 붙으므로 배열로 보관한다.
    private readonly marks = new Map<number, Mark[]>();

    public isAttached(entityId: number): boolean {
        return this.marks.has(entityId);
    }

    // 카드 그룹에 [암흑 화염][빙결] 두 배지를 세로로 쌓는다. 좌표/크기는 호출부가
    // 카드 기준 단위로 넘긴다 — 그룹 스케일이 바뀌어도 함께 따라간다.
    public attach(
        entityId: number,
        group: THREE.Object3D,
        layout: { x: number; y: number; size: number; gap: number },
    ): void {
        if (this.marks.has(entityId)) return;

        const created: Mark[] = [];
        const kinds: ReadonlyArray<readonly [TraitMarkKind, number]> = [
            ['flame', 0],
            ['freeze', 1],
        ];
        for (const [kind, step] of kinds) {
            const material = new THREE.ShaderMaterial({
                uniforms: { u_time: { value: 0 } },
                vertexShader: VERTEX_SHADER,
                fragmentShader: kind === 'flame' ? FLAME_FRAGMENT : FREEZE_FRAGMENT,
                transparent: true,
                depthWrite: false,
            });
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(layout.size, layout.size),
                material,
            );
            mesh.position.set(layout.x, layout.y - step * layout.gap, 0.01);
            mesh.renderOrder = 3;
            group.add(mesh);
            created.push({ mesh, material, parent: group });
        }
        this.marks.set(entityId, created);
    }

    // 매 프레임 호출. elapsed는 AnimationLoop의 누적 시간(초).
    public updateAnimation(elapsed: number): void {
        for (const marks of this.marks.values()) {
            for (const mark of marks) {
                mark.material.uniforms.u_time.value = elapsed;
            }
        }
    }

    public detach(entityId: number): void {
        const marks = this.marks.get(entityId);
        if (!marks) return;
        for (const mark of marks) {
            mark.parent.remove(mark.mesh);
            mark.mesh.geometry.dispose();
            mark.material.dispose();
        }
        this.marks.delete(entityId);
    }

    public detachAll(): void {
        for (const entityId of [...this.marks.keys()]) this.detach(entityId);
    }
}
