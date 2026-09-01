import {YourFieldMapRepository} from "./YourFieldMapRepository";

export class YourFieldMapRepositoryImpl implements YourFieldMapRepository {
    private static instance: YourFieldMapRepositoryImpl;

    // key: index, value: cardId
    private currentFieldMap: Map<number, number> = new Map();

    private constructor() {
        // this.currentHandMap.set(0, 2);
    }

    public static getInstance(): YourFieldMapRepositoryImpl {
        if (!YourFieldMapRepositoryImpl.instance) {
            YourFieldMapRepositoryImpl.instance = new YourFieldMapRepositoryImpl();
        }
        return YourFieldMapRepositoryImpl.instance;
    }

    save(cardId: number): number {
        // 자동으로 index를 할당 (현재 Map의 크기 + 1을 사용)
        const index = this.currentFieldMap.size;
        this.currentFieldMap.set(index, cardId);
        console.log(`Saved cardId ${cardId} at index ${index}`);
        return index; // 저장된 index 반환
    }

    findById(index: number): number | null {
        const cardId = this.currentFieldMap.get(index);
        if (cardId !== undefined) {
            console.log(`Found cardId ${cardId} at index ${index}`);
            return cardId;
        }
        console.log(`No cardId found at index ${index}`);
        return null;
    }

    findAll(): Map<number, number> {
        console.log("Returning all field map data");
        return new Map(this.currentFieldMap); // Map 복사본 반환
    }

    deleteById(index: number): boolean {
        const result = this.currentFieldMap.delete(index);
        if (result) {
            console.log(`Deleted cardId at index ${index}`);
        } else {
            console.log(`No cardId to delete at index ${index}`);
        }
        return result;
    }

    deleteAll(): void {
        const size = this.currentFieldMap.size;
        this.currentFieldMap.clear();
        console.log(`Deleted all field map data (${size} entries removed)`);
    }
}