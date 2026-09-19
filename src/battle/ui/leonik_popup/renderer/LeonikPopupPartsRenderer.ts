import * as THREE from "three";
import {NeonBorderFrame} from "../../../../neon_border/frame/NeonBorderFrame";

// 레오닉의 부름 고르기 창에만 붙는 두 가지를 만든다.
//
// 고른 카드를 둘러싸는 테두리와, 다 고르면 밝아지는 확인 단추.
//
// 다른 창과 안 나눈다. 고르기 창이 더 생기면 그때 같은 것인지 본다. 지금 합치면
// 확인 단추의 글자와 테두리 색이 창마다 다를 때 갈라야 한다.
export class LeonikPopupPartsRenderer {
    // 확인 단추 그림. 한 번 구워 두고 다시 쓴다.
    private confirmTexture: THREE.CanvasTexture | null = null;

    // 고른 카드를 둘러싸는 테두리.
    //
    // 테두리는 카드 크기를 붙일 때 읽는다. 카드 크기가 바뀌면 다시 붙여야 한다.
    public buildBorder(
        palette: NeonBorderFrame, thickness: number,
        cardWidth: number, cardHeight: number,
        x: number, y: number, renderOrder: number,
    ): {mesh: THREE.Mesh; material: THREE.ShaderMaterial} {
        const planeWidth = cardWidth + thickness * 2;
        const planeHeight = cardHeight + thickness * 2;

        const material = this.buildBorderMaterial(palette, thickness, planeWidth, planeHeight);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeHeight), material,
        );
        mesh.position.set(x, y, palette.zOffset);
        mesh.renderOrder = renderOrder;
        return {mesh, material};
    }

    // 다 고르면 밝아지는 확인 단추.
    public buildConfirmButton(
        width: number, height: number, x: number, y: number,
        renderOrder: number, active: boolean,
    ): {mesh: THREE.Mesh; material: THREE.MeshBasicMaterial} {
        const material = new THREE.MeshBasicMaterial({
            map: this.confirmTexture ?? (this.confirmTexture = this.buildConfirmTexture()),
            transparent: true,
        });
        material.opacity = active ? 1.0 : 0.45;

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
        mesh.position.set(x, y, 0);
        mesh.renderOrder = renderOrder;
        mesh.userData.buttonType = 'confirm';
        return {mesh, material};
    }

    // 테두리 가장자리만 빛나게 하고 초에 한 번쯤 밝기가 오르내린다.
    private buildBorderMaterial(
        palette: NeonBorderFrame, thickness: number,
        planeWidth: number, planeHeight: number,
    ): THREE.ShaderMaterial {
        // 테두리가 안쪽으로 얼마나 번지는지. 화면 크기와 무관한 비율로 넣는다.
        const borderX = (thickness / 2) / planeWidth;
        const borderY = (thickness / 2) / planeHeight;
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                baseColor: {value: new THREE.Color(palette.baseColor)},
                glowColor: {value: new THREE.Color(palette.glowColor)},
                time:      {value: 0.0},
                borderX:   {value: borderX},
                borderY:   {value: borderY},
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
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
            `,
        });
    }

    // 둥근 모서리 판에 [확인] 을 적어 굽는다.
    private buildConfirmTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;

        const radius = 24;
        ctx.fillStyle = '#2d1f08';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffd868';
        ctx.font = 'bold 60px "Inter", "Roboto", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('확인', canvas.width / 2, canvas.height / 2 + 2);

        // 카드 그림과 같은 설정으로 둔다. 이 설정이 달라지면 글자가 흐려진다.
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }
}
