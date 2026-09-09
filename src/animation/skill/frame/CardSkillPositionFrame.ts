// 카드가 스킬을 쓸 때 올라가 서는 자리.
//
// 이 자리를 쓰는 곳이 네 곳이다. CardSkillMotion, AttackAnimationV2 의 두 곳,
// 그리고 draw_field_energy_full_efr 시나리오. 자리를 옮기면 네 곳이 같이 움직여야 해서
// 숫자를 여기 한 곳에 둔다.
//
// 화면 높이를 인자로 받는다. 네 곳 모두 쓸 때마다 잰다.
// 한 곳이라도 미리 재 두면 창 크기를 바꾼 뒤 그 하나만 옛 자리로 간다.
export interface CardSkillPositionFrame {
    readonly x: number;
    readonly y: number;
}

// 화면 위에서부터의 비율. 0 이 위, 1 이 아래다.
export const CARD_SKILL_POSITION_HEIGHT_RATIO = 0.78221649;

export function createCardSkillPositionFrame(viewportHeight: number): CardSkillPositionFrame {
    return {
        x: 0,
        y: (0.5 - CARD_SKILL_POSITION_HEIGHT_RATIO) * viewportHeight,
    };
}
