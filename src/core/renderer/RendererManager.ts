import * as THREE from 'three';

export class RendererManager {
    private renderer: THREE.WebGLRenderer;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.renderer = this.createRenderer();
        this.container.appendChild(this.renderer.domElement);
    }

    private createRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 1);

        console.log('WebGLRenderer created');
        return renderer;
    }

    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    public getDomElement(): HTMLElement {
        return this.renderer.domElement;
    }

    public resize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        console.log(`Renderer resized to ${width}x${height}`);
    }

    public setClearColor(color: number, alpha: number = 1): void {
        this.renderer.setClearColor(color, alpha);
    }

    public dispose(): void {
        this.renderer.dispose();
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        console.log('Renderer disposed');
    }
}