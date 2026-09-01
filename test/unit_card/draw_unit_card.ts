// import * as THREE from 'three';
// import { LegacyNonBackgroundImage } from "../../src/shape/image/LegacyNonBackgroundImage"; // 올바른 경로로 수정
//
// // HTML 파일의 body 요소에 Three.js 캔버스를 렌더링
// const container = document.body;
//
// // 현재 창 크기를 가져옴
// const width = window.innerWidth;
// const height = window.innerHeight;
//
// // Three.js를 사용하여 WebGL 렌더러 생성
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(width, height);
// container.appendChild(renderer.domElement);
//
// // Three.js를 사용하여 카메라 생성
// const aspect = width / height;
// const viewSize = height; // 보기 공간 크기 설정, 실제 창의 높이로 설정
// const camera = new THREE.OrthographicCamera(
//     -aspect * viewSize / 2, aspect * viewSize / 2,
//     viewSize / 2, -viewSize / 2,
//     0.1, 1000
// );
// camera.position.set(0, 0, 5);
// camera.lookAt(0, 0, 0); // 카메라가 원점(0, 0, 0)을 바라보도록 설정
//
// // Three.js를 사용하여 씬 생성
// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);
//
// // LegacyNonBackgroundImage 생성
// const cardId = 19;
// const imagePath = `resource/battle_field_unit/card/${cardId}.png`;
//
// console.log(imagePath);
//
// const cardWidth = 150; // 카드의 너비 설정
// const cardHeight = cardWidth * 1.615; // 카드의 높이 설정
// const imageRectangle = new LegacyNonBackgroundImage(cardWidth, cardHeight, imagePath, 1, 1, undefined, undefined, undefined, undefined, undefined, undefined, () => {
//     // 콜백 함수: 텍스처 로딩이 완료되었을 때 실행됨
//     // 씬에 이미지 렌더링
//     imageRectangle.draw(scene);
// });
//
// const weaponId = 40;
// const imageWeaponPath = `resource/battle_field_unit/sword_power/${weaponId}.png`;
//
// const weaponWidth = 95;
// const weaponHeight = weaponWidth * 1.651;
//
// const weaponLocalPosition = new THREE.Vector2(cardWidth / 2 - 8, -cardHeight / 2 + 8);
// const imageWeapon = new LegacyNonBackgroundImage(weaponWidth, weaponHeight, imageWeaponPath, 1, 1, weaponLocalPosition, undefined, undefined, undefined, undefined, undefined, () => {
//     imageWeapon.draw(scene);
// });
//
// const hpId = 60;
// const imageHpPath = `resource/battle_field_unit/hp/${hpId}.png`;
//
// const hpWidth = 50;
// const hpHeight = hpWidth * 1.651;
//
// const hpLocalPosition = new THREE.Vector2(-cardWidth / 2, -cardHeight / 2 + 13);
// const imageHp = new LegacyNonBackgroundImage(hpWidth, hpHeight, imageHpPath, 1, 1, hpLocalPosition, undefined, undefined, undefined, undefined, undefined, () => {
//     imageHp.draw(scene);
// });
//
// const energyId = 3;
// const imageEnergyPath = `resource/battle_field_unit/energy/${energyId}.png`;
//
// const energyWidth = 58;
// const energyHeight = hpWidth * 1.618;
//
// const energyLocalPosition = new THREE.Vector2(-cardWidth / 2, cardHeight / 2);
// const imageEnergy = new LegacyNonBackgroundImage(energyWidth, energyHeight, imageEnergyPath, 1, 1, energyLocalPosition, undefined, undefined, undefined, undefined, undefined, () => {
//     imageEnergy.draw(scene);
// });
//
// const raceId = 2;
// const imageRacePath = `resource/battle_field_unit/race/${raceId}.png`;
//
// const raceWidth = 60;
// const raceHeight = raceWidth;
//
// const raceLocalPosition = new THREE.Vector2(cardWidth / 2, cardHeight / 2);
// const raceWeapon = new LegacyNonBackgroundImage(raceWidth, raceHeight, imageRacePath, 1, 1, raceLocalPosition, undefined, undefined, undefined, undefined, undefined, () => {
//     raceWeapon.draw(scene);
// });
//
// // 윈도우 크기가 변경될 때 카메라 및 렌더러 크기 조정
// window.addEventListener('resize', () => {
//     const newWidth = window.innerWidth;
//     const newHeight = window.innerHeight;
//     const newAspect = newWidth / newHeight;
//     camera.left = -newAspect * viewSize / 2;
//     camera.right = newAspect * viewSize / 2;
//     camera.top = viewSize / 2;
//     camera.bottom = -viewSize / 2;
//     camera.updateProjectionMatrix();
//
//     renderer.setSize(newWidth, newHeight);
// });
//
// // 애니메이션 루프 설정
// function animate() {
//     requestAnimationFrame(animate);
//
//     renderer.render(scene, camera);
// }
//
// animate();

import * as THREE from 'three';
import { ResourceManager } from "../../src/resouce_manager/ResourceManager";
import { LegacyBattleFieldUnit } from "../../src/battle/unit/entity/LegacyBattleFieldUnit";

// HTML 파일의 body 요소에 Three.js 캔버스를 렌더링
const container = document.body;

// 현재 창 크기를 가져옴
const width = window.innerWidth;
const height = window.innerHeight;

// Three.js를 사용하여 WebGL 렌더러 생성
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// Three.js를 사용하여 카메라 생성
const aspect = width / height;
const viewSize = height; // 보기 공간 크기 설정, 실제 창의 높이로 설정
const camera = new THREE.OrthographicCamera(
    -aspect * viewSize / 2, aspect * viewSize / 2,
    viewSize / 2, -viewSize / 2,
    0.1, 1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0); // 카메라가 원점(0, 0, 0)을 바라보도록 설정

// Three.js를 사용하여 씬 생성
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// ResourceManager 생성 및 경로 등록
const resourceManager = new ResourceManager();
resourceManager.registerBattleFieldUnitPath({
    cardPath: 'resource/battle_field_unit/card/{id}.png',
    weaponPath: 'resource/battle_field_unit/sword_power/{id}.png',
    hpPath: 'resource/battle_field_unit/hp/{id}.png',
    energyPath: 'resource/battle_field_unit/energy/{id}.png',
    racePath: 'resource/battle_field_unit/race/{id}.png'
});

// LegacyBattleFieldUnit 생성
const cardId = 19;
const weaponId = 40;
const hpId = 60;
const energyId = 3;
const raceId = 2;
const cardWidth = 150;
const cardHeight = cardWidth * 1.615;

const placedLocation = {
    card: new THREE.Vector2(0, 0),
    weapon: new THREE.Vector2(cardWidth / 2 - 8, -cardHeight / 2 + 8), // 상대 위치 조정
    hp: new THREE.Vector2(-cardWidth / 2, -cardHeight / 2 + 13), // 상대 위치 조정
    energy: new THREE.Vector2(-cardWidth / 2, cardHeight / 2), // 상대 위치 조정
    race: new THREE.Vector2(cardWidth / 2, cardHeight / 2) // 상대 위치 조정
};

const battleFieldUnit = new LegacyBattleFieldUnit(scene, resourceManager, cardId, weaponId, hpId, energyId, raceId, cardWidth, placedLocation);

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

// 애니메이션 루프 설정
function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();
