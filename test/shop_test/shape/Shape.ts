import * as THREE from 'three';

export abstract class Shape {
    private width: number;
    private height: number;
    private local_translation: THREE.Vector2 = new THREE.Vector2(0, 0);
    private global_translation: THREE.Vector2 = new THREE.Vector2(0, 0);
    private color: THREE.Color;
    private opacity: number;
    private draw_border: boolean;
    private is_visible: boolean;

    constructor(width: number, height: number, local_translation: THREE.Vector2, global_translation: THREE.Vector2, color: THREE.Color, opacity: number, draw_border: boolean, is_visible: boolean) {
        this.width = width;
        this.height = height;
        this.local_translation = local_translation;
        this.global_translation = global_translation;
        this.color = color;
        this.opacity = opacity;
        this.draw_border = draw_border;
        this.is_visible = is_visible;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getLocalTranslation(): THREE.Vector2 {
        return this.local_translation;
    }

    public getGlobalTranslation(): THREE.Vector2 {
        return this.global_translation;
    }

    public getColor(): THREE.Color {
        return this.color;
    }

    public getOpacity(): number {
        return this.opacity;
    }

    public isDrawBorder(): boolean {
        return this.draw_border;
    }

    public isVisible(): boolean {
        return this.is_visible;
    }

    public setVisibility(visible: boolean): void {
        this.is_visible = visible;
    }

    public abstract draw(scene: THREE.Scene): void;
}
