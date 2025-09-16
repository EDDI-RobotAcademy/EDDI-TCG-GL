export enum DeckNameEditInfoTextType {
    DEFAULT = 0,
    ENABLE = 1, // 사용 가능
    EXIST = 2, // 이미 존재
    OVERFLOW = 3, // 10글자 초과
    SPECIAL_CHARACTER = 4, //특수 문자 사용
}