import * as THREE from "three";
import {installTween} from "../../core/tween/Tween";

declare const TWEEN: {
    Tween: any;
    Easing: any;
    update: (time?: number) => void;
};

// 값 바꾸기를 얹는다. 전에는 화면마다 index.html 이 인터넷에서 받아 왔고,
// 그 줄이 없는 화면에서는 연출 도중에 멈췄다.
installTween();

// 카드를 한 자리에서 다른 자리로 옮긴다. 아무것도 그리지 않는다.
//
// 어디로 갈지, 얼마나 걸릴지, 어떻게 빨라졌다 느려질지는 부르는 쪽이 정한다.
// 연출마다 그 값이 다르고, 바꾸면 눈에 보이는 것이 달라지기 때문이다.
//
// 예전에는 같은 일을 하는 코드가 네 벌이었다. 하나는 TWEEN 을 쓰고, 둘은 각자
// tween 을 만들고, 하나는 매 프레임 직접 계산했다. 걸리는 시간도 700, 800, 1000
// 으로 달랐다. 시간과 곡선을 인자로 받게 해서 그 값들을 그대로 둔 채 한 벌로 모았다.
//
// 이 파일이 바뀌는 이유는 옮기는 방식 자체가 달라질 때뿐이다.
export const CardMoveEasing = {
    // 처음에 빠르고 끝에 느려진다
    out: () => TWEEN.Easing.Quadratic.Out,
    // 처음과 끝이 느리고 가운데가 빠르다
    inOut: () => TWEEN.Easing.Quadratic.InOut,
};

export interface CardMovePoint {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}

// 갈 곳을 값으로 줘도 되고, 물어보는 방법으로 줘도 된다.
//
// 값으로 주면 떠날 때 정해진 자리로 간다. 가는 동안 그 자리가 달라질 일이 없을 때 쓴다.
//
// 물어보는 방법으로 주면 가는 내내 매번 다시 묻는다. 창 크기가 바뀌면 가야 할 자리도
// 달라지는데, 값으로 굳혀 두면 옛 자리로 끝까지 가 버린다. 그럴 수 있는 자리에 쓴다.
export type CardMoveTarget = CardMovePoint | (() => CardMovePoint);

export function moveCard(
    cardGroup: THREE.Object3D,
    to: CardMoveTarget,
    durationMs: number,
    easing: () => unknown = CardMoveEasing.inOut,
): Promise<void> {
    return new Promise((resolve) => {
        const target = typeof to === 'function' ? to : () => to;

        // 떠난 자리. 가는 동안 창 크기가 바뀌면 이 자리도 그만큼 옮겨 준다. 안 그러면
        // 남은 길의 시작점만 옛 화면 기준으로 남아 가는 길이 휜다.
        const start = {
            x: cardGroup.position.x,
            y: cardGroup.position.y,
            z: cardGroup.position.z,
        };
        let seenWidth = window.innerWidth;
        let seenHeight = window.innerHeight;

        // 0 에서 1 로 가는 것 하나만 굴린다. 어디쯤인지는 매번 다시 물어서 잰다.
        const progress = { t: 0 };

        new TWEEN.Tween(progress)
            .to({ t: 1 }, durationMs)
            .easing(easing())
            .onUpdate(() => {
                if (window.innerWidth !== seenWidth || window.innerHeight !== seenHeight) {
                    start.x *= window.innerWidth / seenWidth;
                    start.y *= window.innerHeight / seenHeight;
                    seenWidth = window.innerWidth;
                    seenHeight = window.innerHeight;
                }
                const end = target();
                cardGroup.position.set(
                    start.x + (end.x - start.x) * progress.t,
                    start.y + (end.y - start.y) * progress.t,
                    start.z + (end.z - start.z) * progress.t,
                );
            })
            .onComplete(() => {
                const end = target();
                cardGroup.position.set(end.x, end.y, end.z);
                resolve();
            })
            .start();
    });
}
