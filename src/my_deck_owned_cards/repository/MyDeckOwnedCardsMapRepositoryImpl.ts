import {MyDeckOwnedCardsMapRepository} from "./MyDeckOwnedCardsMapRepository";

export class MyDeckOwnedCardsMapRepositoryImpl implements MyDeckOwnedCardsMapRepository {
    private static instance: MyDeckOwnedCardsMapRepositoryImpl;

    // key: cardId, value: cardCount
    private currentMyDeckOwnedCardsMap: Map<number, number> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.currentMyDeckOwnedCardsMap.set(2, 9);
        this.currentMyDeckOwnedCardsMap.set(5, 11);
        this.currentMyDeckOwnedCardsMap.set(6, 15);
        this.currentMyDeckOwnedCardsMap.set(7, 3);
        this.currentMyDeckOwnedCardsMap.set(8, 3);
        this.currentMyDeckOwnedCardsMap.set(9, 7);
        this.currentMyDeckOwnedCardsMap.set(10, 2);
        this.currentMyDeckOwnedCardsMap.set(11, 1);
        this.currentMyDeckOwnedCardsMap.set(13, 9);
        this.currentMyDeckOwnedCardsMap.set(14, 2);
        this.currentMyDeckOwnedCardsMap.set(15, 2);
        this.currentMyDeckOwnedCardsMap.set(16, 1);
        this.currentMyDeckOwnedCardsMap.set(17, 5);
        this.currentMyDeckOwnedCardsMap.set(18, 3);
        this.currentMyDeckOwnedCardsMap.set(19, 2);
        this.currentMyDeckOwnedCardsMap.set(20, 7);
        this.currentMyDeckOwnedCardsMap.set(22, 1);
        this.currentMyDeckOwnedCardsMap.set(23, 1);
        this.currentMyDeckOwnedCardsMap.set(24, 1);
        this.currentMyDeckOwnedCardsMap.set(25, 8);
        this.currentMyDeckOwnedCardsMap.set(26, 1);
        this.currentMyDeckOwnedCardsMap.set(27, 2);
        this.currentMyDeckOwnedCardsMap.set(28, 3);
        this.currentMyDeckOwnedCardsMap.set(29, 5);
        this.currentMyDeckOwnedCardsMap.set(30, 10);
        this.currentMyDeckOwnedCardsMap.set(31, 6);
        this.currentMyDeckOwnedCardsMap.set(32, 6);
        this.currentMyDeckOwnedCardsMap.set(33, 3);
        this.currentMyDeckOwnedCardsMap.set(34, 10);
        this.currentMyDeckOwnedCardsMap.set(35, 10);
        this.currentMyDeckOwnedCardsMap.set(37, 6);
        this.currentMyDeckOwnedCardsMap.set(42, 2);
        this.currentMyDeckOwnedCardsMap.set(43, 2);
        this.currentMyDeckOwnedCardsMap.set(47, 2);
        this.currentMyDeckOwnedCardsMap.set(48, 1);
        this.currentMyDeckOwnedCardsMap.set(49, 3);
        this.currentMyDeckOwnedCardsMap.set(50, 1);
        this.currentMyDeckOwnedCardsMap.set(51, 5);
        this.currentMyDeckOwnedCardsMap.set(52, 1);
        this.currentMyDeckOwnedCardsMap.set(53, 2);
        this.currentMyDeckOwnedCardsMap.set(54, 1);
        this.currentMyDeckOwnedCardsMap.set(55, 1);
        this.currentMyDeckOwnedCardsMap.set(56, 1);
        this.currentMyDeckOwnedCardsMap.set(57, 4);
        this.currentMyDeckOwnedCardsMap.set(59, 1);
        this.currentMyDeckOwnedCardsMap.set(72, 1);
        this.currentMyDeckOwnedCardsMap.set(75, 3);
        this.currentMyDeckOwnedCardsMap.set(93, 1);
        this.currentMyDeckOwnedCardsMap.set(94, 2);
        this.currentMyDeckOwnedCardsMap.set(109, 1);
        this.currentMyDeckOwnedCardsMap.set(119, 1);
        this.currentMyDeckOwnedCardsMap.set(129, 5);
        this.currentMyDeckOwnedCardsMap.set(134, 1);
        this.currentMyDeckOwnedCardsMap.set(136, 4);
        this.currentMyDeckOwnedCardsMap.set(145, 1);
        this.currentMyDeckOwnedCardsMap.set(174, 6);
        this.currentMyDeckOwnedCardsMap.set(178, 1);

    }

    public static getInstance(): MyDeckOwnedCardsMapRepositoryImpl {
        if (!MyDeckOwnedCardsMapRepositoryImpl.instance) {
            MyDeckOwnedCardsMapRepositoryImpl.instance = new MyDeckOwnedCardsMapRepositoryImpl();
        }
        return MyDeckOwnedCardsMapRepositoryImpl.instance;
    }

    public findCurrentMyDeckOwnedCardsMap(): Map<number, number> {
        return new Map(this.currentMyDeckOwnedCardsMap);
    }

    public addMyDeckOwnedCards(cardId: number, cardCount: number): void {
        this.currentMyDeckOwnedCardsMap.set(cardId, cardCount);
    }

    public getCardIdList(): number[] {
        return Array.from(this.currentMyDeckOwnedCardsMap.keys());
    }

    public getCardCountList(): number[] {
        return Array.from(this.currentMyDeckOwnedCardsMap.values());
    }

}