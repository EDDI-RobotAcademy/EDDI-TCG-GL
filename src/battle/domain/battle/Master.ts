// 본체다. 체력이 0 이 되면 그 판을 진다.
//
// 화면에 어떻게 보여줄지는 여기서 정하지 않는다. 숫자만 든다.
export class Master {
    // 양쪽 다 100 에서 시작한다.
    static readonly START_HP = 100;

    private hp: number = Master.START_HP;

    getHp(): number {
        return this.hp;
    }

    // 값을 그대로 놓는다. 0 아래로는 안 내려간다.
    setHp(next: number): number {
        this.hp = Math.max(0, next);
        return this.hp;
    }

    // 피해를 입는다. 이미 쓰러졌으면 아무 일도 안 한다.
    damage(amount: number): number {
        if (amount <= 0 || this.hp <= 0) return this.hp;
        this.hp = Math.max(0, this.hp - amount);
        return this.hp;
    }

    isDefeated(): boolean {
        return this.hp <= 0;
    }

    restoreFrom(hp: number): void {
        this.hp = hp;
    }
}
