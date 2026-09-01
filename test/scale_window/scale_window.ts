import * as THREE from 'three';
import {MainRenderer} from "../../src/main/renderer/MainRenderer";
import {BattleFieldUnitRepository} from "../../src/battle/unit/repository/BattleFieldUnitRepository";
import {Vector2d} from "../../src/common/math/Vector2d";
import {BattleFieldUnit} from "../../src/battle/unit/entity/BattleFieldUnit";

// HTML 파일의 body 요소에 Three.js 캔버스를 렌더링
const container = document.body;

// 현재 창 크기를 가져옴
let width = window.innerWidth;
let height = window.innerHeight;

// MainRenderer 초기화
const mainRenderer = new MainRenderer(container, width, height);

// BattleFieldUnitRepository에 유닛 추가
const unitRepository = BattleFieldUnitRepository.getInstance();

const cardId = 19;
const weaponId = 40;
const hpId = 60;
const energyId = 3;
const raceId = 2;
const position = new Vector2d(0, 0);

const battleFieldUnit = new BattleFieldUnit(cardId, weaponId, hpId, energyId, raceId, position);
unitRepository.addBattleFieldUnit(battleFieldUnit);

// 애니메이션 루프 설정
mainRenderer.animate();

// 윈도우 크기가 변경될 때 카메라 및 렌더러 크기 조정
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    mainRenderer.onResize(newWidth, newHeight);
});
