import * as THREE from 'three';
import { ResourceManager } from "../../src/resouce_manager/ResourceManager";
import { LegacyBattleFieldUnit } from "../../src/battle_field_unit/entity/LegacyBattleFieldUnit";
import {LegacyNonBackgroundImage} from "../../src/shape/image/LegacyNonBackgroundImage";

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

const backgroundImagePath = 'resource/shop_image/shop_background.png'
const backgroundWidth = viewSize * aspect
const backgroundHeight = viewSize
const background = new LegacyNonBackgroundImage(backgroundWidth, backgroundHeight, backgroundImagePath, 1, 1, new THREE.Vector2(0, 0), undefined, undefined, undefined, undefined, undefined, () => {
    background.draw(scene)

    createBattleFieldUnit()
})

const resourceManager = new ResourceManager();
resourceManager.registerBattleFieldUnitPath({
    cardPath: 'resource/battle_field_unit/card/{id}.png',
    weaponPath: 'resource/battle_field_unit/sword_power/{id}.png',
    hpPath: 'resource/battle_field_unit/hp/{id}.png',
    energyPath: 'resource/battle_field_unit/energy/{id}.png',
    racePath: 'resource/battle_field_unit/race/{id}.png'
});

function createBattleFieldUnit () {
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
}

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
