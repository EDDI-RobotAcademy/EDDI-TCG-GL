import {CardRace} from "../../card/race";
import {CardDraw} from "./CardDraw";
import everyCardInfo from "../../common/every_card_info";

// 서버가 없는 동안 이 안에서 굴린다.
//
// **서버가 붙으면 이 파일을 안 쓴다.** 그때는 서버에 묻는 것으로 바꿔 끼운다. 그래서 뽑기
// 규칙을 화면 코드 사이에 흩어 두지 않고 여기 한곳에 모았다 — 바꿔 끼울 때 이 파일만
// 지우면 된다 (확인용 전투 판을 한곳에 모은 것과 같은 이유다).
//
// 재화는 안 깎는다. 확률도 없다 — 그 종족 카드에서 고르게만 뽑는다. 둘 다 서버 일이다.
export class LocalCardDraw implements CardDraw {
    // 종족별 카드 번호. 한 번만 셈해 둔다.
    private readonly byRace = new Map<CardRace | null, readonly number[]>();

    public async draw(race: CardRace | null, count: number): Promise<readonly number[]> {
        const pool = this.pool(race);
        if (pool.length === 0) return [];

        const drawn: number[] = [];
        for (let i = 0; i < count; i++) {
            // 같은 카드가 여러 장 나올 수 있다. 뽑기는 덱에서 빼 오는 것이 아니다.
            drawn.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return drawn;
    }

    // 이 종족의 카드 번호 목록.
    //
    // **카드 자료의 열쇠는 카드 번호가 아니다.** 0 부터 세는 차례이고, 카드 번호는
    // [카드번호] 칸에 따로 있다. 열쇠를 번호로 쓰면 없는 그림을 찾게 되고, 그림을 못 읽으면
    // 결과 화면이 아예 안 뜬다.
    private pool(race: CardRace | null): readonly number[] {
        const cached = this.byRace.get(race);
        if (cached) return cached;

        const all = everyCardInfo as unknown as Record<string, {종족?: string; 카드번호?: number}>;
        const ids: number[] = [];
        for (const key of Object.keys(all)) {
            const info = all[key];
            const cardId = info?.카드번호;
            if (typeof cardId !== 'number') continue;
            if (race !== null && Number(info.종족) !== race) continue;
            ids.push(cardId);
        }
        this.byRace.set(race, ids);
        return ids;
    }
}
