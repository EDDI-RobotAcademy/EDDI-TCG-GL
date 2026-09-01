export interface YourFieldMapRepository {
    save(cardId: number): void; // index와 cardId를 저장
    findById(index: number): number | null; // index로 cardId 검색
    findAll(): Map<number, number>; // 전체 필드 맵 반환
    deleteById(index: number): boolean; // index로 데이터 삭제
    deleteAll(): void; // 모든 데이터 삭제
}