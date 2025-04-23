import {MyDeckCardMapRepository} from "./MyDeckCardMapRepository";

export class MyDeckCardMapRepositoryImpl implements MyDeckCardMapRepository {
    private static instance: MyDeckCardMapRepositoryImpl;

    // key: deckId, value: cardIdList
    private currentMyDeckCardMap: Map<number, number[]> = new Map();
    // deckId: {cardId: card count}
    private currentMyDeckCardMapNew: Map<number, { cardId: number, cardCount: number }[]> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.currentMyDeckCardMap.set(1,
            [2, 5, 8, 19, 20, 93, 26, 27, 2, 14, 15, 31, 33, 35, 36, 29,
            30, 32, 40, 43, 47, 49, 55, 56]);
        this.currentMyDeckCardMap.set(2,
            [5, 8, 8, 19, 20, 33, 35, 29, 30, 40, 56, 55, 2, 93]);
        this.currentMyDeckCardMap.set(3, [19, 33, 35, 40, 55, 29, 70, 71]);
        this.currentMyDeckCardMap.set(4, [70, 71, 72, 74, 76, 77, 99, 119]);
        this.currentMyDeckCardMap.set(5, [129, 130, 133, 134, 139, 141, 143, 145]);
        this.currentMyDeckCardMap.set(6, [30, 32, 40, 43, 47, 49, 55, 56]);
        this.currentMyDeckCardMap.set(7, [35, 29, 30, 40, 56, 55, 2, 93]);
        this.currentMyDeckCardMap.set(8, [19, 20, 93, 26, 27, 2, 14, 15]);

        this.currentMyDeckCardMapNew.set(1, [
            { cardId: 2, cardCount: 2 },
            { cardId: 5, cardCount: 1 },
            { cardId: 8, cardCount: 1 },
            { cardId: 19, cardCount: 1 },
            { cardId: 20, cardCount: 1 },
            { cardId: 93, cardCount: 1 },
            { cardId: 26, cardCount: 1 },
            { cardId: 27, cardCount: 1 },
            { cardId: 14, cardCount: 1 },
            { cardId: 15, cardCount: 1 },
            { cardId: 31, cardCount: 1 },
            { cardId: 33, cardCount: 1 },
            { cardId: 35, cardCount: 1 },
            { cardId: 36, cardCount: 1 },
            { cardId: 29, cardCount: 1 },
            { cardId: 30, cardCount: 1 },
            { cardId: 32, cardCount: 1 },
            { cardId: 40, cardCount: 1 },
            { cardId: 43, cardCount: 1 },
            { cardId: 47, cardCount: 1 },
            { cardId: 49, cardCount: 1 },
            { cardId: 55, cardCount: 1 },
            { cardId: 56, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(2, [
            { cardId: 5, cardCount: 1 },
            { cardId: 8, cardCount: 2 },
            { cardId: 19, cardCount: 1 },
            { cardId: 20, cardCount: 1 },
            { cardId: 33, cardCount: 1 },
            { cardId: 35, cardCount: 1 },
            { cardId: 29, cardCount: 1 },
            { cardId: 30, cardCount: 1 },
            { cardId: 40, cardCount: 1 },
            { cardId: 56, cardCount: 1 },
            { cardId: 55, cardCount: 1 },
            { cardId: 2, cardCount: 1 },
            { cardId: 93, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(3, [
            { cardId: 19, cardCount: 1 },
            { cardId: 33, cardCount: 1 },
            { cardId: 35, cardCount: 1 },
            { cardId: 40, cardCount: 1 },
            { cardId: 55, cardCount: 1 },
            { cardId: 29, cardCount: 1 },
            { cardId: 70, cardCount: 1 },
            { cardId: 71, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(4, [
            { cardId: 70, cardCount: 1 },
            { cardId: 71, cardCount: 1 },
            { cardId: 72, cardCount: 1 },
            { cardId: 74, cardCount: 1 },
            { cardId: 76, cardCount: 1 },
            { cardId: 77, cardCount: 1 },
            { cardId: 99, cardCount: 1 },
            { cardId: 119, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(5, [
            { cardId: 129, cardCount: 1 },
            { cardId: 130, cardCount: 1 },
            { cardId: 133, cardCount: 1 },
            { cardId: 134, cardCount: 1 },
            { cardId: 139, cardCount: 1 },
            { cardId: 141, cardCount: 1 },
            { cardId: 143, cardCount: 1 },
            { cardId: 145, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(6, [
            { cardId: 30, cardCount: 1 },
            { cardId: 32, cardCount: 1 },
            { cardId: 40, cardCount: 1 },
            { cardId: 43, cardCount: 1 },
            { cardId: 47, cardCount: 1 },
            { cardId: 49, cardCount: 1 },
            { cardId: 55, cardCount: 1 },
            { cardId: 56, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(7, [
            { cardId: 35, cardCount: 1 },
            { cardId: 29, cardCount: 1 },
            { cardId: 30, cardCount: 1 },
            { cardId: 40, cardCount: 1 },
            { cardId: 56, cardCount: 1 },
            { cardId: 55, cardCount: 1 },
            { cardId: 2, cardCount: 1 },
            { cardId: 93, cardCount: 1 },
        ]);

        this.currentMyDeckCardMapNew.set(8, [
            { cardId: 19, cardCount: 1 },
            { cardId: 20, cardCount: 1 },
            { cardId: 93, cardCount: 1 },
            { cardId: 26, cardCount: 1 },
            { cardId: 27, cardCount: 1 },
            { cardId: 2, cardCount: 1 },
            { cardId: 14, cardCount: 1 },
            { cardId: 15, cardCount: 1 },
        ]);

    }

    public static getInstance(): MyDeckCardMapRepositoryImpl {
        if (!MyDeckCardMapRepositoryImpl.instance) {
            MyDeckCardMapRepositoryImpl.instance = new MyDeckCardMapRepositoryImpl();
        }
        return MyDeckCardMapRepositoryImpl.instance;
    }

    // 새로운 덱을 추가하는 메서드
    public addMyDeckCard(deckId: number, cardIdList: number[]): void {
        this.currentMyDeckCardMap.set(deckId, cardIdList);
    }

    public getDeckIdAndCardLists(): [number, number[]][] {
        return Array.from(this.currentMyDeckCardMap.entries());
    }

    // 반환형: [deckId, uniqueCardIdList[]] 형태
    public getDeckIdAndUniqueCardListsNew(): [number, number[]][] {
        return Array.from(this.currentMyDeckCardMapNew.entries()).map(([deckId, cardInfos]) => {
            const cardIdList = cardInfos.map(({ cardId }) => cardId);
            return [deckId, cardIdList];
        });
    }

    public deleteMyDeck(deckId: number): void {
        this.currentMyDeckCardMapNew.delete(deckId);
    }

}