export interface Card {
    카드명: string;
    종족: string;
    등급: string;
    종류: string;
    카드번호: number;
    병종: string;
    필요_에너지: number;
    공격력: number;
    체력: number | null;
    패시브: string;
    스킬: string;
    스킬_개수: number;
    스킬_1: string;
    스킬_2: string;
    패시브_1: string;
    패시브_2: string;
    스킬1_데미지: number;
    스킬2_데미지: number;
    패시브1_데미지: number;
    패시브2_데미지: number;
    스킬1_언데드필요에너지: number;
    스킬1_휴먼필요에너지: number;
    스킬1_트런트필요에너지: number;
    스킬2_언데드필요에너지: number;
    스킬2_휴먼필요에너지: number;
    스킬2_트런트필요에너지: number;
}
