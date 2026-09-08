// 씨앗 하나로 같은 순서를 다시 만들어 내는 난수다.
//
// 도메인 안에서는 Math.random 을 못 쓴다. 쓰면 같은 입력에 다른 결과가 나와서,
// 재접속했을 때 서버와 화면이 다른 덱 순서를 갖게 된다.
// 대신 밖에서 씨앗을 받는다. 씨앗을 적어 두면 그 순서를 그대로 다시 만든다.
//
// mulberry32. 카드 순서를 섞기에 충분하고 짧다.
export class SeededRandom {
    private state: number;

    constructor(seed: number) {
        this.state = seed >>> 0;
    }

    // 0 이상 1 미만
    next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // 0 이상 max 미만의 정수
    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }
}
