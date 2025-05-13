import {MyDeckButtonMapRepository} from "./MyDeckButtonMapRepository";

export class MyDeckButtonMapRepositoryImpl implements MyDeckButtonMapRepository {
    private static instance: MyDeckButtonMapRepositoryImpl;

    // key: index, value: deckId
    private currentMyDeckMap: Map<number, number> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.currentMyDeckMap.set(0, 1);
        this.currentMyDeckMap.set(1, 2);
        this.currentMyDeckMap.set(2, 3);
        this.currentMyDeckMap.set(3, 4);
//         this.currentMyDeckMap.set(4, 5);
//         this.currentMyDeckMap.set(5, 6);
//         this.currentMyDeckMap.set(6, 7);
//         this.currentMyDeckMap.set(7, 8);
    }

    public static getInstance(): MyDeckButtonMapRepositoryImpl {
        if (!MyDeckButtonMapRepositoryImpl.instance) {
            MyDeckButtonMapRepositoryImpl.instance = new MyDeckButtonMapRepositoryImpl();
        }
        return MyDeckButtonMapRepositoryImpl.instance;
    }

    // 새로운 덱을 추가하는 메서드, 새로운 인덱스는 currentMyDeckMap 크기 기준으로 설정
    public addMyDeck(deckId: number): void {
        const newIndex = this.currentMyDeckMap.size;
        this.currentMyDeckMap.set(newIndex, deckId);
    }

    // Map을 Array로 변환하여 모든 deckId를 가져오는 메서드
    public getMyDeckList(): number[] {
        return Array.from(this.currentMyDeckMap.values());
    }

    // 인덱스를 통해 덱 ID를 반환하는 메서드
    public getMyDeckIdByIndex(index: number): number | undefined {
        return this.currentMyDeckMap.get(index);
    }

    // 덱을 삭제할 때는 인덱스 기반으로 삭제
    public removeMyDeck(index: number): void {
        this.currentMyDeckMap.delete(index);
        this.updateDeckIndexes();
    }

    // 덱 삭제 후 인덱스를 다시 정렬하는 메서드
    private updateDeckIndexes(): void {
        const updatedMap = new Map<number, number>();
        let newIndex = 0;

        // 인덱스를 다시 0부터 순서대로 재설정
        for (const [_, deckId] of this.currentMyDeckMap) {
            updatedMap.set(newIndex, deckId);
            newIndex++;
        }

        this.currentMyDeckMap = updatedMap;
    }

    // deckId를 기준으로 덱을 제거하는 메서드
    public removeMyDeckByDeckId(deckId: number): void {
        let targetIndex: number | undefined;

        // deckId에 해당하는 index를 찾음
        for (const [index, value] of this.currentMyDeckMap.entries()) {
            if (value === deckId) {
                targetIndex = index;
                break;
            }
        }

        if (targetIndex !== undefined) {
            this.currentMyDeckMap.delete(targetIndex);
        } else {
            console.warn(`deckId ${deckId}에 해당하는 덱이 존재하지 않습니다.`);
        }
    }


    public getMyDeckMapSize(): number {
        return this.currentMyDeckMap.size;
    }
}