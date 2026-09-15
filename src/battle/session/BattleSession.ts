import {Battle} from "../domain/battle/Battle";
import {BattleSnapshot} from "../domain/battle/BattleSnapshot";

// 지금 진행 중인 전투 한 판을 들고 있는 곳이다.
//
// 저장소가 아니다. 판이 끝나면 여기서 사라진다. 나중에 어딘가에 남겨 둘 일이 생기면
// 그것은 여기가 아니라 따로 만든다.
export interface BattleSession {
    start(): Battle;
    restore(snapshot: BattleSnapshot): Battle;
    // 진행 중인 전투가 없으면 null 이다. 전투 화면 밖에서 부를 수 있다.
    getCurrent(): Battle | null;
    // 전투 화면 안에서 부른다. 없으면 부르는 쪽이 잘못 부른 것이다.
    getCurrentOrThrow(): Battle;
    end(): void;
}
