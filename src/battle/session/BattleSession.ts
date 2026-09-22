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
// **판을 내주지 않는다.** 전에는 판을 시작하면 판 자체를 돌려주었고, 그래서 전투 화면이
// 그것을 변수에 담아 들고 있었다. 들고 있으면 고치는 손잡이 서른셋에 닿는다 — 명령을
// 거치지 않고, 규칙을 안 태우고.
//
// 들어오는 문은 [적어 둔 것으로 판을 차린다] 하나다. 확인용 판이면 우리가 손으로 적은
// 것이 오고, 진짜 대전이면 서버가 적어 보낸 것이 온다. 문은 같다.
export interface BattleSession {
    // 적어 둔 것으로 판을 차린다. 카드에 적힌 것을 알려 주는 곳을 함께 받는다.
    restore(snapshot: BattleSnapshot, catalog: CardCatalog): void;

    // 사용자가 한 일 하나를 보내고, 무슨 일이 있었는지 받는다.
    send(command: BattleCommand): BattleEvent[];

    // 화면에 보여 줄 것만 추린 창구. 판을 차린 뒤에 받는다.
    read(): BattleReadModel;

    end(): void;
}
