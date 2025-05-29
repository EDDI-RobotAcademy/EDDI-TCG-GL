import {MyCardScreenCardMapRepository} from "./MyCardScreenCardMapRepository";

export class MyCardScreenCardMapRepositoryImpl implements MyCardScreenCardMapRepository {
    private static instance: MyCardScreenCardMapRepositoryImpl;

    // key: cardId, value: cardCount
    private currentMyCardScreenCardMap: Map<number, number> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.currentMyCardScreenCardMap.set(2, 9);
        this.currentMyCardScreenCardMap.set(5, 11);
        this.currentMyCardScreenCardMap.set(6, 15);
        this.currentMyCardScreenCardMap.set(7, 3);
        this.currentMyCardScreenCardMap.set(8, 3);
        this.currentMyCardScreenCardMap.set(9, 7);
        this.currentMyCardScreenCardMap.set(10, 2);
        this.currentMyCardScreenCardMap.set(11, 1);
        this.currentMyCardScreenCardMap.set(13, 9);
        this.currentMyCardScreenCardMap.set(14, 2);
        this.currentMyCardScreenCardMap.set(15, 2);
        this.currentMyCardScreenCardMap.set(16, 1);
        this.currentMyCardScreenCardMap.set(17, 5);
        this.currentMyCardScreenCardMap.set(18, 3);
        this.currentMyCardScreenCardMap.set(19, 2);
        this.currentMyCardScreenCardMap.set(20, 7);
        this.currentMyCardScreenCardMap.set(22, 1);
        this.currentMyCardScreenCardMap.set(23, 1);
        this.currentMyCardScreenCardMap.set(24, 1);
        this.currentMyCardScreenCardMap.set(25, 8);
        this.currentMyCardScreenCardMap.set(26, 1);
        this.currentMyCardScreenCardMap.set(27, 2);
        this.currentMyCardScreenCardMap.set(28, 3);
        this.currentMyCardScreenCardMap.set(29, 5);
        this.currentMyCardScreenCardMap.set(30, 10);
        this.currentMyCardScreenCardMap.set(31, 6);
        this.currentMyCardScreenCardMap.set(32, 6);
        this.currentMyCardScreenCardMap.set(33, 3);
        this.currentMyCardScreenCardMap.set(34, 10);
        this.currentMyCardScreenCardMap.set(35, 10);
        this.currentMyCardScreenCardMap.set(37, 6);
        this.currentMyCardScreenCardMap.set(42, 2);
        this.currentMyCardScreenCardMap.set(43, 2);
        this.currentMyCardScreenCardMap.set(47, 2);
        this.currentMyCardScreenCardMap.set(48, 1);
        this.currentMyCardScreenCardMap.set(49, 3);
        this.currentMyCardScreenCardMap.set(50, 1);
        this.currentMyCardScreenCardMap.set(51, 5);
        this.currentMyCardScreenCardMap.set(52, 1);
        this.currentMyCardScreenCardMap.set(53, 2);
        this.currentMyCardScreenCardMap.set(54, 1);
        this.currentMyCardScreenCardMap.set(55, 1);
        this.currentMyCardScreenCardMap.set(56, 1);
        this.currentMyCardScreenCardMap.set(57, 4);
        this.currentMyCardScreenCardMap.set(59, 1);
        this.currentMyCardScreenCardMap.set(72, 1);
        this.currentMyCardScreenCardMap.set(75, 3);
        this.currentMyCardScreenCardMap.set(93, 1);
        this.currentMyCardScreenCardMap.set(94, 2);
        this.currentMyCardScreenCardMap.set(109, 1);
        this.currentMyCardScreenCardMap.set(119, 1);
        this.currentMyCardScreenCardMap.set(129, 5);
        this.currentMyCardScreenCardMap.set(134, 1);
        this.currentMyCardScreenCardMap.set(136, 4);
        this.currentMyCardScreenCardMap.set(145, 1);
        this.currentMyCardScreenCardMap.set(174, 6);
        this.currentMyCardScreenCardMap.set(178, 1);

    }

    public static getInstance(): MyCardScreenCardMapRepositoryImpl {
        if (!MyCardScreenCardMapRepositoryImpl.instance) {
            MyCardScreenCardMapRepositoryImpl.instance = new MyCardScreenCardMapRepositoryImpl();
        }
        return MyCardScreenCardMapRepositoryImpl.instance;
    }

    public getCurrentMyCardScreenCardMap(): Map<number, number> {
        return new Map(this.currentMyCardScreenCardMap);
    }

    public addMyCardScreenCard(cardId: number, cardCount: number): void {
        this.currentMyCardScreenCardMap.set(cardId, cardCount);
    }

    public getCardIdList(): number[] {
        return Array.from(this.currentMyCardScreenCardMap.keys());
    }

    public getCardCountList(): number[] {
        return Array.from(this.currentMyCardScreenCardMap.values());
    }

}