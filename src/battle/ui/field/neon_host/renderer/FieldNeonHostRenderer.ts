import * as THREE from "three";
import {AreaRatios, computeAreaBounds} from "../../../../../core/frame/AreaBounds";

// 필드 영역 전체에 겨냥 테두리를 붙일 때 그 테두리가 매달리는 빈 자리다.
//
// 아무것도 안 그린다. 자리와 크기만 든다. 테두리는 매달릴 것의 크기를 붙일 때 읽으므로
// 그 크기가 여기 적혀 있어야 한다.
//
// 필드 영역을 그리는 렌더러를 그대로 못 쓴다. 그쪽은 그룹을 원점에 두고 그 안의 메시를
// 옮겨 놓는데, 테두리는 매달린 그룹의 자리를 본다. 그래서 자리를 든 껍데기가 따로 필요하다.
//
// 창 크기가 바뀌면 여기도 다시 재야 한다. 안 재면 배경만 줄어들고 테두리는 옛 자리에
// 남는다. 그 문제가 여러 번 났다 (R2-87 ~ R2-93).
export class FieldNeonHostRenderer {
    public build(ratios: AreaRatios): THREE.Group {
        const group = new THREE.Group();
        this.place(group, ratios, window.innerWidth, window.innerHeight);
        return group;
    }

    public resize(
        group: THREE.Group, ratios: AreaRatios,
        viewportWidth: number, viewportHeight: number,
    ): void {
        this.place(group, ratios, viewportWidth, viewportHeight);
    }

    private place(
        group: THREE.Group, ratios: AreaRatios,
        viewportWidth: number, viewportHeight: number,
    ): void {
        const bounds = computeAreaBounds(ratios, viewportWidth, viewportHeight);
        group.position.set(bounds.centerX, bounds.centerY, 0);
        // 테두리가 읽는 이름이다. 필드 영역 렌더러는 다른 이름을 쓴다.
        group.userData = {baseCardWidth: bounds.width, baseCardHeight: bounds.height};
    }
}
