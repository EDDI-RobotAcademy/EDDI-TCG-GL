import * as THREE from 'three';
import { ResourceManager } from "../../src/resouce_manager/ResourceManager";
import {LegacyNonBackgroundImage} from "../../src/shape/image/LegacyNonBackgroundImage";
import {BattleFieldUnitScene} from "../../src/battle/unit/scene/BattleFieldUnitScene";
import {BattleFieldUnitRenderer} from "../../src/battle/unit/renderer/BattleFieldUnitRenderer";
import {BattleFieldUnitRepository} from "../../src/battle/unit/repository/BattleFieldUnitRepository";
import {Vector2d} from "../../src/common/math/Vector2d";
import {BattleFieldUnit} from "../../src/battle/unit/entity/BattleFieldUnit";
import {MouseController} from "../../src/mouse/MouseController";

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

unitRepository.addBattleFieldUnit(battleFieldUnit);
unitRenderer.render(renderer, camera);

// const mouseController = MouseController.getInstance(camera, scene);
const mouseController = new MouseController(camera!, scene!);

function ensureBackgroundIsBehind() {
    if (background.getMesh()) {
        unitScene.getScene().remove(background.getMesh());
        unitScene.getScene().add(background.getMesh());
    }
}

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

unitRenderer.animate(renderer, camera);
