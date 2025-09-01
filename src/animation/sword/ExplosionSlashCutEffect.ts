import * as THREE from 'three';

class Slash {
    mesh: THREE.Mesh;
    life: number;
    speed: number;

    constructor(scene: THREE.Scene) {
        // 화면 전체 Plane
        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            uniforms: { u_time: { value: 0 } },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float u_time;

                void main() {
                    float center = 0.5;

                    // 중심 흰색 칼날
                    float centerAlpha = smoothstep(0.02, 0.0, abs(vUv.x - center));

                    // 칼날 끝부분 퍼짐
                    float tipAlpha = smoothstep(1.0, 0.8, vUv.y) * (1.0 - u_time);

                    // 색상: 중심 흰색 -> 보라 -> 하늘색
                    vec3 baseColor = mix(vec3(1.0), mix(vec3(0.5,0.0,1.0), vec3(0.0,1.0,1.0), vUv.y), vUv.x);

                    float alpha = max(centerAlpha, tipAlpha);

                    gl_FragColor = vec4(baseColor, alpha * 1.5);
                }
            `
        });

        this.mesh = new THREE.Mesh(geometry, material);

        // 중앙 위치 + 랜덤 회전
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.z = (Math.random() - 0.5) * Math.PI / 4;

        scene.add(this.mesh);

        this.life = 1.0;
        this.speed = Math.random() * 0.8 + 0.5;
    }

    update(delta: number) {
        this.life -= delta * this.speed;
        (this.mesh.material as THREE.ShaderMaterial).uniforms.u_time.value = 1 - this.life;

        // 칼날 길이 확장
        this.mesh.scale.y += delta * 0.5;

        if (this.life <= 0) this.mesh.parent?.remove(this.mesh);
    }

    isAlive() {
        return this.life > 0;
    }
}

export class SlashCutEffect {
    private static instance: SlashCutEffect | null = null;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;

    private slashes: Slash[] = [];
    private isCutting = false;

    private overlayScene: THREE.Scene;
    private overlayCamera: THREE.OrthographicCamera;

    private constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera as THREE.OrthographicCamera;

        // Slash 전용 Overlay Scene + Camera
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

    public start(count: number = 5) {
        for (let i = 0; i < count; i++) {
            this.slashes.push(new Slash(this.overlayScene));
        }

        if (!this.isCutting) this.animate();
    }

    private animate = () => {
        if (this.slashes.length === 0) {
            this.isCutting = false;
            return;
        }

        this.isCutting = true;
        requestAnimationFrame(this.animate);

        const delta = 0.016;
        this.slashes.forEach(s => s.update(delta));
        this.slashes = this.slashes.filter(s => s.isAlive());

        // 메인 씬 지우지 않고 Overlay Slash 렌더링
        this.renderer.autoClear = false;
        this.renderer.render(this.overlayScene, this.overlayCamera);
        this.renderer.autoClear = true;
    };
}
