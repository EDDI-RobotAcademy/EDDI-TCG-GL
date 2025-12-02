import * as THREE from 'three';

import {CameraRepositoryImpl} from "../repository/CameraRepositoryImpl";

import {CameraService} from "./CameraService";
import {Camera} from "../entity/Camera";
import {CameraRepository} from "../repository/CameraRepository";
import {WindowSceneRepository} from "../../window_scene/repository/WindowSceneRepository";


export class CameraServiceImpl implements CameraService {
    private static instance: CameraServiceImpl | null = null;
    private readonly cameraRepository: CameraRepository = CameraRepositoryImpl.getInstance();

    private constructor(cameraRepository: CameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    public static getInstance(): CameraServiceImpl {
        if (!CameraServiceImpl.instance) {
            const cameraRepository = CameraRepositoryImpl.getInstance();
            CameraServiceImpl.instance = new CameraServiceImpl(cameraRepository);
        }
        return CameraServiceImpl.instance;
    }

    public createCamera(aspectRatio: number, viewSize: number): Camera {
        const camera = new THREE.OrthographicCamera(
            -aspectRatio * viewSize / 2,
            aspectRatio * viewSize / 2,
            viewSize / 2,
            -viewSize / 2,
            0.1,
            1000
        );

        const cameraEntity = new Camera(aspectRatio, viewSize, camera);
        this.cameraRepository.save(cameraEntity);

        return cameraEntity
    }

    public getOrthographicCameraById(id: number): THREE.OrthographicCamera | null {
        const camera = this.cameraRepository.findById(id);
        return camera?.getCamera() || null;
    }

    deleteAllCameras(): void {
    }

    getAllCameras(): Camera[] {
        return [];
    }


    public deleteCameraById(id: number): void {
        this.cameraRepository.deleteById(id);
    }

    public setCameraPosition(id: number, x: number, y: number, z: number): void {
        const camera = this.cameraRepository.findById(id);
        if (camera) {
            this.cameraRepository.setCameraPosition(camera, x, y, z);
        } else {
            console.error(`Camera with id ${id} not found.`);
        }
    }

    public setCameraLookAt(id: number, x: number, y: number, z: number): void {
        const camera = this.cameraRepository.findById(id);
        if (camera) {
            this.cameraRepository.setCameraLookAt(camera, x, y, z);
        } else {
            console.error(`Camera with id ${id} not found.`);
        }
    }

    public updateCamera(id: number, aspectRatio: number, viewSize: number): void {
        const camera = this.cameraRepository.findById(id);
        if (camera) {
            this.cameraRepository.updateCamera(camera, aspectRatio, viewSize);
        } else {
            console.error(`Camera with id ${id} not found.`);
        }
    }
}
