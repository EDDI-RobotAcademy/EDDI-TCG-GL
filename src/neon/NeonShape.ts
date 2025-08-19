import * as THREE from 'three';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { MaskPass } from "three/examples/jsm/postprocessing/MaskPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {Line2} from "three/examples/jsm/lines/Line2";
import {LineBasicMaterial} from "three";

interface CustomMeshBasicMaterialParameters extends THREE.MeshBasicMaterialParameters {
    onBeforeCompile?: (shader: THREE.ShaderMaterial) => void;
}

// Custom shader material interface
export interface Shader extends THREE.ShaderMaterial {
    uniforms: any;
    fragmentShader: string;
}

export class NeonShape {
    private static instance: NeonShape | null = null;

    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.OrthographicCamera;
    private neonMaterial: Shader | null = null;
    private materials: THREE.ShaderMaterial[] = [];

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
    }

    public static getInstance(scene?: THREE.Scene, renderer?: THREE.WebGLRenderer, camera?: THREE.OrthographicCamera): NeonShape {
        if (!this.instance) {
            if (!scene || !renderer || !camera) {
                throw new Error("NeonShape has not been initialized. Please pass scene, renderer, and camera.");
            }
            this.instance = new NeonShape(scene, renderer, camera);
        }
        return this.instance;
    }

    // 통합된 createNeonLine
    private createNeonLine(startX: number, startY: number, endX: number, endY: number, lineWidth: number = 10): THREE.Mesh {
        // const color = 0x3137FD; // 네온 블루 색상
        // const color = 0x2c75ff; // 네온 블루 색상
        const color = 0x2EFEF7; // 네온 블루 색상
        // const color = 0x2C75FF; // 네온 블루 색상

        const direction = new THREE.Vector3(endX - startX, endY - startY, 0);
        const length = direction.length();
        direction.normalize();

        const material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8,
            depthTest: false,
        });

        const geometry = new THREE.PlaneGeometry(length, lineWidth);
        const line = new THREE.Mesh(geometry, material);

        const angle = Math.atan2(direction.y, direction.x);
        line.rotation.z = angle;
        line.position.set(startX + direction.x * length / 2, startY + direction.y * length / 2, 4);

        return line;
    }

    // 블룸 효과 적용
    private applyGlowEffect(): EffectComposer {
        const composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.renderer.domElement.width, this.renderer.domElement.height),
            1.5, 0.4, 0.85
        );
        composer.addPass(bloomPass);

        return composer;
    }

    // 네온 라인 추가
    public async addNeonLine(startX: number, startY: number, endX: number, endY: number, lineWidth: number = 10): Promise<void> {
        const line = this.createNeonLine(startX, startY, endX, endY, lineWidth);
        line.renderOrder = 1;
        this.scene.add(line);
        this.applyGlowEffect();
    }

    private createNeonRectangleWireframe(width: number, height: number, lineWidth: number = 5): THREE.LineSegments {
        const color = 0x3137FD;  // Neon blue color
        const borderColor = 0xFF0000;  // Red color for the border

        // Create the geometry for the wireframe: a simple rectangular path
        const vertices = new Float32Array([
            0, 0, 0,
            width, 0, 0,
            width, 0, 0,
            width, height, 0,
            width, height, 0,
            0, height, 0,
            0, height, 0,
            0, 0, 0
        ]);

        // Create a LineGeometry from the vertices
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Create a LineBasicMaterial for the wireframe with neon color
        const material = new LineBasicMaterial({
            color: borderColor,
            linewidth: lineWidth,
            opacity: 1,
            transparent: true,
            depthTest: false, // Ensure it stays visible
        });

        // Create the wireframe using the geometry and material
        const line = new THREE.LineSegments(geometry, material);
        return line;
    }

    // Method to add the neon rectangle wireframe to the scene
    public addNeonRectangle2(startX: number, startY: number, width: number, height: number, lineWidth: number = 5): void {
        const wireframe = this.createNeonRectangleWireframe(width, height, lineWidth);

        // Position the wireframe and add it to the scene
        wireframe.position.set(startX, startY, 0);
        this.scene.add(wireframe);

        const composer = this.applyGlowEffect();
        // const render = () => {
        //     composer.render();
        //     requestAnimationFrame(render);
        // };
        // render();
    }

    // 네온 사각형 추가
    public async addNeonRectangle1(startX: number, startY: number, rectLength: number): Promise<void> {
        await this.addNeonLine(startX + 5.0, startY, startX + rectLength - 5.0, startY); // 하단
        await this.addNeonLine(startX + rectLength, startY - 5.0, startX + rectLength, startY + rectLength); // 우측
        await this.addNeonLine(startX + rectLength + 5.0, startY + rectLength + 5.0, startX - 5.0, startY + rectLength + 5.0); // 상단
        await this.addNeonLine(startX, startY + rectLength, startX, startY - 5.0); // 좌측
    }

    public createNeonShaderMaterial(baseColor: THREE.Color, glowColor: THREE.Color): Shader {
        const shaderMaterial: Shader = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                baseColor: { value: baseColor },
                glowColor: { value: glowColor },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                uniform vec3 glowColor;
                varying vec2 vUv;
            
                void main() {
                    // 번쩍거림 효과 계산
                    float glowFactor = sin(time * 5.0) * 0.5 + 0.5; // 진동하는 글로우
            
                    // 기본 색상과 글로우 색상을 섞어서 최종 색상 계산
                    vec3 finalColor = mix(baseColor, glowColor, glowFactor);
            
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            transparent: true,
        });

        return shaderMaterial;
    }

    public async addNeonShaderRectangle(startX: number, startY: number, width: number, height: number,
                                        baseColor: THREE.Color, glowColor: THREE.Color): Promise<{ lines: THREE.Mesh[]; neonMaterials: THREE.ShaderMaterial[] }> {
        const results = [];

        // 사각형의 각 변에 대해 4개의 선을 추가하고 결과 저장
        // results.push(await this.addNeonShaderLine(startX + 5.0, startY, startX + width - 5.0, startY, baseColor, glowColor)); // 하단
        results.push(await this.addNeonShaderLine(startX, startY, startX + width, startY, baseColor, glowColor)); // 하단
        // results.push(await this.addNeonShaderLine(startX + width, startY - 5.0, startX + width, startY + height, baseColor, glowColor)); // 우측
        results.push(await this.addNeonShaderLine(startX + width, startY - 2.5, startX + width, startY + height, baseColor, glowColor)); // 우측
        results.push(
            await this.addNeonShaderLine(
                startX + width + 2.5,
                startY + height,
                startX - 2.5,
                startY + height,
                baseColor, glowColor
            )
        ); // 상단
        results.push(await this.addNeonShaderLine(startX, startY + height, startX, startY - 2.5, baseColor, glowColor)); // 좌측

        // 결과를 라인과 머티리얼로 분리
        const lines = results.map((result) => result.line);
        const neonMaterials = results.map((result) => result.neonMaterial);

        return { lines, neonMaterials };
    }

    private async addNeonShaderLine(startX: number, startY: number, endX: number, endY: number,
                                    baseColor: THREE.Color, glowColor: THREE.Color
            ): Promise<{ line: THREE.Mesh; neonMaterial: THREE.ShaderMaterial }>{
        // 네온 셰이더 머티리얼 생성
        const neonMaterial = this.createNeonShaderMaterial(baseColor, glowColor);

        // 선의 방향과 길이 계산
        const direction = new THREE.Vector3(endX - startX, endY - startY, 0);
        const length = direction.length();
        direction.normalize();

        // 선의 기하학적 정의
        const geometry = new THREE.PlaneGeometry(length, 5); // 선 두께는 10으로 설정
        const line = new THREE.Mesh(geometry, neonMaterial);

        // 선 회전 (방향 맞추기)
        const angle = Math.atan2(direction.y, direction.x);
        line.rotation.z = angle;
        line.position.set(startX + direction.x * length / 2, startY + direction.y * length / 2, 0);

        this.scene.add(line);
        this.materials.push(neonMaterial);

        return { line, neonMaterial };
    }

    // public addMultipleNeonRectangles(): void {
    //     const positions = [
    //         { startX: 0, startY: 0, width: 200, height: 10 },
    //         { startX: 250, startY: 50, width: 150, height: 20 },
    //         { startX: 500, startY: 100, width: 100, height: 15 }
    //     ];
    //
    //     positions.forEach(pos => {
    //         this.addNeonShaderRectangle(pos.startX, pos.startY, pos.width, pos.height);
    //     });
    // }

    // 애니메이션 루프에서 시간 업데이트
    public updateNeonEffect(): void {
        this.materials.forEach(material => {
            material.uniforms.time.value += 0.05;
        });
    }
}
