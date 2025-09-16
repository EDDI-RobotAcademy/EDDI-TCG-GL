import * as THREE from 'three';
import {Vector2d} from "../../common/math/Vector2d";
import {DeckNameEditInfoTextType} from "./DeckNameEditInfoTextType";

export interface InfoTextConfig {
    id: number;
    color: string;
    text: string;
    position: Vector2d;
}

export class DeckNameEditInfoTextConfigList {
    public infoTextConfigs: InfoTextConfig[] = [
        {
            id: DeckNameEditInfoTextType.DEFAULT,
            color: '#e6e6e6',
            text: '최대 10글자 까지 입력 가능하며, 특수문자 사용이 불가능 합니다.',
            position: new Vector2d(0, -0.032)
        },
        {
            id: DeckNameEditInfoTextType.ENABLE,
            color: '#368c5b',
            text: '사용 가능한 이름입니다.',
            position: new Vector2d(0, -0.032)
        },
        {
            id: DeckNameEditInfoTextType.EXIST,
            color: '#e52424',
            text: '이미 존재하는 덱 이름입니다.',
            position: new Vector2d(0, -0.032)
        },
        {
            id: DeckNameEditInfoTextType.OVERFLOW,
            color: '#e52424',
            text: '10글자를 초과 할 수 없습니다.',
            position: new Vector2d(0, -0.032)
        },
        {
            id: DeckNameEditInfoTextType.SPECIAL_CHARACTER,
            color: '#e52424',
            text: '특수문자는 사용할 수 없습니다.',
            position: new Vector2d(0, -0.032)
        },
    ];
}
