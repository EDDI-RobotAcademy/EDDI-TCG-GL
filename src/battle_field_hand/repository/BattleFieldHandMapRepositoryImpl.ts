import {BattleFieldHandMapRepository} from "./BattleFieldHandMapRepository";

export class BattleFieldHandMapRepositoryImpl implements BattleFieldHandMapRepository {
    private static instance: BattleFieldHandMapRepositoryImpl;

    // key: index, value: cardId
    private currentHandMap: Map<number, number> = new Map();

    private constructor() {
        // 예시 데이터를 추가
        this.currentHandMap.set(0, 2);
        // this.currentHandMap.set(1, 8);
        this.currentHandMap.set(2, 19);
        // this.currentHandMap.set(3, 20);
        // this.currentHandMap.set(4, 93);
        this.currentHandMap.set(1, 26);
        this.currentHandMap.set(3, 27);
        this.currentHandMap.set(4, 17);
    }

    public static getInstance(): BattleFieldHandMapRepositoryImpl {
        if (!BattleFieldHandMapRepositoryImpl.instance) {
            BattleFieldHandMapRepositoryImpl.instance = new BattleFieldHandMapRepositoryImpl();
        }
        return BattleFieldHandMapRepositoryImpl.instance;
    }

    // 새로운 핸드를 추가하는 메서드, 새로운 인덱스는 currentHandMap 크기 기준으로 설정
    public addBattleFieldHand(cardId: number): void {
        const newIndex = this.currentHandMap.size;
        this.currentHandMap.set(newIndex, cardId);

        console.log(`[BattleFieldHandMapRepository] addBattleFieldHand`);
        console.log(`- added index: ${newIndex}, cardId: ${cardId}`);

        this.currentHandMap.forEach((value, key) => {
            console.log(`  index=${key}, cardId=${value}`);
        });
    }

    // Map을 Array로 변환하여 모든 cardId를 가져오는 메서드
    public getBattleFieldHandList(): number[] {
        return Array.from(this.currentHandMap.values());
    }

    // 인덱스를 통해 카드 ID를 반환하는 메서드
    public getCardIdByIndex(index: number): number | undefined {
        return this.currentHandMap.get(index);
    }

    // 핸드를 삭제할 때는 인덱스 기반으로 삭제
    public removeBattleFieldHand(index: number): void {
        this.currentHandMap.delete(index);
        this.updateHandIndexes();
    }

    // 핸드 삭제 후 인덱스를 다시 정렬하는 메서드
    private updateHandIndexes(): void {
        const updatedMap = new Map<number, number>();
        let newIndex = 0;

        // 인덱스를 다시 0부터 순서대로 재설정
        for (const [_, cardId] of this.currentHandMap) {
            updatedMap.set(newIndex, cardId);
            newIndex++;
        }

        this.currentHandMap = updatedMap;
    }
}