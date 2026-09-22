export enum CardRace {
    HUMAN = 1,
    UNDEAD = 2,
    TRENT = 3
}

// 사람이 읽는 종족 이름. 로그와 안내에 쓴다.
export const RACE_LABEL: Record<number, string> = {
    [CardRace.HUMAN]: '휴먼',
    [CardRace.UNDEAD]: '언데드',
    [CardRace.TRENT]: '트런트',
};
