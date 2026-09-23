// 상점에서 누를 수 있는 것.
//
// 카드를 뽑는 넷과, 다른 화면으로 가는 둘이다. 뽑기는 아직 실제로 사지지 않는다 (R2-136).
export enum ShopMenuType {
    // 종족을 가리지 않고 뽑는다
    DrawAll = 'draw_all',
    DrawHuman = 'draw_human',
    DrawTrent = 'draw_trent',
    DrawUndead = 'draw_undead',
    // 화면을 옮기는 자리. 그림이 배경에 함께 그려져 있어 누르는 자리만 둔다
    ToLobby = 'to_lobby',
    ToMyCard = 'to_my_card',
}
