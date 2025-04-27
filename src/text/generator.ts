import * as THREE from 'three';

export class TextGenerator {
    private mesh: THREE.Mesh | null = null;
    private textContent?: string;
    private fontSize: number;
    private fontFamily: string;
    private textColor: string;

    constructor(
        private fontFace?: FontFace,
        fontSize: number = 60,
        fontFamily: string = 'CustomFont',
        textColor: string = '#191007',
    ) {
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.textColor = textColor;
    }

    public static async loadFont(otfUrl: string): Promise<void> {
        const font = new FontFace('CustomFont', `url(${otfUrl})`);
        await font.load();
        (document.fonts as any).add(font);
        console.log('Custom font loaded successfully.');
    }

    public static createText(
        text: string,
        fontSize: number = 60,
        fontFamily: string = 'CustomFont',
        textColor: string = '#191007',)
        : THREE.CanvasTexture | null {
            if (!text) {
                console.warn('No text content to create a texture.');
                return null;
            }

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                console.error('Failed to get canvas context.');
                return null;
            }

            const devicePixelRatio = window.devicePixelRatio || 1;
            const adjustedFontSize = fontSize * devicePixelRatio;

            context.font = `${fontSize}px ${fontFamily}`;
            const textWidth = context.measureText(text).width;
            console.log(`텍스트 가로는? ${textWidth}`);

            canvas.width = 100 * devicePixelRatio; // To-do: 여기 설정 수정해야 함(좌측 정렬하려고 임시로 설정한 거임)
            canvas.height = adjustedFontSize * 1.5;

            context.font = `${fontSize}px ${fontFamily}`;
            context.fillStyle = textColor;
            context.textBaseline = 'middle';
            context.textAlign = 'left';

            context.scale(devicePixelRatio, devicePixelRatio);
            context.fillText(text, 0, canvas.height / (2 * devicePixelRatio));

//             context.strokeStyle = textColor;
//             context.lineWidth = 0.001; //외곽선 두께
//             context.strokeText(text, 0, canvas.height / (2 * devicePixelRatio));

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            return texture;
    }

}
