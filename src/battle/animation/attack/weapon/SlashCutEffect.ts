import * as THREE from 'three';

class SplitPlane {
    mesh: THREE.Mesh;
    direction: number;
    angle: number;

    constructor(texture: THREE.Texture, direction: number, angle: number) {
        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                u_texture: { value: texture },
                u_direction: { value: direction },
                u_angle: { value: angle },
                u_time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D u_texture;
                uniform float u_direction;
                uniform float u_angle;

                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    float c = (vUv.x - center.x) * cos(u_angle) + (vUv.y - center.y) * sin(u_angle);
                    if ((u_direction > 0.0 && c < 0.0) || (u_direction < 0.0 && c > 0.0)) discard;

                    vec4 color = texture2D(u_texture, vUv);
                    gl_FragColor = color;
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 0);
        this.direction = direction;
        this.angle = angle;
    }

    update(progress: number) {
        const offset = progress * this.direction;
        this.mesh.position.x = Math.cos(this.angle + Math.PI / 2) * offset;
        this.mesh.position.y = Math.sin(this.angle + Math.PI / 2) * offset;
    }
}

class Slash {
    mesh: THREE.Mesh;
    life: number;

    constructor(scene: THREE.Scene, angle: number) {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            uniforms: { u_time: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() { vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;
                void main() {
                    float center = 0.5;
                    float centerAlpha = smoothstep(0.02, 0.0, abs(vUv.x - center));
                    float tipAlpha = smoothstep(1.0, 0.8, vUv.y) * (1.0 - u_time);
                    vec3 baseColor = mix(vec3(1.0), mix(vec3(0.5,0,1.0), vec3(0.0,1.0,1.0), vUv.y), vUv.x);
                    float alpha = max(centerAlpha, tipAlpha);
                    gl_FragColor = vec4(baseColor, alpha * 1.5);
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.z = angle;
        scene.add(this.mesh);
        this.life = 1.0;
    }

    update(delta: number) {
        this.life -= delta;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.u_time.value = 1 - this.life;
        this.mesh.scale.y += delta * 0.5;
        if (this.life <= 0) this.mesh.parent?.remove(this.mesh);
    }

    isAlive() { return this.life > 0; }
}

export class SlashCutEffect {
    private static instance: SlashCutEffect | null = null;

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;

    private slashes: Slash[] = [];
    private splitPlanes: SplitPlane[] = [];
    private renderTarget: THREE.WebGLRenderTarget;
    private overlayScene: THREE.Scene;
    private overlayCamera: THREE.OrthographicCamera;

    private isCutting = false;
    private progress = 0;
    private angle = 0;

    private constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera as THREE.OrthographicCamera;

        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

        this.overlayScene = new THREE.Scene();
        this.overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    }

    public static initialize(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): SlashCutEffect {
        if (!SlashCutEffect.instance) SlashCutEffect.instance = new SlashCutEffect(renderer, scene, camera);
        return SlashCutEffect.instance;
    }

    public static getInstance(): SlashCutEffect {
        if (!SlashCutEffect.instance) throw new Error("SlashCutEffect 초기화 필요");
        return SlashCutEffect.instance;
    }

    public start() {
        if (this.isCutting) return;

        this.angle = (Math.random() - 0.5) * Math.PI / 3;

        // 백그라운드 캡처
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);

        // 위/아래 SplitPlane 생성
        this.splitPlanes = [
            new SplitPlane(this.renderTarget.texture, +1, this.angle),
            new SplitPlane(this.renderTarget.texture, -1, this.angle)
        ];

        this.splitPlanes.forEach(p => this.overlayScene.add(p.mesh));

        // Slash 생성 (시각 효과)
        this.slashes = [new Slash(this.overlayScene, this.angle)];

        this.progress = 0;
        this.isCutting = true;
        this.animate();
    }

    private animate = () => {
        if (!this.isCutting) return;
        requestAnimationFrame(this.animate);

        const delta = 0.016;
        this.progress += delta * 1.5;

        // SplitPlane 이동
        this.splitPlanes.forEach(p => p.update(this.progress));

        // Slash 업데이트
        this.slashes.forEach(s => s.update(delta));
        this.slashes = this.slashes.filter(s => s.isAlive());

        // 배경 검정색으로 처리
        this.renderer.autoClear = true;
        this.renderer.setClearColor(0x000000, 1); // 검정 배경
        this.renderer.clear();

        // OverlayScene 렌더
        this.renderer.render(this.overlayScene, this.overlayCamera);

        if (this.progress > 1.5 && this.slashes.length === 0) {
            this.splitPlanes.forEach(p => p.mesh.parent?.remove(p.mesh));
            this.isCutting = false;
        }
    }

}
