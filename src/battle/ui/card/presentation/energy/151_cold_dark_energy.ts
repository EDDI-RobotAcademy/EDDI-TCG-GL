import {CardPresentation} from "../../CardPresentation";
import {attachEnergyToAlly} from "./093_death_energy";

// 차갑게 불타는 암흑 에너지 — 손패에서 아군 유닛에게 바로 붙인다.
//
// 죽음의 에너지와 붙이는 방식이 같고, 다른 점은 **지녔다는 마크가 카드에 붙는다** 는 것
// 하나다. 그 마크가 [이 유닛이 때릴 때마다 맞은 쪽에 암흑 화염과 빙결이 따라붙는다] 를
// 알린다.
//
// 붙이는 부분을 함께 쓰고 파일은 둘로 둔다. 둘이 갈라질 때 — 마크 모양이 달라지거나 붙는
// 개수가 달라질 때 — 여기만 고치면 된다.
export const ColdDarkEnergyPresentation: CardPresentation = {
    cardId: 151,
    dropTarget: 'allyUnit',
    onDrop: attachEnergyToAlly('cold-dark-energy', true),
};
