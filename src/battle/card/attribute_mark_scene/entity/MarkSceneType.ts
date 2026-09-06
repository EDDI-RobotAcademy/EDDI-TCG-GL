// 카드에 붙는 표시의 종류.
//
// 내 카드든 상대 카드든 필드에 나온 카드에는 같은 표시가 붙는다. 종족, 무기, 체력,
// 에너지가 양쪽 다 보인다. 그래서 한 벌만 두고 양쪽이 함께 쓴다.
//
// 예전에는 상대 쪽에 사본이 하나 더 있었다. 값은 같고 쉼표 하나만 달랐다.
// 표시 종류를 하나 늘릴 때 두 곳을 고쳐야 했다.
export enum MarkSceneType {
    RACE = "RACE",
    SWORD = "SWORD",
    STAFF = "STAFF",
    KINDS = "KINDS",
    ENERGY = "ENERGY",
    ENERGY_COUNT = "ENERGY_COUNT",
    HP = "HP"
}