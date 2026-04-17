import * as THREE from "three";
import { NeonBorderFrame } from "../frame/NeonBorderFrame";

const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const FRAGMENT_SHADER = `
    uniform vec3 baseColor;
    uniform vec3 glowColor;
    uniform float time;
    varying vec2 vUv;
    void main() {
        float glowFactor = sin(time * 5.0) * 0.5 + 0.5;
        vec3 finalColor = mix(baseColor, glowColor, glowFactor);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

interface ActiveBorder {
    meshes: THREE.Mesh[];
    materials: THREE.ShaderMaterial[];
}

interface BorderEntry {
    border: ActiveBorder;
    group: THREE.Group;
}

// Supports both single-select (ally: detachAll → attach) and multi-select (enemy: attach N
// cards, detachAll when done). Call updateAnimation() each frame for the glow oscillation.
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

        const hw = cardWidth / 2;
        const hh = cardHeight / 2;
        const t = this.frame.lineThickness;
        const z = this.frame.zOffset;

        const meshes: THREE.Mesh[] = [];
        const materials: THREE.ShaderMaterial[] = [];

        const addLine = (width: number, height: number, x: number, y: number): void => {
            const mat = this.createMaterial();
            const geo = new THREE.PlaneGeometry(width, height);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.renderOrder = 1;
            mesh.userData.__neonBorderLine = true;
            group.add(mesh);
            meshes.push(mesh);
            materials.push(mat);
        };

        addLine(cardWidth, t, 0, -hh);
        addLine(cardWidth, t, 0, hh);
        addLine(t, cardHeight, -hw, 0);
        addLine(t, cardHeight, hw, 0);

        this.activeBorders.set(entityId, { border: { meshes, materials }, group });
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

    private createMaterial(): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                baseColor: { value: new THREE.Color(this.frame.baseColor) },
                glowColor: { value: new THREE.Color(this.frame.glowColor) },
                time: { value: 0.0 },
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
        });
    }
}
