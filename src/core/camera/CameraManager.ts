// src/core/camera/CameraManager.ts
import * as THREE from 'three';

export class CameraManager {
    private static instance: CameraManager | null = null;
    private cameras: Map<string, THREE.Camera> = new Map();
    private activeCameraKey: string | null = null;

    private constructor() {}

    public static getInstance(): CameraManager {
        if (!CameraManager.instance) {
            CameraManager.instance = new CameraManager();
        }
        return CameraManager.instance;
    }

    /**
     * Orthographic 카메라 생성 및 활성화
     */
    public createAndSetActiveCamera(aspectRatio: number, viewSize: number): THREE.OrthographicCamera {
        const camera = this.createOrthographicCamera(aspectRatio, viewSize);
        this.cameras.set('main', camera);
        this.activeCameraKey = 'main';
        return camera;
    }

    /**
     * Orthographic 카메라 생성
     */
    private createOrthographicCamera(aspectRatio: number, viewSize: number): THREE.OrthographicCamera {
        const halfWidth = (viewSize * aspectRatio) / 2;
        const halfHeight = viewSize / 2;

        const camera = new THREE.OrthographicCamera(
            -halfWidth,
            halfWidth,
            halfHeight,
            -halfHeight,
            0.1,
            1000
        );

        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);

        console.log('Orthographic camera created');
        return camera;
    }

    /**
     * Perspective 카메라 생성
     */
    public createPerspectiveCamera(
        key: string,
        fov: number = 75,
        aspect: number = window.innerWidth / window.innerHeight,
        near: number = 0.1,
        far: number = 1000
    ): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 0, 10);
        this.cameras.set(key, camera);

        if (!this.activeCameraKey) {
            this.activeCameraKey = key;
        }

        console.log(`Perspective camera "${key}" created`);
        return camera;
    }

    /**
     * 특정 키로 카메라 가져오기
     */
    public getCamera(key: string): THREE.Camera | null {
        return this.cameras.get(key) || null;
    }

    /**
     * 활성 카메라 가져오기
     */
    public getActiveCamera(): THREE.Camera | null {
        if (!this.activeCameraKey) {
            return null;
        }
        return this.cameras.get(this.activeCameraKey) || null;
    }

    /**
     * 활성 카메라 설정
     */
    public setActiveCamera(key: string): void {
        if (!this.cameras.has(key)) {
            console.warn(`Camera with key "${key}" does not exist`);
            return;
        }
        this.activeCameraKey = key;
        console.log(`Active camera set to "${key}"`);
    }

    /**
     * 카메라 위치 설정
     */
    public setCameraPosition(key: string, x: number, y: number, z: number): void {
        const camera = this.cameras.get(key);
        if (!camera) {
            console.warn(`Camera with key "${key}" does not exist`);
            return;
        }
        camera.position.set(x, y, z);
    }

    /**
     * 카메라 LookAt 설정
     */
    public setCameraLookAt(key: string, x: number, y: number, z: number): void {
        const camera = this.cameras.get(key);
        if (!camera) {
            console.warn(`Camera with key "${key}" does not exist`);
            return;
        }
        camera.lookAt(x, y, z);
    }

    /**
     * 화면 크기 변경 시 카메라 aspect 업데이트
     */
    public updateAspect(width: number, height: number): void {
        const camera = this.getActiveCamera();
        if (!camera) {
            console.warn('No active camera to update');
            return;
        }

        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.OrthographicCamera) {
            const aspectRatio = width / height;
            const viewSize = height;
            const halfWidth = (viewSize * aspectRatio) / 2;
            const halfHeight = viewSize / 2;

            camera.left = -halfWidth;
            camera.right = halfWidth;
            camera.top = halfHeight;
            camera.bottom = -halfHeight;
            camera.updateProjectionMatrix();
        }

        console.log('Camera aspect updated');
    }

    /**
     * 카메라 제거
     */
    public removeCamera(key: string): void {
        this.cameras.delete(key);
        if (this.activeCameraKey === key) {
            this.activeCameraKey = null;
        }
        console.log(`Camera "${key}" removed`);
    }

    /**
     * 모든 카메라 제거
     */
    public clearAll(): void {
        this.cameras.clear();
        this.activeCameraKey = null;
        console.log('All cameras cleared');
    }

    /**
     * 모든 카메라 키 목록 반환
     */
    public getAllCameraKeys(): string[] {
        return Array.from(this.cameras.keys());
    }
}