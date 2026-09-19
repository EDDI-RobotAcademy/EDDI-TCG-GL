import * as THREE from "three";

// 연출 하나가 그리는 것을 담는 겹이다.
//
// 연출은 시작할 때 창 크기를 재서 그림의 크기와 자리를 정하고, 도는 동안 다시 재지 않는다.
// 도중에 창이 바뀌면 연출만 옛 크기로 남는다.
//
// 그림 만드는 자리마다 고칠 수는 없다. 그림들이 저마다 제 박자로 움직여서, 밖에서 자리를
// 고쳐도 다음 박자에 덮이기 때문이다. 그래서 그리는 것을 전부 이 겹에 담고, 겹 하나를
// 창 크기에 맞춰 늘리거나 줄인다. 그림은 저마다 하던 대로 움직인다.
//
// 자리가 맞는 이유는 연출의 자리가 전부 [화면 가운데에서 창 크기의 몇 분의 얼마] 로
// 잡혀 있기 때문이다. 창이 커지면 그 자리도 같은 비율로 멀어지므로, 겹을 늘어난 만큼
// 늘리면 담긴 그림이 새로 그렸을 때와 같은 자리에 온다.
//
// 크기는 자리만큼 정확하지 않다. 가로에서 크기를 가져간 그림도 세로가 늘어난 만큼 함께
// 늘어나므로, 창의 가로세로 비율이 크게 달라지면 동그란 것이 조금 납작해진다. 연출이
// 끝나면 사라지는 것이라 여기까지로 둔다.
// 화면 전체를 덮는 그림 하나. 비율로 늘리면 안 되고 새 창 크기로 다시 맞춰야 한다.
interface FullscreenPiece {
    readonly object: THREE.Object3D;
    // 새 창 크기로 제 판과 제 셰이더 값을 다시 맞춘다. 그리는 쪽이 어떻게 하는지 안다.
    readonly refit: (viewportWidth: number, viewportHeight: number) => void;
}

export class EffectLayer {
    private readonly group = new THREE.Group();
    private builtWidth = 0;
    private builtHeight = 0;
    private readonly fullscreen: FullscreenPiece[] = [];

    // 그림 하나를 겹에 담는다. 화면에 직접 붙이는 자리를 이것으로 바꾼다.
    //
    // 겹이 비어 있으면 이때 연다. 연출마다 그리기 시작하는 길이 하나가 아니라서, 여는
    // 자리를 따로 정해 두면 다른 길로 들어왔을 때 겹이 없다. 담을 때 여는 것이 안전하다.
    //
    // 여는 순간의 창 크기를 적어 둔다. 이것이 [무슨 크기로 그렸는가] 이고, 나중에 지금
    // 창 크기와 견주어 얼마나 늘릴지 정한다.
    //
    // 없앨 때는 화면에서 빼면 안 되고 붙어 있는 곳에서 빼야 한다 (removeFromParent).
    public add(scene: THREE.Scene, object: THREE.Object3D): void {
        if (this.group.children.length === 0) {
            if (this.group.parent !== scene) {
                this.group.removeFromParent();
                scene.add(this.group);
            }
            this.builtWidth = window.innerWidth;
            this.builtHeight = window.innerHeight;
            this.group.scale.set(1, 1, 1);
        }
        this.group.add(object);
    }

    // 화면 전체를 덮는 그림을 담는다.
    //
    // 이것은 겹째 늘리면 어긋난다. 셰이더 안에 창 크기가 숫자로 들어가 있어서, 그 안에서
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
        // 지금 겹이 이미 늘어나 있으면 그만큼 거꾸로 줄여 둔다.
        this.counterScale(object);
    }

    // 창 크기가 바뀌었을 때. 담긴 것이 없으면 할 일이 없다.
    public resize(viewportWidth: number, viewportHeight: number): void {
        if (this.group.children.length === 0) return;
        if (this.builtWidth <= 0 || this.builtHeight <= 0) return;
        this.group.scale.set(
            viewportWidth / this.builtWidth,
            viewportHeight / this.builtHeight,
            1,
        );

        // 화면 전체를 덮는 것은 겹의 늘림을 되돌리고 새 창 크기로 다시 맞춘다.
        for (const piece of this.fullscreen) {
            if (!piece.object.parent) continue;
            this.counterScale(piece.object);
            piece.refit(viewportWidth, viewportHeight);
        }
    }

    private counterScale(object: THREE.Object3D): void {
        const s = this.group.scale;
        object.scale.set(
            s.x === 0 ? 1 : 1 / s.x,
            s.y === 0 ? 1 : 1 / s.y,
            1,
        );
    }
}
