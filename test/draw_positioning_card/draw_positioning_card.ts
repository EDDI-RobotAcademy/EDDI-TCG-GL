import * as THREE from 'three';
import { ResourceManager } from "../../src/resouce_manager/ResourceManager";
import { LegacyBattleFieldUnit } from "../../src/battle/unit/entity/LegacyBattleFieldUnit";
import {LegacyNonBackgroundImage} from "../../src/shape/image/LegacyNonBackgroundImage";
import {BattleFieldUnitScene} from "../../src/battle/unit/scene/BattleFieldUnitScene";
import {BattleFieldUnitRenderer} from "../../src/battle/unit/renderer/BattleFieldUnitRenderer";
import {BattleFieldUnitRepository} from "../../src/battle/unit/repository/BattleFieldUnitRepository";
import {Vector2d} from "../../src/common/math/Vector2d";
import {BattleFieldUnit} from "../../src/battle/unit/entity/BattleFieldUnit";

const container = document.body;

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const aspect = width / height;
const viewSize = height;
const camera = new THREE.OrthographicCamera(
    -aspect * viewSize / 2, aspect * viewSize / 2,
    viewSize / 2, -viewSize / 2,
    0.1, 1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const resourceManager = new ResourceManager();
resourceManager.registerBattleFieldUnitPath({
    cardPath: 'resource/battle_field_unit/card/{id}.png',
    weaponPath: 'resource/battle_field_unit/sword_power/{id}.png',
    hpPath: 'resource/battle_field_unit/hp/{id}.png',
    energyPath: 'resource/battle_field_unit/energy/{id}.png',
    racePath: 'resource/battle_field_unit/race/{id}.png'
});

const unitScene = new BattleFieldUnitScene();
const unitRenderer = new BattleFieldUnitRenderer(unitScene, resourceManager);

const unitRepository = BattleFieldUnitRepository.getInstance();

const backgroundImagePath = 'resource/background/battle_field.png'
const backgroundWidth = viewSize * aspect
const backgroundHeight = viewSize
const background = new LegacyNonBackgroundImage(backgroundWidth, backgroundHeight, backgroundImagePath, 1, 1, new THREE.Vector2(0, 0), undefined, undefined, undefined, undefined, undefined, () => {
    background.draw(scene)

    ensureBackgroundIsBehind();
})

const cardId = 19;
const weaponId = 40;
const hpId = 60;
const energyId = 3;
const raceId = 2;
const position = new Vector2d(0, 0);

const battleFieldUnit = new BattleFieldUnit(cardId, weaponId, hpId, energyId, raceId, position);

// BattleFieldUnitRepository에 유닛 추가
unitRepository.addBattleFieldUnit(battleFieldUnit);

// const initialX = camera.left + 75; // 카드 너비의 절반
// const initialY = camera.bottom + 75 * 1.615 / 2; // 카드 높이의 절반
// battleFieldUnit.setPosition(initialX, initialY);

// 씬을 초기 렌더링합니다.
unitRenderer.render(renderer, camera);

function ensureBackgroundIsBehind() {
    if (background.getMesh()) {
        unitScene.getScene().remove(background.getMesh());
        unitScene.getScene().add(background.getMesh());
    }
}

// function createBattleFieldUnit () {
//     const cardId = 19;
//     const weaponId = 40;
//     const hpId = 60;
//     const energyId = 3;
//     const raceId = 2;
//     const cardWidth = 150;
//     const cardHeight = cardWidth * 1.615;
//
//     const placedLocation = {
//         card: new THREE.Vector2(0, 0),
//         weapon: new THREE.Vector2(cardWidth / 2 - 8, -cardHeight / 2 + 8), // 상대 위치 조정
//         hp: new THREE.Vector2(-cardWidth / 2, -cardHeight / 2 + 13), // 상대 위치 조정
//         energy: new THREE.Vector2(-cardWidth / 2, cardHeight / 2), // 상대 위치 조정
//         race: new THREE.Vector2(cardWidth / 2, cardHeight / 2) // 상대 위치 조정
//     };
//
//     const battleFieldUnit = new LegacyBattleFieldUnit(scene, resourceManager, cardId, weaponId, hpId, energyId, raceId, cardWidth, placedLocation);
//
//     // battleFieldUnit.movePosition(-aspect * viewSize / 2 + cardWidth / 2, - viewSize / 2 + cardHeight / 2);
//     // battleFieldUnit.redraw(scene)
// }

// 윈도우 크기가 변경될 때 카메라 및 렌더러 크기 조정
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newAspect = newWidth / newHeight;
    camera.left = -newAspect * newHeight / 2;
    camera.right = newAspect * newHeight / 2;
    camera.top = newHeight / 2;
    camera.bottom = -newHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

// // 애니메이션 루프 설정
// function animate() {
//     requestAnimationFrame(animate);
//
//     renderer.render(scene, camera);
// }

unitRenderer.animate(renderer, camera);
