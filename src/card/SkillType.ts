export enum SkillType {
    None = 0,
    Single = 1,         // 단일기
    EveryUnitField = 2, // 유닛 필드 전체 타격
    EveryField = 3,     // 유닛 필드 + 본체까지 타격
}

export function getSkillType(value: string | number | null | undefined): SkillType {
    const num = Number(value);
    switch (num) {
        case 1: return SkillType.Single;
        case 2: return SkillType.EveryUnitField;
        case 3: return SkillType.EveryField;
        default: return SkillType.None;
    }
}