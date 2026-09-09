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

export function moveCard(
    cardGroup: THREE.Object3D,
    to: { x: number; y: number; z: number },
    durationMs: number,
    easing: () => unknown = CardMoveEasing.inOut,
): Promise<void> {
    return new Promise((resolve) => {
        const from = {
            x: cardGroup.position.x,
            y: cardGroup.position.y,
            z: cardGroup.position.z,
        };

        new TWEEN.Tween(from)
            .to({ x: to.x, y: to.y, z: to.z }, durationMs)
            .easing(easing())
            .onUpdate(() => {
                cardGroup.position.set(from.x, from.y, from.z);
            })
            .onComplete(() => resolve())
            .start();
    });
}
