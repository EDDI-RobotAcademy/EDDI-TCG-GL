import * as THREE from "three";

import { FrameRenderer } from "../../../../core/renderer/FrameRenderer";
import {
    TurnEndButtonFrame,
    computeTurnEndButtonVertices,
} from "../frame/TurnEndButtonFrame";

// Sentinel flag set on the neon child mesh's userData so updateAnimation() can locate it
// inside the group (and the pilot can skip over it when doing generic traversals).
const NEON_USERDATA_FLAG = '__turnEndNeon';

// Hexagonal click zone + neon outline.
//   - hex fill mesh: invisible by default (opacity 0). Acts as a visible anchor — currently
//     renders nothing, but kept so resize/dispose can mirror the lost-zone panel renderers.
//   - neon border mesh: a separate PlaneGeometry covering the hex bounding box + glow margin,
//     with an SDF shader that computes signed distance to the 6 hex edges per fragment and
//     glows at the edge band. Pulses via u_time (advanced by updateAnimation).
// Click hit-testing lives in the pilot (via isPointInsideTurnEndButton).
export class TurnEndButtonRendererV2 implements FrameRenderer<TurnEndButtonFrame> {
    public async build(frame: TurnEndButtonFrame): Promise<THREE.Group> {
        const fillGeometry = this.buildHexGeometry(frame, window.innerWidth, window.innerHeight);
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: frame.color,
            opacity: frame.opacity,
            transparent: true,
        });
        const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
        fillMesh.renderOrder = frame.renderOrder;
        fillMesh.position.set(0, 0, 0);

        const neonMesh = this.buildNeonMesh(frame, window.innerWidth, window.innerHeight);

        const group = new THREE.Group();
        group.add(fillMesh);
        group.add(neonMesh);
        return group;
    }

    public resize(
        frame: TurnEndButtonFrame,
        group: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        // Children: [0] fill, [1] neon. Rebuild both since the hex's world coords depend on
        // viewport dimensions (x→width, y→height) and so can't scale uniformly.
        const fill = group.children[0] as THREE.Mesh | undefined;
        const neon = group.children[1] as THREE.Mesh | undefined;
        if (fill) {
            fill.geometry?.dispose();
            fill.geometry = this.buildHexGeometry(frame, viewportWidth, viewportHeight);
        }
        if (neon) {
            neon.geometry?.dispose();
            (neon.material as THREE.ShaderMaterial).dispose();
            const replacement = this.buildNeonMesh(frame, viewportWidth, viewportHeight);
            neon.geometry = replacement.geometry;
            neon.material = replacement.material;
            neon.position.copy(replacement.position);
        }
    }

    public dispose(group: THREE.Group): void {
        group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry?.dispose();
                const material = object.material;
                if (Array.isArray(material)) material.forEach((m) => m.dispose());
                else material?.dispose();
            }
        });
        group.clear();
    }

    // Advance the neon pulse. Called once per animation-loop tick by the pilot (alongside
    // NeonBorderEffect.updateAnimation for the per-unit neons).
    public updateAnimation(group: THREE.Group, frame: TurnEndButtonFrame): void {
        const neon = this.findNeonMesh(group);
        if (!neon) return;
        const mat = neon.material as THREE.ShaderMaterial;
        mat.uniforms.u_time.value += frame.neon.timeIncrement;
    }

    // Toggle the hover state — when hover=false, the neon border is fully hidden (u_hover
    // multiplies the shader's output alpha). Cheap to call every mousemove.
    public setHover(group: THREE.Group, hover: boolean): void {
        const neon = this.findNeonMesh(group);
        if (!neon) return;
        const mat = neon.material as THREE.ShaderMaterial;
        mat.uniforms.u_hover.value = hover ? 1.0 : 0.0;
    }

    private findNeonMesh(group: THREE.Group): THREE.Mesh | undefined {
        return group.children.find((c): c is THREE.Mesh =>
            c instanceof THREE.Mesh &&
            (c.userData as { [NEON_USERDATA_FLAG]?: boolean })[NEON_USERDATA_FLAG] === true,
        );
    }

    private buildHexGeometry(
        frame: TurnEndButtonFrame,
        viewportWidth: number,
        viewportHeight: number,
    ): THREE.ShapeGeometry {
        const verts = computeTurnEndButtonVertices(frame, viewportWidth, viewportHeight);
        const shape = new THREE.Shape();
        shape.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) shape.lineTo(verts[i].x, verts[i].y);
        shape.closePath();
        return new THREE.ShapeGeometry(shape);
    }

    // Neon border mesh: a plane sized to the hex bounding box plus glow margin, with a
    // fragment shader that computes signed distance to the 6 hex edges and glows on the
    // edge band. Returns a fully configured mesh positioned at the hex centroid.
    private buildNeonMesh(
        frame: TurnEndButtonFrame,
        viewportWidth: number,
        viewportHeight: number,
    ): THREE.Mesh {
        const verts = computeTurnEndButtonVertices(frame, viewportWidth, viewportHeight);
        let xmin =  Infinity, xmax = -Infinity;
        let ymin =  Infinity, ymax = -Infinity;
        for (const v of verts) {
            if (v.x < xmin) xmin = v.x;
            if (v.x > xmax) xmax = v.x;
            if (v.y < ymin) ymin = v.y;
            if (v.y > ymax) ymax = v.y;
        }
        const margin = frame.neon.marginPx;
        const planeW = (xmax - xmin) + margin * 2;
        const planeH = (ymax - ymin) + margin * 2;
        const centerX = (xmin + xmax) / 2;
        const centerY = (ymin + ymax) / 2;

        // Hex vertices in the neon mesh's LOCAL coords (relative to centerX/Y) flattened to a
        // Float32Array. THREE can accept an Array<Vector2> for a vec2[N] uniform in most
        // cases, but a flat typed-array is the canonical form WebGL actually wants — no room
        // for version-specific quirks to drop the uniform silently.
        const hexFlat = new Float32Array(12);
        for (let i = 0; i < 6; i++) {
            hexFlat[i * 2]     = verts[i].x - centerX;
            hexFlat[i * 2 + 1] = verts[i].y - centerY;
        }

        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_baseColor: { value: new THREE.Color(frame.neon.baseColor) },
                u_glowColor: { value: new THREE.Color(frame.neon.glowColor) },
                u_hexVerts:  { value: hexFlat },      // vec2[6] as flat Float32Array
                u_planeSize: { value: new THREE.Vector2(planeW, planeH) },
                u_thickness: { value: frame.neon.thickness },
                u_time:      { value: 0 },
                u_hover:     { value: 0 },            // 0 = hidden; pilot flips to 1 on hover
            },
            vertexShader: `
                varying vec2 v_uv;
                void main() {
                    v_uv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            // SDF to the convex hex: for each edge, signed distance using the outward-pointing
            // normal. Our vertex list is CLOCKWISE in world y-up (left-mid → top-left → ... →
            // bottom-left), so the outward normal is the edge rotated +90° = (-e.y, e.x).
            // Polygon SDF = max of per-edge signed distances (convex-polygon identity):
            //   sdf > 0 = fragment outside hex; sdf < 0 = inside.
            // Glow lives in a narrow band around |sdf| = 0 so the outline glows both sides.
            fragmentShader: `
                uniform vec3 u_baseColor;
                uniform vec3 u_glowColor;
                uniform vec2 u_hexVerts[6];
                uniform vec2 u_planeSize;
                uniform float u_thickness;
                uniform float u_time;
                uniform float u_hover;
                varying vec2 v_uv;

                float edgeSDF(vec2 p, vec2 v1, vec2 v2) {
                    vec2 e = v2 - v1;
                    vec2 n = normalize(vec2(-e.y, e.x));  // outward normal (CW polygon, y-up)
                    return dot(p - v1, n);
                }

                void main() {
                    // Fragment position in local mesh coords: v_uv (0..1) → (-size/2..+size/2).
                    vec2 p = (v_uv - 0.5) * u_planeSize;

                    float sdf = -1e9;
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[0], u_hexVerts[1]));
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[1], u_hexVerts[2]));
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[2], u_hexVerts[3]));
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[3], u_hexVerts[4]));
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[4], u_hexVerts[5]));
                    sdf = max(sdf, edgeSDF(p, u_hexVerts[5], u_hexVerts[0]));

                    float edgeDist = abs(sdf);

                    // NO PULSE — frozen at the PEAK spread of Field Energy's neon. THIN rim,
                    // WIDE spread: the base thickness controls only the crisp rim, while the
                    // outer halo layers use big multipliers (5x, 12x, 20x) so light diffuses
                    // far WITHOUT thickening the rim itself. Weights are tuned so only the
                    // very edge saturates — just outside the rim the opacity drops quickly,
                    // then fades smoothly over ~40 px.
                    float L1 = 1.0 - smoothstep(0.0, u_thickness *  1.0, edgeDist);   // crisp rim
                    float L2 = 1.0 - smoothstep(0.0, u_thickness *  5.0, edgeDist);   // close bloom
                    float L3 = 1.0 - smoothstep(0.0, u_thickness * 12.0, edgeDist);   // mid bloom
                    float L4 = 1.0 - smoothstep(0.0, u_thickness * 20.0, edgeDist);   // wide soft halo
                    float glow = L1 * 1.0 + L2 * 0.35 + L3 * 0.25 + L4 * 0.18;
                    glow = clamp(glow, 0.0, 1.0);

                    // brightness(1.3) equivalent — multiply the glow colour by 1.3 so the rim
                    // reads as "lit", not just "tinted". Clamped by alpha blending against
                    // the background, so values > 1 just saturate toward white on blend.
                    vec3 finalColor = u_glowColor * 1.3;

                    // u_hover gates the whole output so the border is only visible on hover.
                    float alpha = glow * 0.95 * u_hover;
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.NormalBlending,
        });

        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(centerX, centerY, frame.neon.zOffset);
        mesh.renderOrder = frame.neon.renderOrder;
        mesh.userData[NEON_USERDATA_FLAG] = true;
        return mesh;
    }
}
