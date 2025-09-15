import {MyDeckNameTextMapRepository} from "./MyDeckNameTextMapRepository";

export class MyDeckNameTextMapRepositoryImpl implements MyDeckNameTextMapRepository {
    private static instance: MyDeckNameTextMapRepositoryImpl;

    // key: deckId, value: deckName
    private myDeckNameMap: Map<number, string> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.myDeckNameMap.set(1, '오프닝 언데드 덱');
        this.myDeckNameMap.set(2, '언데드 덱');
        this.myDeckNameMap.set(3, '트렌트 덱');
        this.myDeckNameMap.set(4, '휴먼 덱');
//         this.myDeckNameMap.set(5, '언데드 휴먼 덱');
//         this.myDeckNameMap.set(6, '트렌트 휴먼 덱');
//         this.myDeckNameMap.set(7, '언데드 트렌트 덱');
//         this.myDeckNameMap.set(8, '언데드 트렌트 휴먼 덱');
    }

    public static getInstance(): MyDeckNameTextMapRepositoryImpl {
        if (!MyDeckNameTextMapRepositoryImpl.instance) {
            MyDeckNameTextMapRepositoryImpl.instance = new MyDeckNameTextMapRepositoryImpl();
        }
        return MyDeckNameTextMapRepositoryImpl.instance;
    }

    public addMyDeckNameText(deckId: number, deckName: string): void {
        this.myDeckNameMap.set(deckId, deckName);
    }

    public getMyDeckNameTextList(): string[] {
        return Array.from(this.myDeckNameMap.values());
    }

    public getDeckIds(): number[] {
        return Array.from(this.myDeckNameMap.keys());
    }

    public findMyDeckNameByDeckId(deckId: number): string | undefined {
        return this.myDeckNameMap.get(deckId);
    }

    public deleteMyDeckNameText(deckId: number): void {
        this.myDeckNameMap.delete(deckId);
    }

    public updateMyDeckName(deckId: number, newDeckName: string): void {
        if (this.myDeckNameMap.has(deckId)) {
            this.myDeckNameMap.set(deckId, newDeckName);
        } else {
            console.warn(`Deck ID ${deckId}가 존재하지 않습니다.`);
        }
    }


}