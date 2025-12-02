import * as THREE from 'three';

export class SceneManager {
    private scenes: Map<string, THREE.Scene> = new Map();
    private activeSceneKey: string | null = null;

    public createScene(key: string): THREE.Scene {
        if (this.scenes.has(key)) {
            console.warn(`Scene with key "${key}" already exists`);
            return this.scenes.get(key)!;
        }

        const scene = new THREE.Scene();
        this.scenes.set(key, scene);

        if (!this.activeSceneKey) {
            this.activeSceneKey = key;
        }

        console.log(`Scene "${key}" created`);
        return scene;
    }

    public getScene(key: string): THREE.Scene | null {
        return this.scenes.get(key) || null;
    }

    public getActiveScene(): THREE.Scene | null {
        if (!this.activeSceneKey) {
            return null;
        }
        return this.scenes.get(this.activeSceneKey) || null;
    }

    public setActiveScene(key: string): void {
        if (!this.scenes.has(key)) {
            console.warn(`Scene with key "${key}" does not exist`);
            return;
        }
        this.activeSceneKey = key;
        console.log(`Active scene set to "${key}"`);
    }

    public removeScene(key: string): void {
        const scene = this.scenes.get(key);
        if (!scene) {
            console.warn(`Scene with key "${key}" does not exist`);
            return;
        }

        // Scene 정리
        this.disposeScene(scene);
        this.scenes.delete(key);

        if (this.activeSceneKey === key) {
            this.activeSceneKey = null;
        }

        console.log(`Scene "${key}" removed`);
    }

    private disposeScene(scene: THREE.Scene): void {
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
    }

    public clearAll(): void {
        this.scenes.forEach((scene, key) => {
            this.disposeScene(scene);
        });
        this.scenes.clear();
        this.activeSceneKey = null;
        console.log('All scenes cleared');
    }

    public getAllSceneKeys(): string[] {
        return Array.from(this.scenes.keys());
    }
}