import {Battle} from "../domain/battle/Battle";
import {BattleSnapshot} from "../domain/battle/BattleSnapshot";
import {BattleCommand} from "../domain/flow/BattleCommand";
import {BattleEvent} from "../domain/flow/BattleEvent";
import {CardCatalog} from "../domain/ability/CardCatalog";
import {BattleReadModel} from "../domain/read/BattleReadModel";

// 지금 진행 중인 전투 한 판을 들고 있는 곳이다.
//
// 저장소가 아니다. 판이 끝나면 여기서 사라진다. 나중에 어딘가에 남겨 둘 일이 생기면
// 그것은 여기가 아니라 따로 만든다.
//
// 판을 든 쪽이 규칙도 구동한다. 전에는 전투 화면이 규칙 기계를 제 손으로 만들어
// 제 안에서 돌렸다. 그러면 화면이 판을 셈하는 권한을 쥔 것이 된다 (규칙 25).
//
// 실제 대전에서 셈하는 곳은 서버다. 여기가 그 자리를 대신 맡고 있는 것이고, 네트워크가
// 붙을 때 이 안이 바뀐다. 부르는 쪽은 안 바뀐다.
export interface BattleSession {
    // 판을 하나 시작한다. 카드에 적힌 것을 알려 주는 곳을 함께 받는다.
    start(catalog: CardCatalog): Battle;
    restore(snapshot: BattleSnapshot, catalog: CardCatalog): Battle;

    // 사용자가 한 일 하나를 보내고, 무슨 일이 있었는지 받는다.
    send(command: BattleCommand): BattleEvent[];

    // 화면에 보여 줄 것만 추린 창구.
    read(): BattleReadModel;

    // 진행 중인 전투가 없으면 null 이다. 전투 화면 밖에서 부를 수 있다.
    getCurrent(): Battle | null;
    // 전투 화면 안에서 부른다. 없으면 부르는 쪽이 잘못 부른 것이다.
    getCurrentOrThrow(): Battle;
    end(): void;
}
