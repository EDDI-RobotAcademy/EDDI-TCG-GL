// 카드가 스킬을 쓸 때 올라가 서는 자리.
//
// 이 자리를 쓰는 곳이 네 곳이다. CardSkillMotion, AttackAnimationV2 의 두 곳,
// 그리고 draw_field_energy_full_efr 시나리오. 자리를 옮기면 네 곳이 같이 움직여야 해서
// 숫자를 여기 한 곳에 둔다.
//
// 화면 높이를 인자로 받는다. 부르는 쪽이 언제 재는지가 서로 다르기 때문이다.
// CardSkillMotion 은 파일을 읽을 때 한 번 재고, 나머지는 부를 때마다 잰다.
// 그래서 창 크기를 바꾼 뒤에 둘이 어긋난다. 언제 재는지를 맞추는 일은 여기서 하지 않는다.
export interface SkillSlotFrame {
    readonly x: number;
    readonly y: number;
}

// 화면 위에서부터의 비율. 0 이 위, 1 이 아래다.
export const SKILL_SLOT_HEIGHT_RATIO = 0.78221649;

export function createSkillSlotFrame(viewportHeight: number): SkillSlotFrame {
    return {
        x: 0,
        y: (0.5 - SKILL_SLOT_HEIGHT_RATIO) * viewportHeight,
    };
}
