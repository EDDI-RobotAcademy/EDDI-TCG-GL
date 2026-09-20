import * as THREE from "three";

// 연출 하나가 그리는 것을 담는 겹이다.
//
// 연출은 시작할 때 창 크기를 재서 그림의 크기와 자리를 정하고, 도는 동안 다시 재지 않는다.
// 도중에 창이 바뀌면 연출만 옛 크기로 남는다.
//
// 그림 만드는 자리마다 고칠 수는 없다. 그림들이 저마다 제 박자로 움직여서, 밖에서 자리를
// 고쳐도 다음 박자에 덮인다. 그래서 그리는 것을 겹에 담고 **겹을** 창 크기에 맞춰 늘린다.
// 겹을 늘리면 담긴 것의 자리도 함께 멀어지므로, 그림은 저마다 하던 대로 움직이면 된다.
//
// 겹이 여럿이다. **만들어진 창 크기가 같은 것끼리 한 겹에 담는다.**
//
// 전에는 겹이 하나였고 기준 크기도 하나였다. 그 기준은 겹이 완전히 빌 때만 새로 적혔다.
// 그래서 두 가지가 어긋났다.
//   · 그림을 다 지우지 않는 연출은 두 번째 쓸 때부터 지난번 기준이 남았다
//   · 한 번 도는 중에 창이 바뀌면, 그 뒤에 더해진 그림은 새 크기로 만들어졌는데
//     옛 기준으로 늘려졌다
//
// 자리가 맞는 이유는 연출의 자리가 전부 [화면 가운데에서 창 크기의 몇 분의 얼마] 로
// 잡혀 있기 때문이다. 창이 커지면 그 자리도 같은 비율로 멀어진다.
//
// 크기는 자리만큼 정확하지 않다. 가로에서 크기를 가져간 그림도 세로가 늘어난 만큼 함께
// 늘어나므로, 창의 가로세로 비율이 크게 달라지면 동그란 것이 조금 납작해진다. 연출이
// 끝나면 사라지는 것이라 여기까지로 둔다.

// 화면 전체를 덮는 그림 하나. 비율로 늘리면 안 되고 새 창 크기로 다시 맞춰야 한다.
interface FullscreenPiece {
    readonly object: THREE.Object3D;
    readonly refit: (viewportWidth: number, viewportHeight: number) => void;
}

// 같은 창 크기에서 만들어진 것들을 담는 겹 하나.
interface SizedGroup {
    readonly group: THREE.Group;
    readonly builtWidth: number;
    readonly builtHeight: number;
}

export class EffectLayer {
    // 만들어진 창 크기별로 겹 하나. 열쇠는 [가로x세로] 다.
    private readonly groups = new Map<string, SizedGroup>();
    private readonly fullscreen: FullscreenPiece[] = [];

    // 그림 하나를 겹에 담는다. 화면에 직접 붙이는 자리를 이것으로 바꾼다.
    //
    // 없앨 때는 화면에서 빼면 안 되고 붙어 있는 곳에서 빼야 한다 (removeFromParent).
    public add(scene: THREE.Scene, object: THREE.Object3D): void {
        this.groupForNow(scene).add(object);
    }

    // 화면 전체를 덮는 그림을 담는다.
    //
    // 이것은 비율로 늘리면 어긋난다. 셰이더 안에 창 크기가 숫자로 들어가 있어서, 그 안에서
    // 옛 크기로 계산한 무늬를 겹이 또 늘리면 두 번 늘어난 것이 된다. 칼자국처럼 날이
    // 선 그림에서 눈에 띈다.
    //
    // 그래서 겹이 늘어난 만큼 거꾸로 줄여 제 크기를 지키게 하고, 새 창 크기는 refit 으로
    // 알려 준다. 판을 다시 만들고 셰이더 값을 고치는 일은 그리는 쪽이 한다.
    public addFullscreen(
        scene: THREE.Scene, object: THREE.Object3D,
        refit: (viewportWidth: number, viewportHeight: number) => void,
    ): void {
        this.add(scene, object);
        this.fullscreen.push({object, refit});
        this.counterScale(object);
    }

    // 창 크기가 바뀌었을 때.
    public resize(viewportWidth: number, viewportHeight: number): void {
        for (const [key, sized] of [...this.groups]) {
            // 비어 있으면 잊는다. 연출이 끝나며 제 그림을 떼어 간다.
            if (sized.group.children.length === 0) {
                sized.group.removeFromParent();
                this.groups.delete(key);
                continue;
            }
            sized.group.scale.set(
                viewportWidth / sized.builtWidth,
                viewportHeight / sized.builtHeight,
                1,
            );
        }

        // 화면 전체를 덮는 것은 겹의 늘림을 되돌리고 새 창 크기로 다시 맞춘다.
        for (let i = this.fullscreen.length - 1; i >= 0; i--) {
            const piece = this.fullscreen[i];
            if (!piece.object.parent) {
                this.fullscreen.splice(i, 1);
                continue;
            }
            this.counterScale(piece.object);
            piece.refit(viewportWidth, viewportHeight);
        }
    }

    // 지금 창 크기에 맞는 겹을 준다. 없으면 만든다.
    private groupForNow(scene: THREE.Scene): THREE.Group {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const key = `${width}x${height}`;

        const held = this.groups.get(key);
        if (held) {
            if (held.group.parent !== scene) {
                held.group.removeFromParent();
                scene.add(held.group);
            }
            return held.group;
        }

        const group = new THREE.Group();
        scene.add(group);
        this.groups.set(key, {group, builtWidth: width, builtHeight: height});
        return group;
    }

    private counterScale(object: THREE.Object3D): void {
        const parent = object.parent;
        const s = parent ? parent.scale : null;
        object.scale.set(
            !s || s.x === 0 ? 1 : 1 / s.x,
            !s || s.y === 0 ? 1 : 1 / s.y,
            1,
        );
    }
}
