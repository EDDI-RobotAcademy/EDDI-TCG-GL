import * as THREE from "three";

// Thin raycaster-based input bridge for E+F+R pilots. Walks up from a raycaster hit to find
// the nearest ancestor Group with `userData.entityId` set by the Renderer. Reports entity IDs
// (not mesh uuids) to the scenario callbacks, so domain state stays separated from Three.js.
//
// Intentionally independent of the legacy LeftClickDetectServiceImpl / DragMoveServiceImpl /
// MouseDropServiceImpl — see project_legacy_input_services memory.

export interface HandInteractionCallbacks {
    onPickup?: (entityId: number, group: THREE.Group) => void;
    onDrag?: (entityId: number, group: THREE.Group, worldX: number, worldY: number) => void;
    onDrop?: (entityId: number, group: THREE.Group, worldX: number, worldY: number) => void;
}

export class HandInteractionBridge {
    private readonly raycaster = new THREE.Raycaster();
    private readonly dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    private activeEntityId: number | null = null;
    private activeGroup: THREE.Group | null = null;
    private readonly pickupOffset = new THREE.Vector2(0, 0);
    private attached = false;

    constructor(
        private readonly domElement: HTMLElement,
        private readonly camera: THREE.Camera,
        private readonly scene: THREE.Scene,
        private readonly callbacks: HandInteractionCallbacks,
    ) {}

    public attach(): void {
        if (this.attached) return;
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.attached = true;
    }

    public detach(): void {
        if (!this.attached) return;
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.attached = false;
    }

    private onMouseDown = (event: MouseEvent): void => {
        if (event.button !== 0) return;

        const world = this.screenToWorld(event.clientX, event.clientY);
        if (!world) return;

        const pick = this.pickEntityGroup(event.clientX, event.clientY);
        if (!pick) return;

        this.activeEntityId = pick.entityId;
        this.activeGroup = pick.group;
        this.pickupOffset.set(
            world.x - pick.group.position.x,
            world.y - pick.group.position.y,
        );

        this.callbacks.onPickup?.(pick.entityId, pick.group);
    };

    private onMouseMove = (event: MouseEvent): void => {
        if (this.activeEntityId === null || !this.activeGroup) return;
        const world = this.screenToWorld(event.clientX, event.clientY);
        if (!world) return;

        const nextX = world.x - this.pickupOffset.x;
        const nextY = world.y - this.pickupOffset.y;
        this.activeGroup.position.set(nextX, nextY, this.activeGroup.position.z);

        this.callbacks.onDrag?.(this.activeEntityId, this.activeGroup, nextX, nextY);
    };

    private onMouseUp = (event: MouseEvent): void => {
        if (this.activeEntityId === null || !this.activeGroup) return;

        const world = this.screenToWorld(event.clientX, event.clientY);
        if (world) {
            this.callbacks.onDrop?.(this.activeEntityId, this.activeGroup, world.x, world.y);
        }

        this.activeEntityId = null;
        this.activeGroup = null;
    };

    private pickEntityGroup(clientX: number, clientY: number): { entityId: number; group: THREE.Group } | null {
        const ndc = this.clientToNdc(clientX, clientY);
        this.raycaster.setFromCamera(ndc, this.camera);

        const hits = this.raycaster.intersectObjects(this.scene.children, true);
        for (const hit of hits) {
            const entityGroup = findAncestorEntityGroup(hit.object);
            if (entityGroup) return entityGroup;
        }
        return null;
    }

    private screenToWorld(clientX: number, clientY: number): THREE.Vector3 | null {
        const ndc = this.clientToNdc(clientX, clientY);
        this.raycaster.setFromCamera(ndc, this.camera);
        const out = new THREE.Vector3();
        return this.raycaster.ray.intersectPlane(this.dragPlane, out) ? out : null;
    }

    private clientToNdc(clientX: number, clientY: number): THREE.Vector2 {
        return new THREE.Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1,
        );
    }
}

function findAncestorEntityGroup(object: THREE.Object3D): { entityId: number; group: THREE.Group } | null {
    let current: THREE.Object3D | null = object;
    while (current) {
        const entityId = (current.userData as { entityId?: unknown } | undefined)?.entityId;
        if (typeof entityId === 'number' && current instanceof THREE.Group) {
            return { entityId, group: current };
        }
        current = current.parent;
    }
    return null;
}
