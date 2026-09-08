import {Battle} from "../domain/Battle";
import {BattleSnapshot} from "../domain/BattleSnapshot";

// 지금 진행 중인 전투를 담아 두는 곳이다.
//
// 전투 중에 값을 읽고 쓰는 곳이 서른두 군데인데, 지금은 저마다 다른 저장소를 부른다.
// 앞으로는 여기서 전투를 받아 그 안을 본다.
export interface BattleRepository {
    start(): Battle;
    restore(snapshot: BattleSnapshot): Battle;
    // 진행 중인 전투가 없으면 null 이다. 전투 화면 밖에서 부를 수 있다.
    getCurrent(): Battle | null;
    // 전투 화면 안에서 부른다. 없으면 부르는 쪽이 잘못 부른 것이다.
    getCurrentOrThrow(): Battle;
    end(): void;
}
