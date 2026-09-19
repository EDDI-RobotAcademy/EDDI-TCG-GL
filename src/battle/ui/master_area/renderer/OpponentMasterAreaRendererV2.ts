import * as THREE from "three";
import {disposeGroup} from "../../../../core/lifecycle/DisposableMeshStore";
import {FrameRenderer} from "../../../../core/renderer/FrameRenderer";
import {
    OpponentMasterAreaFrame,
    computeOpponentMasterArea,
} from "../frame/OpponentMasterAreaFrame";

// 상대 본체 타격 영역을 그린다.
//
// 투명하다. 눌리는 것과 겨냥 테두리가 붙는 것이 이 판의 일이고, 보이는 것은 배경 그림이다.
export class OpponentMasterAreaRendererV2 implements FrameRenderer<OpponentMasterAreaFrame> {
    public async build(frame: OpponentMasterAreaFrame): Promise<THREE.Group> {
        const bounds = computeOpponentMasterArea(frame, window.innerWidth, window.innerHeight);

        const material = new THREE.MeshBasicMaterial({
            color: 0x000000, opacity: 0, transparent: true,
        });
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(bounds.width, bounds.height), material,
        );
        mesh.renderOrder = frame.renderOrder;

        const group = new THREE.Group();
        group.position.set(bounds.centerX, bounds.centerY, 0);
        group.add(mesh);
        // 겨냥 테두리가 붙을 때 이 크기를 읽는다. 창 크기가 바뀌면 여기도 갱신해야 한다.
        group.userData = {baseCardWidth: bounds.width, baseCardHeight: bounds.height};
        return group;
    }

    public resize(
        frame: OpponentMasterAreaFrame, group: THREE.Group,
        viewportWidth: number, viewportHeight: number,
    ): void {
        const mesh = group.children[0] as THREE.Mesh | undefined;
        if (!mesh) return;

        const bounds = computeOpponentMasterArea(frame, viewportWidth, viewportHeight);
        // 가로세로 비율이 화면에 따라 달라지므로 통째로 늘리면 안 맞는다. 다시 만든다.
        mesh.geometry?.dispose();
        mesh.geometry = new THREE.PlaneGeometry(bounds.width, bounds.height);
        group.position.set(bounds.centerX, bounds.centerY, 0);
        group.userData = {baseCardWidth: bounds.width, baseCardHeight: bounds.height};
    }

    public dispose(group: THREE.Group): void {
        disposeGroup(group);
    }
}
