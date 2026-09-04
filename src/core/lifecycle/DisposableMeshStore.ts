import * as THREE from "three";

// 화면 메시를 담아 두는 곳이 지키는 약속.
//
// 지금 저장소들은 비울 때 Map 에서 빼기만 한다. 그러면 그래픽 카드에 올라간 것이
// 그대로 남는다. 자바스크립트 객체는 참조가 끊기면 알아서 치워지지만, 그래픽 카드에
// 올린 것은 놓아 달라고 말해야 놓아준다.
//
// 언제 놓아주나
//   카드가 화면에서 빠질 때        필드에 있던 카드가 무덤이나 로스트존으로 간다
//   화면 크기가 바뀔 때            크기에 맞춰 다시 만들면서 옛것을 놓아준다
//   전투가 끝날 때                 전부 새로 만든다
//
// 무엇을 놓아주나
//   geometry, material            이 메시만 쓰는 것이라 놓아준다
//
// 무엇을 두고 가나
//   material.map (카드 그림)      TextureManager 가 한 장을 여러 카드에 나눠 준다.
//                                 19번 카드가 필드에 둘 있으면 그림 하나를 둘이 쓴다.
//                                 한 장이 무덤에 갈 때 놓아주면 남은 한 장이 깨진다.
//                                 개수도 정해져 있어 전투를 여러 번 해도 늘지 않는다.
//   전투 중에 만들어 쓴 글자 그림    이건 실제로 쌓인다. 만든 쪽이 책임진다. R2-53 에서 본다
export interface DisposableMeshStore {
    // 담고 있는 메시를 화면에서 빼고 그래픽 카드 자원을 놓아준 뒤 비운다.
    dispose(): void;
}

// 메시 하나를 화면에서 빼고 놓아준다.
//
// scene 을 받지 않는다. 카드 메시는 scene 에 바로 붙지 않고 Group 안에 들어가는데,
// THREE 의 remove 는 직계 자식만 빼기 때문에 scene.remove(메시) 는 조용히 아무 일도
// 하지 않는다. 오류도 나지 않아 알아채기 어렵다. 실제 부모에게 빼 달라고 해야 한다.
export function disposeMesh(mesh: THREE.Mesh): void {
    mesh.parent?.remove(mesh);

    mesh.geometry?.dispose();

    const material = mesh.material;
    if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
    } else {
        material?.dispose();
    }
}
