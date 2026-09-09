import {Tween, Easing, update} from "@tweenjs/tween.js";

// 연출에 쓰는 값 바꾸기다.
//
// 전에는 화면마다 index.html 이 인터넷에서 받아 와 window 에 얹었다. 그래서
// 그 줄이 있는 화면에서만 연출이 돌고, 없는 화면에서는 [TWEEN 을 찾을 수 없다] 가 났다.
// 인터넷이 없으면 어느 화면에서도 안 돈다.
//
// 이제 꾸러미에서 가져온다. 옛 코드가 window.TWEEN 을 바로 쓰고 있어서 거기에도 얹는다.
export const TweenRuntime = {Tween, Easing, update};

// 옛 코드가 쓰는 자리에 얹는다. 한 번만 하면 된다.
export function installTween(): void {
    const target = window as unknown as {TWEEN?: typeof TweenRuntime};
    if (target.TWEEN) return;
    target.TWEEN = TweenRuntime;
}
