import * as THREE from 'three';

export class TextGenerator {
    private fontSize: number = 9;
    private fontFamily: string = `Batang`;
    private textColor: string = '#FFFFFF';

    constructor() {}

    public static async loadFont(fontFamily: string, otfUrl: string): Promise<void> {
        const font = new FontFace(fontFamily, `url(${otfUrl})`);
        await font.load();
        (document.fonts as any).add(font);
        console.log('Custom font loaded successfully.');
    }

    public createCanvas(text: string, fontFamily?: string, textColor?: string, fontSize?: number, width?: number): HTMLCanvasElement | null {
        if (!text) {
            console.warn('No text content to create a texture.');
            return null;
        }

        const usedFontSize = fontSize ?? this.fontSize;
        const usedFontFamily = fontFamily ?? this.fontFamily;
        const usedTextColor = textColor ?? this.textColor;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Failed to get canvas context.');
            return null;
        }

        // 해상도 보정
        const devicePixelRatio = window.devicePixelRatio || 1;
        const adjustedFontSize = usedFontSize * devicePixelRatio;

        context.font = `${usedFontSize}px ${usedFontFamily}`;
        const measuredWidth = context.measureText(text).width;
//         console.log(`텍스트 가로는? ${textWidth}`);

        canvas.width = (width ?? measuredWidth) * devicePixelRatio; // width 옵션 조정
        canvas.height = adjustedFontSize;

        // 텍스트 스타일 설정
        context.font = `${usedFontSize}px ${usedFontFamily}`;
        context.fillStyle = usedTextColor;
        context.textBaseline = 'middle'; // 세로 정렬 기준선
        context.textAlign = 'left'; // 가로 정렬 기준
        context.scale(devicePixelRatio, devicePixelRatio); // 해상도 보정
        context.fillText(text, 0, canvas.height / (2 * devicePixelRatio));

        return canvas;
    }

    public createTextureFromCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        return texture;
    }

}
