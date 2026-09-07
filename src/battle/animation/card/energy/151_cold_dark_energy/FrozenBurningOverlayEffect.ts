import * as THREE from 'three';

// 차갑게 불타는 암흑 에너지에 맞은 유닛 위에 얹히는 **지속** 오버레이.
// 한 장의 셰이더 평면이 빙결(얼음)과 암흑 화염(아마테라스풍 검은 불꽃)을 동시에 그린다. 두 상태는
// u_freeze / u_flame 세기로 독립 제어되므로, 빙결만 풀리고 화염만 남는 전환이
// 메쉬 교체 없이 그대로 이어진다.
//
// 카드 그룹의 자식으로 붙이므로 리플로우/이동/스케일을 카드와 함께 따라간다.
// 텍스처를 쓰지 않아 CLAUDE.md의 텍스처 설정 규칙과 무관하다.

interface Overlay {
    readonly mesh: THREE.Mesh;
    readonly material: THREE.ShaderMaterial;
    readonly parent: THREE.Object3D;
    freezeTarget: number;
    flameTarget: number;
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform float u_freeze;   // 0..1 — 빙결 세기
uniform float u_flame;    // 0..1 — 암흑 화염 세기
uniform float u_aspect;   // 카드 세로/가로 비율 — 노이즈가 늘어나지 않게 보정
// 오버레이 평면에서 카드가 차지하는 비율. 평면은 바늘이 뻗을 여백만큼 카드보다
// 크므로, 이 값으로 나눠 카드 기준 좌표를 되찾는다.
uniform vec2 u_cardFrac;

// 주변 바닥 결빙이 카드 테두리에서 뻗어 나가는 거리 (카드 반폭 단위).
// 여백(SPIKE_MARGIN)보다 작게 잡아야 평면 끝에서 잘리지 않는다.
const float GROUND_REACH = 0.26;

varying vec2 vUv;

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
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot * p * 2.02;
        a *= 0.5;
    }
    return v;
}

// ── 얼음 표현 헬퍼 ────────────────────────────────────────────────────────────
// 사용자가 제시한 CRYO 셰이더에서 이식. 레이마칭/굴절은 투명 오버레이 쿼드에서는
// 불가능(뒤에 뭐가 있는지 모른다)하므로, 형태를 만드는 기법만 가져와 높이장 +
// 노멀 조명으로 재구성했다.

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// 전진하는 결빙 프론트. 씨앗 세 곳과 카드 가장자리에서 동시에 번지며, 경계를
// 노이즈로 흐트러뜨린다. rim은 프론트 바로 위에서만 터지는 밝은 띠 — 얼어붙는
// 순간이 눈에 보이게 하는 핵심 요소다.
float coverage(vec2 uv, float fz, out float rim) {
    // 씨앗은 카드 안쪽에 넓게 흩는다. CRYO 원본의 '가장자리 전체가 씨앗' 항은
    // 뺐다 — 모서리까지 얼어붙으면 수치 표기를 가리기 때문이다. 대신 씨앗 간격을
    // 벌려 결빙 프론트가 카드 폭 전체를 가로지르게 한다.
    float d = min(min(
        length((uv - vec2(0.26, 0.72)) * vec2(1.0, 0.66)),
        length((uv - vec2(0.76, 0.30)) * vec2(1.0, 0.66))),
        length((uv - vec2(0.50, 0.50)) * vec2(1.0, 0.66)));
    d -= (noise(uv * 4.0 + 3.7) - 0.5) * 0.36;
    d -= (noise(uv * 13.0 + 1.3) - 0.5) * 0.09;
    // 1.55 — fz=1 에서 내접 타원을 끝까지 채울 만큼의 전진 거리.
    float s = fz * 1.55 - d;
    rim = exp(-abs(s) * 20.0) * smoothstep(0.0, 0.04, fz) * (1.0 - smoothstep(0.82, 1.0, fz));
    return clamp(s * 7.0, 0.0, 1.0);
}

// 결정 블레이드 — 격자마다 임의 방향으로 뻗는 바늘. 끝으로 갈수록 가늘어지고,
// max로 합쳐 서로 찌르듯 겹친다. 성에가 '자란' 것처럼 보이는 이유.
float bladeLayer(vec2 p, float seed, float sc, float hw) {
    vec2 g = p * sc;
    vec2 cell = floor(g), fr = fract(g);
    float h = 0.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 nb = vec2(float(i), float(j));
            vec2 id = cell + nb;
            vec2 r = hash22(id + seed);
            float r2 = hash(id + seed * 3.13);
            vec2 base = nb + r * 0.72 + 0.14;
            float ang = r2 * 6.28318;
            float len = 0.34 + r.y * 0.58;
            vec2 ax = vec2(cos(ang), sin(ang));
            vec2 pa = fr - base;
            vec2 ba = ax * len;
            float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
            float dist = length(pa - ba * t);
            float w = hw * (1.0 - 0.86 * t);
            float prof = clamp(1.0 - dist / max(w, 1e-4), 0.0, 1.0);
            h = max(h, prof * prof * (1.0 - 0.30 * t));
        }
    }
    return h;
}

// 깃털 성에(frost fern) — 세로로 눌러 늘인 노이즈의 능선을 거듭제곱해 가느다란
// 잎맥을 만든다. 회전을 섞어 방향이 한쪽으로 쏠리지 않게 한다.
float fernField(vec2 p) {
    float v = 0.0, a = 0.60;
    vec2 q = p;
    for (int i = 0; i < 3; i++) {
        float n = noise(q * vec2(1.0, 4.4));
        float r = 1.0 - abs(n * 2.0 - 1.0);
        v += a * pow(clamp(r, 0.0, 1.0), 5.0);
        q = rot2(0.72) * q * 2.09 + 4.7;
        a *= 0.55;
    }
    return clamp(v * 1.5, 0.0, 1.0);
}

// 균열망 — 보로노이 F2-F1 벽. 이웃 두 셀 id의 평균을 키로 써야 같은 벽이
// 양쪽에서 동일하게 켜지고 꺼진다(비대칭 키를 쓰면 벽이 반쪽만 그려진다).
vec2 crackNet(vec2 p, float sc, float fz) {
    vec2 w = p + vec2(fbm(p * 2.1 + 1.7), fbm(p * 2.1 + 8.3)) * 0.26;
    vec2 g = w * sc;
    vec2 cell = floor(g), fr = fract(g);
    float f1 = 8.0, f2 = 8.0;
    vec2 id1 = cell, id2 = cell;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 nb = vec2(float(i), float(j));
            vec2 id = cell + nb;
            vec2 pt = nb + hash22(id * 1.73);
            float d = length(pt - fr);
            if (d < f1) { f2 = f1; id2 = id1; f1 = d; id1 = id; }
            else if (d < f2) { f2 = d; id2 = id; }
        }
    }
    vec2 key = (id1 + id2) * 0.5 + 13.7;
    float live = smoothstep(0.62 - fz * 0.42, 0.70 - fz * 0.42, hash(key));
    float wid = 0.016 + hash(key + 4.2) * 0.028;
    float wall = (1.0 - smoothstep(0.0, wid, f2 - f1)) * live;
    return vec2(wall, pow(wall, 4.0));
}

// 두께 분포. 중앙이 조금 더 두껍되 타원 끝까지 고르게 얼도록 완만하게 잡는다.
// (CRYO 원본은 가장자리를 두껍게 하지만 여기서는 모서리를 비워야 해서 뒤집었다.)
float centerBias(vec2 uv) {
    float r = length((uv - 0.5) * 2.0);
    return 0.78 + 0.62 * (1.0 - smoothstep(0.15, 1.20, r));
}

// ── 카드 둘레의 얼음 바늘 ─────────────────────────────────────────────────────
// CRYO의 rimSpikes 이식. 변마다 빗살을 세우는 방식은 톱니로 보이지만, **둘레를
// 하나의 좌표(s)로 훑으며** 바늘을 심으면 모서리에서도 자연스럽게 이어진다.
// 각 바늘은 뿌리를 테두리 안쪽에 두고 법선 + 접선 성분으로 기울어 뻗는다.

// 스튜디오 환경 근사 — 바늘의 반사색. 전체 HDRI 대신 하늘/림/바닥 세 항만 쓴다.
vec3 envLite(vec3 d, float rough, vec3 keyDir) {
    float sky = smoothstep(-0.55, 0.85, d.y);
    vec3 c = mix(vec3(0.012, 0.020, 0.042), vec3(0.085, 0.135, 0.245), sky);
    c += vec3(1.0, 0.985, 0.94) * pow(max(dot(d, keyDir), 0.0), mix(1400.0, 6.0, rough)) * mix(9.0, 0.9, rough);
    c += vec3(0.22, 0.55, 1.0) * pow(max(dot(d, normalize(vec3(-0.85, 0.18, -0.42))), 0.0), mix(70.0, 5.0, rough)) * mix(2.4, 0.5, rough);
    c += vec3(0.14, 0.28, 0.52) * pow(max(d.z, 0.0), 3.0) * 0.30;
    return c;
}

float sdBox2(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 둘레 좌표 s ∈ [0,4). 정수부 = 어느 변, 소수부 = 그 변 위 위치.
float perimS(vec2 c, float A) {
    if (abs(c.x) > 1.0 - 1e-4) return (c.x > 0.0 ? 0.0 : 2.0) + (c.y / A * 0.5 + 0.5);
    return (c.y > 0.0 ? 1.0 : 3.0) + (c.x * 0.5 + 0.5);
}
vec2 perimP(float s, float A) {
    float side = floor(mod(s, 4.0));
    float a = fract(s) * 2.0 - 1.0;
    if (side < 0.5) return vec2( 1.0, a * A);
    if (side < 1.5) return vec2( a,   A);
    if (side < 2.5) return vec2(-1.0, a * A);
    return vec2(a, -A);
}
vec2 perimN(float s) {
    float side = floor(mod(s, 4.0));
    if (side < 0.5) return vec2( 1.0, 0.0);
    if (side < 1.5) return vec2( 0.0, 1.0);
    if (side < 2.5) return vec2(-1.0, 0.0);
    return vec2( 0.0, -1.0);
}

// 반환 x = 부드러운 마스크, y = 원시 프로파일. nrm/tip은 셰이딩용.
vec2 rimSpikes(vec2 p, float A, float fz, out vec2 nrm, out float tip) {
    vec2 res = vec2(0.0);
    nrm = vec2(0.0);
    tip = 0.0;
    float best = 0.0;
    const float NP = 9.0;                    // 한 변당 칸 수 (총 36개 슬롯)
    vec2 c = clamp(p, vec2(-1.0, -A), vec2(1.0, A));
    float cell = floor(perimS(c, A) * NP);
    for (int i = -2; i <= 2; i++) {
        float id = mod(cell + float(i), NP * 4.0);
        vec2 r1 = hash22(vec2(id, 3.71));
        vec2 r2 = hash22(vec2(id, 9.13));
        float sp = (id + 0.15 + r1.x * 0.70) / NP;
        // 모서리 억제 — fract(sp)가 0이나 1에 가까우면 변의 끝, 곧 모서리다.
        // 모서리에서는 두 변의 바늘이 겹쳐 뭉치므로 아예 세우지 않는다.
        float alongSide = fract(sp);
        float cornerFade = smoothstep(0.0, 0.20, alongSide) * smoothstep(1.0, 0.80, alongSide);
        // 바늘마다 자라나는 시점이 다르다 — 한꺼번에 솟으면 인공적이다.
        float grow = smoothstep(r1.y * 0.50, r1.y * 0.50 + 0.34, fz);
        float L = (0.05 + r2.x * r2.x * 0.30) * grow * cornerFade;
        if (L > 0.008) {
            vec2 nr = perimN(sp);
            vec2 tg = vec2(-nr.y, nr.x);
            vec2 base = perimP(sp, A) - nr * 0.03;
            vec2 ba = normalize(nr + tg * (r2.y - 0.5) * 1.15) * L;
            vec2 pa = p - base;
            float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            vec2 qv = pa - ba * t;
            float w = (0.018 + r2.x * 0.034) * (1.0 - t) * (1.0 - t * 0.30) + 0.0024;
            float prof = clamp(1.0 - length(qv) / w, 0.0, 1.0);
            if (prof > best) {
                best = prof;
                res = vec2(smoothstep(0.0, 0.14, prof), prof);
                vec2 perp = vec2(-ba.y, ba.x) / max(length(ba), 1e-4);
                nrm = perp * (dot(qv, perp) / w) * 1.35 - normalize(ba) * 0.28;
                tip = smoothstep(0.40, 0.96, t);
            }
        }
    }
    return res;
}

// 평면 바늘에 가짜 노멀을 씌워 입체로 보이게 한다.
vec3 shadeSpike(vec2 n2, float tipf, vec3 keyDir, float prof, float spec) {
    vec3 N = normalize(vec3(n2, 1.0));
    float ndl = clamp(dot(N, keyDir) * 0.5 + 0.5, 0.0, 1.0);
    float ndv = clamp(N.z, 0.0, 1.0);
    vec3 refl = reflect(vec3(0.0, 0.0, -1.0), N);
    float F = 0.035 + 0.965 * pow(1.0 - ndv, 4.0);
    // 앰비언트 바닥을 충분히 준다. 0.22로 시작하면 키 라이트를 등진 바늘이
    // 거의 검게 나와, 얼음이 아니라 검은 막대로 보인다.
    vec3 c = vec3(0.24, 0.47, 0.82) * (0.55 + 0.75 * pow(ndl, 1.4));
    c += vec3(0.10, 0.20, 0.34);                      // 하늘빛 앰비언트
    c += envLite(refl, 0.07, keyDir) * F * spec;
    c += vec3(0.58, 0.82, 1.12) * (1.0 - prof) * 0.55;   // 가장자리가 밝다
    c += vec3(0.66, 0.88, 1.15) * tipf * 0.60;           // 끝이 더 밝다
    c += vec3(1.0) * pow(max(dot(refl, keyDir), 0.0), 200.0) * 1.5 * spec;
    return c;
}

// 카드 주변 바닥이 얼어붙는 정도. 카드 테두리(dOut=0)에서 바깥으로 번지며,
// 경계를 노이즈로 흔들고 성에 고사리로 손가락처럼 뻗게 한다. pRim은 번져 나가는
// 경계에서만 밝게 터지는 띠.
float groundCov(vec2 q, float dOut, float fz, float reach, out float pRim) {
    float wob = (noise(q * 3.0 + 2.1) - 0.5) * 0.26 + (noise(q * 7.5 + 7.0) - 0.5) * 0.10;
    float finger = fernField(q * 8.5) * 0.11;
    float sgn = fz * reach - (dOut + wob * 0.55 - finger);
    pRim = exp(-abs(sgn) * 17.0) * smoothstep(0.02, 0.10, fz) * (1.0 - smoothstep(0.88, 1.0, fz));
    return clamp(sgn * 6.5, 0.0, 1.0);
}

float groundH(vec2 q, float cov) {
    if (cov < 0.01) return 0.0;
    return (bladeLayer(q, 61.0, 5.2, 0.30) * 0.64 + fernField(q * 6.2) * 0.44) * cov * 0.052;
}

// 얼음 높이장. 노멀은 이 함수의 유한차분으로 뽑는다.
float iceHeight(vec2 uv, float cov, out float fernOut) {
    vec2 sp = uv * vec2(1.0, u_aspect);
    float blade = bladeLayer(sp, 3.0, 7.2, 0.30);
    float fine  = bladeLayer(sp, 11.0, 16.5, 0.21);
    float fern  = fernField(sp * 11.0);
    fernOut = clamp(fern + fine * 0.45, 0.0, 1.0);
    return (0.24 + blade * 0.98 + fine * 0.44 + fern * 0.62) * cov * centerBias(uv);
}

void main() {
    // 평면은 바늘이 뻗을 여백만큼 카드보다 크다. 카드 기준 좌표(-1..1)를 먼저
    // 되찾아, 얼음·불꽃 로직이 예전처럼 카드 uv 위에서 돌게 한다.
    vec2 cardN = ((vUv - 0.5) * 2.0) / u_cardFrac;
    // 카드 밖(여백)에서는 uv가 [0,1]을 벗어난다. 카드 면 로직은 uv가 범위 안이라고
    // 가정하고 짜여 있으므로(예: pow(1-uv.y, k)는 밑이 음수가 되면 GLSL에서 정의되지
    // 않아 NaN을 뱉고, NaN은 마스크를 곱해도 사라지지 않아 검은 얼룩으로 남는다)
    // 여기서 잘라 둔다. 형태는 아래 타원 마스크가 rc(=cardN 길이)로 따로 결정한다.
    vec2 uv = clamp(cardN * 0.5 + 0.5, 0.0, 1.0);
    // 노이즈 좌표만 비율 보정 — uv 자체는 마스크 계산에 그대로 쓴다.
    vec2 np = vec2(uv.x, uv.y * u_aspect);


    // 두 레이어 모두 타원으로 마스킹한다. uv가 축마다 정규화돼 있어 length()가
    // 곧 카드 비율을 따르는 타원이 된다. 변의 중점이 1.0, 네 모서리가 1.414다.
    float rc = length(cardN);
    // 얼음 — 네 변에 내접하는 **큰** 타원. 카드를 거의 다 덮고 모서리만 남긴다.
    float iceMask = 1.0 - smoothstep(0.98, 1.34, rc);
    // 화염 — 그보다 안쪽에 몰아 카드 중앙만 태운다.
    float flameMask = 1.0 - smoothstep(0.55, 1.02, rc);

    vec3 color = vec3(0.0);
    float alpha = 0.0;

    // ── 빙결 ──────────────────────────────────────────────────────────────────
    // 결빙 프론트가 씨앗 세 곳과 가장자리에서 번져 나가고, 그 위로 결정 블레이드 +
    // 깃털 성에가 자란다. 높이장의 기울기로 노멀을 뽑아 회전하는 키 라이트에
    // 반짝이게 하고, 프론트 위에는 밝은 띠(rim)를 얹어 얼어붙는 순간을 보이게 한다.
    if (u_freeze > 0.001) {
        float rimFront;
        float cov = coverage(uv, u_freeze, rimFront);

        if (cov > 0.001) {
            float fernM;
            float du = 1.0 / 220.0;
            float h  = iceHeight(uv, cov, fernM);
            float fx, fy;
            float hx = iceHeight(uv + vec2(du, 0.0), cov, fx);
            float hy = iceHeight(uv + vec2(0.0, du), cov, fy);

            // 높이장 기울기 → 노멀. 평면 오버레이라 시선은 +Z 고정.
            vec3 N = normalize(vec3(-(hx - h) / du, -(hy - h) / du, 6.0));

            // 키 라이트가 천천히 돈다 — 정지 화면에서도 얼음이 살아 있게.
            float la = u_time * 0.30;
            vec3 keyDir = normalize(vec3(0.52 * cos(la) + 0.18, 0.62, 0.55 + 0.30 * sin(la * 0.8)));

            vec3 V = vec3(0.0, 0.0, 1.0);
            vec3 refl = reflect(-V, N);
            float ndl = clamp(dot(N, keyDir) * 0.5 + 0.5, 0.0, 1.0);

            // 성에가 덮인 곳은 거칠고(넓고 흐린 하이라이트), 맑은 얼음은 날카롭다.
            float frostSurf = clamp(fernM * cov, 0.0, 1.0);
            float shininess = mix(180.0, 14.0, frostSurf);
            float spec = pow(max(dot(refl, keyDir), 0.0), shininess) * mix(1.0, 0.45, frostSurf);

            // 프레넬 — 비스듬한 면일수록 하늘빛을 세게 반사한다.
            float fres = pow(1.0 - clamp(N.z, 0.0, 1.0), 3.0);

            vec3 iceDeep  = vec3(0.16, 0.34, 0.58);
            vec3 iceLight = vec3(0.74, 0.90, 1.00);
            vec3 sky      = vec3(0.40, 0.66, 1.00);

            vec3 ice = mix(iceDeep, iceLight, 0.25 + 0.55 * ndl);
            ice = mix(ice, sky, fres * 0.55);
            ice += vec3(1.0, 0.99, 0.97) * spec * 1.35;
            // 표면에 앉은 가루 성에 — 빛을 산란시켜 뿌옇게 희어진다.
            ice = mix(ice, vec3(0.82, 0.91, 1.02) * (0.35 + 0.75 * ndl), smoothstep(0.30, 0.92, frostSurf) * 0.60);

            // 균열 — 얼음이 두꺼워진 뒤에야 갈라진다.
            vec2 ck = crackNet(uv * vec2(1.0, u_aspect), 5.4, u_freeze);
            float ckm = cov * smoothstep(0.30, 0.80, u_freeze);
            ice *= 1.0 - ck.x * 0.22 * ckm;
            ice += vec3(0.58, 0.82, 1.10) * ck.y * ckm * 0.85;

            // 미세 반짝임 — 잘게 흩어진 결정면이 각자 다른 위상으로 명멸한다.
            vec2 gid = floor(uv * vec2(1.0, u_aspect) * 120.0);
            vec2 gr = hash22(gid);
            vec3 microN = normalize(vec3((gr - 0.5) * 0.85, 1.0));
            float glint = pow(max(dot(normalize(refl + microN * 0.30), keyDir), 0.0), 500.0)
                        * (0.35 + 0.65 * pow(sin(u_time * 2.6 + gr.x * 6.28) * 0.5 + 0.5, 3.0))
                        * step(0.55, hash(gid + 11.0));
            ice += vec3(1.0) * glint * 2.4;

            // 결빙 프론트 — 번져 나가는 경계에서만 터지는 밝은 띠.
            rimFront *= 0.22 + 1.20 * noise(uv * vec2(1.0, u_aspect) * 54.0);
            rimFront *= 0.55 + 0.65 * noise(uv * vec2(1.0, u_aspect) * 11.0);
            ice += vec3(0.55, 0.92, 1.25) * rimFront * 2.6;
            ice += vec3(0.30, 0.72, 1.10) * rimFront * rimFront * 3.2;

            // 얇은 곳은 카드가 비쳐 보이고, 두꺼운 곳일수록 불투명해진다.
            float iceAlpha = clamp(cov * (0.26 + h * 0.34) + spec * 0.30 + rimFront * 0.55, 0.0, 0.95)
                           * u_freeze * iceMask;

            color += ice * iceAlpha;
            alpha += iceAlpha;
        }
    }

    // ── 카드 둘레의 얼음 바늘 ─────────────────────────────────────────────────
    // 얼음이 카드 면에만 깔리면 텍스처를 씌운 느낌이 난다. 테두리 밖으로 결정이
    // 뻗어야 카드가 얼음에 갇힌 것으로 읽힌다. 타원 마스크는 적용하지 않는다 —
    // 바늘은 애초에 카드 바깥에 있다.
    if (u_freeze > 0.001) {
        float A = u_aspect;
        vec2 q = vec2(cardN.x, cardN.y * A);   // 카드: x∈[-1,1], y∈[-A,A]
        float dOut = sdBox2(q, vec2(1.0, A)) - 0.03;   // >0 이면 카드 바깥

        // ── 주변 바닥 결빙 ────────────────────────────────────────────────────
        // 카드만 얼면 공중에 뜬 느낌이 난다. 테두리 밖으로 서리가 얇게 번져야
        // 바닥째 얼어붙은 것으로 읽힌다. 여백이 좁으니 아주 얕게만 깐다.
        if (dOut > 0.0) {
            float gRim;
            float gc = groundCov(q, dOut, u_freeze, GROUND_REACH, gRim);
            if (gc > 0.003) {
                float e2 = 0.010;
                float gh  = groundH(q, gc);
                float ghx = groundH(q + vec2(e2, 0.0), gc);
                float ghy = groundH(q + vec2(0.0, e2), gc);
                vec3 gN = normalize(vec3(-(ghx - gh) / e2, -(ghy - gh) / e2, 1.0));

                float gla = u_time * 0.30;
                vec3 gKey = normalize(vec3(0.42 * cos(gla) + 0.14, 0.56, 0.70 + 0.20 * sin(gla * 0.8)));
                float gndl = clamp(dot(gN, gKey) * 0.5 + 0.5, 0.0, 1.0);
                vec3 gRefl = reflect(vec3(0.0, 0.0, -1.0), gN);

                vec3 gCol = vec3(0.185, 0.345, 0.600) * (0.34 + 0.92 * pow(gndl, 1.35));
                gCol += envLite(gRefl, 0.22, gKey) * (0.05 + 0.95 * pow(1.0 - gN.z, 4.0));
                gCol += vec3(0.64, 0.84, 1.08) * smoothstep(0.004, 0.022, gh) * 0.62;
                gCol += vec3(1.0) * pow(max(dot(gRefl, gKey), 0.0), 260.0) * 1.3;
                gCol += vec3(0.50, 0.88, 1.25) * gRim * 2.2;

                // 얇게 — '조금만 얼린' 정도로 두고 카드 쪽으로 갈수록 진해진다.
                float gAlpha = clamp(smoothstep(0.0, 0.16, gc) * (0.20 + gh * 6.0) + gRim * 0.35, 0.0, 0.55)
                             * u_freeze;
                color += gCol * gAlpha;
                alpha += gAlpha;
            }
        }

        vec2 spikeN;
        float spikeTip;
        vec2 sp = rimSpikes(q, A, u_freeze, spikeN, spikeTip);

        if (sp.x > 0.002) {
            float la = u_time * 0.30;
            vec3 keyDir = normalize(vec3(0.42 * cos(la) + 0.14, 0.56, 0.70 + 0.20 * sin(la * 0.8)));
            vec3 spikeCol = shadeSpike(spikeN, spikeTip, keyDir, sp.y, 1.0);
            // 얼음은 투명체다 — 알파를 밝기에 묶어, 어두운 면은 불투명한 검은 막대로
            // 남지 않고 그냥 사라지게 한다. (밝기와 알파가 따로 놀면 검은 스파이크가
            // 생긴다.)
            float lum = clamp(dot(spikeCol, vec3(0.2126, 0.7152, 0.0722)) * 1.7, 0.0, 1.0);
            float spikeAlpha = clamp(sp.x * (0.18 + 0.82 * lum), 0.0, 0.92) * u_freeze;
            color += spikeCol * spikeAlpha;
            alpha += spikeAlpha;
        }
    }

    // ── 암흑 화염 (아마테라스) ────────────────────────────────────────────────
    // 검은 불꽃이 본체이고, 그 **윤곽에만** 진홍이 타오른다. 밝은 화염을 어둡게
    // 칠하는 게 아니라, 칠흑 덩어리의 가장자리를 얇고 강하게 태우는 방식.
    if (u_flame > 0.001) {
        // 아래에서 위로 솟는 흐름. 두 층을 다른 속도로 겹쳐 혀가 갈라지게 한다.
        vec2 f1 = vec2(np.x * 3.0, np.y * 2.4 - u_time * 1.55);
        vec2 f2 = vec2(np.x * 5.5 + 3.7, np.y * 4.1 - u_time * 2.35);

        // 자기 참조 왜곡(domain warp) — 불꽃이 곧게 오르지 않고 휘감긴다.
        float w = fbm(f1);
        float body = fbm(f1 + vec2(w * 1.15, w * 0.75));
        float lick = fbm(f2 + vec2(body * 0.9, body * 0.6));

        // 아래에 뿌리내리고 위로 갈수록 옅어지는 마스크. 지수를 낮춰 혀가 위까지 뻗는다.
        float rise = pow(max(0.0, 1.0 - uv.y), 1.15);
        float field = body * (0.50 + rise * 0.85) + lick * 0.28 * rise;

        // 밀도장의 등고선 하나를 불꽃 경계로 삼는다. 경계 안쪽 = 칠흑,
        // 경계 근방의 얇은 띠 = 진홍. threshold를 살짝 흔들어 불규칙하게 타오르게.
        float threshold = 0.52 - 0.05 * sin(u_time * 3.1 + np.y * 5.0);
        float inside = smoothstep(threshold, threshold + 0.10, field);

        // rim은 등고선 양옆으로만 서는 얇은 띠 — 안쪽으로 들어가면 급격히 사라진다.
        float band = abs(field - threshold);
        float rim = 1.0 - smoothstep(0.0, 0.075, band);
        rim *= inside * 0.35 + 0.65;   // 바깥 허공보다 불꽃 쪽 테두리가 더 강하다

        // 아마테라스 팔레트 — 본체는 순흑에 가깝고, 테두리만 진홍→주황으로 달아오른다.
        vec3 pitch   = vec3(0.010, 0.006, 0.012);
        vec3 crimson = vec3(0.85, 0.06, 0.03);
        vec3 ember   = vec3(1.00, 0.42, 0.06);

        // 테두리 안쪽은 진홍, 가장 얇은 심지는 주황으로 한 번 더 달군다.
        float core = pow(rim, 2.6);
        vec3 fire = mix(pitch, crimson, rim);
        fire = mix(fire, ember, core * 0.7);

        // 검은 불꽃은 카드를 **가린다** — 알파는 본체(inside)가 지배하고,
        // 테두리는 발광이므로 색만 얹는다.
        float bodyAlpha = inside * (0.72 + 0.20 * rise);
        float rimAlpha  = rim * 0.55;
        float fireAlpha = clamp(bodyAlpha + rimAlpha, 0.0, 1.0) * u_flame * flameMask;

        color += fire * fireAlpha;
        // 불티 — 테두리 위에서만 드물게 튀어 오르는 잔불.
        float sparkNoise = noise(vec2(np.x * 26.0, np.y * 18.0 - u_time * 3.4));
        float spark = smoothstep(0.88, 1.0, sparkNoise) * rim * rise;
        color += ember * spark * 0.85 * u_flame * flameMask;

        alpha += fireAlpha;
    }

    // NaN 방어 — 셰이더 어딘가에서 NaN이 나오면 알파가 0.001보다 크지도 작지도
    // 않아 discard를 통과한 뒤 검은 픽셀로 남는다. 자기 자신과 다르면 NaN이다.
    if (!(alpha > 0.001)) discard;

    // color는 알파를 곱해 누적했으므로(프리멀티플라이) 나눠서 되돌린다.
    // 그대로 내보내면 겹친 레이어가 이중으로 어두워진다.
    vec3 rgb = color / alpha;

    // 두 레이어 모두 타원 마스크를 이미 거쳤으므로 카드 경계 페이드는 필요 없다.
    alpha = clamp(alpha, 0.0, 0.92);

    gl_FragColor = vec4(rgb, alpha);
}
`;

// 바늘이 뻗을 여백 — 카드 '반폭' 단위. 셰이더의 최대 바늘 길이(0.05 + 0.30 = 0.35)
// 보다 넉넉해야 끝이 평면 밖에서 잘리지 않는다.
const SPIKE_MARGIN = 0.42;

export class FrozenBurningOverlayEffect {
    private readonly overlays = new Map<number, Overlay>();

    // 카드 그룹의 자식으로 오버레이를 얹는다. 이미 붙어 있으면 크기만 갱신한다.
    // 카드보다 큰 평면에 얹는다. 카드 면의 얼음·화염은 타원으로 마스킹해 테두리의
    // 무기 / HP / 종족 / 에너지 표기를 비켜 가고, 여백에는 얼음 바늘이 뻗는다.
    public attach(entityId: number, group: THREE.Object3D, cardWidth: number, cardHeight: number): void {
        const existing = this.overlays.get(entityId);
        if (existing) {
            this.resize(entityId, cardWidth, cardHeight);
            return;
        }

        // 평면을 카드보다 키운다 — 그래야 테두리 밖으로 바늘이 뻗을 자리가 생긴다.
        // 여백은 가로·세로 모두 카드 '반폭' 기준이라 네 변의 바늘 크기가 같아진다.
        const halfW = cardWidth * 0.5;
        const planeWidth = cardWidth + halfW * SPIKE_MARGIN * 2;
        const planeHeight = cardHeight + halfW * SPIKE_MARGIN * 2;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_freeze: { value: 0 },
                u_flame: { value: 0 },
                u_aspect: { value: cardHeight / Math.max(cardWidth, 0.0001) },
                u_cardFrac: {
                    value: new THREE.Vector2(cardWidth / planeWidth, cardHeight / planeHeight),
                },
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);
        // 카드 아트 위, 에너지 아이콘(renderOrder 2)보다도 위. depthTest는 켜 둔다 —
        // 끄면 renderOrder만으로 순서가 정해져 팝업 위로도 그려진다.
        mesh.position.set(0, 0, 0.015);
        mesh.renderOrder = 3;
        group.add(mesh);

        this.overlays.set(entityId, {
            mesh,
            material,
            parent: group,
            freezeTarget: 0,
            flameTarget: 0,
        });
    }

    // 두 상태를 독립 제어한다. 목표값만 세우고 updateAnimation이 부드럽게 따라간다.
    public setState(entityId: number, state: { freeze?: boolean; flame?: boolean }): void {
        const overlay = this.overlays.get(entityId);
        if (!overlay) return;
        if (state.freeze !== undefined) overlay.freezeTarget = state.freeze ? 1 : 0;
        if (state.flame !== undefined) overlay.flameTarget = state.flame ? 1 : 0;
    }

    public isAttached(entityId: number): boolean {
        return this.overlays.has(entityId);
    }

    public resize(entityId: number, cardWidth: number, cardHeight: number): void {
        const overlay = this.overlays.get(entityId);
        if (!overlay) return;
        const halfW = cardWidth * 0.5;
        const planeWidth = cardWidth + halfW * SPIKE_MARGIN * 2;
        const planeHeight = cardHeight + halfW * SPIKE_MARGIN * 2;
        overlay.mesh.geometry.dispose();
        overlay.mesh.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        overlay.material.uniforms.u_aspect.value = cardHeight / Math.max(cardWidth, 0.0001);
        overlay.material.uniforms.u_cardFrac.value.set(
            cardWidth / planeWidth, cardHeight / planeHeight,
        );
    }

    // 매 프레임 호출. elapsed는 AnimationLoop의 누적 시간(초).
    public updateAnimation(elapsed: number, delta: number): void {
        for (const overlay of this.overlays.values()) {
            const u = overlay.material.uniforms;
            u.u_time.value = elapsed;
            // 상태 전환은 0.35초에 걸쳐 페이드 — 빙결 해제가 툭 끊기지 않는다.
            const step = Math.min(1, delta / 0.35);
            u.u_freeze.value += (overlay.freezeTarget - u.u_freeze.value) * step;
            u.u_flame.value += (overlay.flameTarget - u.u_flame.value) * step;
        }
    }

    public detach(entityId: number): void {
        const overlay = this.overlays.get(entityId);
        if (!overlay) return;
        overlay.parent.remove(overlay.mesh);
        overlay.mesh.geometry.dispose();
        overlay.material.dispose();
        this.overlays.delete(entityId);
    }

    public detachAll(): void {
        for (const entityId of [...this.overlays.keys()]) this.detach(entityId);
    }
}
