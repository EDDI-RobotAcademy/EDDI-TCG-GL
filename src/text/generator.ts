import * as THREE from 'three';

export class TextGenerator {
    private fontSize: number = 9;
    private fontFamily: string = 'CustomFont';
    private textColor: string = '#FFFFFF';

    constructor() {}

    public static async loadFont(otfUrl: string): Promise<void> {
        const font = new FontFace('CustomFont', `url(${otfUrl})`);
        await font.load();
        (document.fonts as any).add(font);
        console.log('Custom font loaded successfully.');
    }

    public createText(text: string, fontSize?: number, fontFamily?: string, textColor?: string,): THREE.CanvasTexture | null {
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
        const textWidth = context.measureText(text).width;
        console.log(`텍스트 가로는? ${textWidth}`);

//         canvas.width = textWidth * devicePixelRatio;
        canvas.width = 150 * devicePixelRatio;
        canvas.height = adjustedFontSize;

        // 텍스트 스타일 설정
        context.font = `${usedFontSize}px ${usedFontFamily}`;
        context.fillStyle = usedTextColor;
        context.textBaseline = 'middle';
        context.textAlign = 'left';
        context.scale(devicePixelRatio, devicePixelRatio);
        context.fillText(text, 0, canvas.height / (2 * devicePixelRatio));

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        return texture;
    }

}
