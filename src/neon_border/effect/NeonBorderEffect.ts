import * as THREE from "three";
import { NeonBorderFrame } from "../frame/NeonBorderFrame";

const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Single-mesh border glow: computes distance from nearest edge in UV space,
// produces soft glow at edges with natural corner blending. No seams, no overlap.
const BORDER_FRAGMENT_SHADER = `
    uniform vec3 baseColor;
    uniform vec3 glowColor;
    uniform float time;
    uniform float borderX;
    uniform float borderY;
    varying vec2 vUv;
    void main() {
        float dx = min(vUv.x, 1.0 - vUv.x);
        float dy = min(vUv.y, 1.0 - vUv.y);
        float ex = 1.0 - smoothstep(0.0, borderX, dx);
        float ey = 1.0 - smoothstep(0.0, borderY, dy);
        float glow = max(ex, ey);
        float pulse = sin(time * 5.0) * 0.3 + 0.7;
        vec3 finalColor = mix(baseColor, glowColor, pulse);
        gl_FragColor = vec4(finalColor, glow * pulse * 0.85);
    }
`;

interface ActiveBorder {
    meshes: THREE.Mesh[];
    materials: THREE.ShaderMaterial[];
}

interface BorderEntry {
    border: ActiveBorder;
    group: THREE.Group;
    // 이 테두리를 그릴 때 읽었던 대상의 크기. 대상이 그새 달라졌는지 보는 데 쓴다.
    builtWidth: number;
    builtHeight: number;
}

export class NeonBorderEffect {
    private readonly frame: NeonBorderFrame;
    private readonly activeBorders: Map<number, BorderEntry> = new Map();

    constructor(frame: NeonBorderFrame) {
        this.frame = frame;
    }

    public attach(entityId: number, group: THREE.Group): void {
        this.detach(entityId);

        const userData = group.userData as { baseCardWidth?: number; baseCardHeight?: number };
        const cardWidth = userData.baseCardWidth ?? 100;
        const cardHeight = userData.baseCardHeight ?? 160;

        const t = this.frame.lineThickness;
        const z = this.frame.zOffset;

        // Single plane covering the entire card + glow margin
        const margin = t;
        const planeW = cardWidth + margin * 2;
        const planeH = cardHeight + margin * 2;

        // Border width in UV space (normalized)
        const borderX = (t / 2) / planeW;
        const borderY = (t / 2) / planeH;

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                baseColor: { value: new THREE.Color(this.frame.baseColor) },
                glowColor: { value: new THREE.Color(this.frame.glowColor) },
                time: { value: 0.0 },
                borderX: { value: borderX },
                borderY: { value: borderY },
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: BORDER_FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const geo = new THREE.PlaneGeometry(planeW, planeH);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 0, z);
        mesh.renderOrder = 1;
        mesh.userData.__neonBorderLine = true;
        group.add(mesh);

        this.activeBorders.set(entityId, {
            border: { meshes: [mesh], materials: [mat] },
            group,
            builtWidth: cardWidth,
            builtHeight: cardHeight,
        });
    }

    // 붙어 있는 테두리를 지금 크기로 다시 그린다.
    //
    // 테두리 크기는 붙일 때 그 대상의 크기를 읽어서 정해진다. 창 크기가 바뀌면 대상은
    // 새 크기가 되는데 테두리는 붙일 때 크기 그대로라, 대상을 감싸지 못하고 어긋난다.
    // 붙어 있던 것을 그대로 다시 붙이면 새 크기를 다시 읽는다.
    //
    // 카드처럼 통째로 늘었다 줄었다 하는 대상은 테두리도 함께 따라가므로 읽어 둔 크기가
    // 안 달라진다. 그런 것까지 다시 만들면 창을 끄는 동안 헛일이 쌓이므로 건너뛴다.
    public refreshSizes(): void {
        for (const [entityId, entry] of [...this.activeBorders.entries()]) {
            const userData = entry.group.userData as { baseCardWidth?: number; baseCardHeight?: number };
            const width = userData.baseCardWidth ?? 100;
            const height = userData.baseCardHeight ?? 160;
            if (width === entry.builtWidth && height === entry.builtHeight) continue;
            this.attach(entityId, entry.group);
        }
    }

    public detach(entityId: number): void {
        const entry = this.activeBorders.get(entityId);
        if (!entry) return;
        for (const mesh of entry.border.meshes) {
            entry.group.remove(mesh);
            mesh.geometry.dispose();
        }
        for (const mat of entry.border.materials) {
            mat.dispose();
        }
        this.activeBorders.delete(entityId);
    }

    public detachAll(): void {
        for (const entityId of [...this.activeBorders.keys()]) {
            this.detach(entityId);
        }
    }

    public updateAnimation(): void {
        for (const entry of this.activeBorders.values()) {
            for (const mat of entry.border.materials) {
                mat.uniforms.time.value += this.frame.timeIncrement;
            }
        }
    }

    public hasActive(): boolean {
        return this.activeBorders.size > 0;
    }

    public getActiveEntityIds(): number[] {
        return [...this.activeBorders.keys()];
    }
}
