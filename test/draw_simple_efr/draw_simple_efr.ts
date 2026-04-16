import { Vector2d } from "../../src/common/math/Vector2d";
import { CameraManager } from "../../src/core/camera/CameraManager";
import { RendererManager } from "../../src/core/renderer/RendererManager";
import { SceneManager } from "../../src/core/scene/SceneManager";
import { AnimationLoop } from "../../src/core/animation/AnimationLoop";
import { ResourceManager } from "../../src/resouce_manager/ResourceManager";
import { BattleFieldUnit } from "../../src/battle_field_unit/entity/BattleFieldUnit";
import { createDefaultUnitFrame } from "../../src/battle_field_unit/frame/UnitFrame";
import { BattleFieldUnitRendererV2 } from "../../src/battle_field_unit/renderer/BattleFieldUnitRendererV2";

const rootElement = document.getElementById('app');
if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

async function main(container: HTMLElement): Promise<void> {
    const rendererManager = new RendererManager(container);
    const sceneManager = new SceneManager();
    const cameraManager = CameraManager.getInstance();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = window.innerHeight;
    cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

    const scene = sceneManager.createScene('draw-simple-efr');

    const resourceManager = new ResourceManager();
    resourceManager.registerBattleFieldUnitPath({
        cardPath: 'resource/battle_field_unit/card/{id}.png',
        weaponPath: 'resource/battle_field_unit/sword_power/{id}.png',
        hpPath: 'resource/battle_field_unit/hp/{id}.png',
        energyPath: 'resource/battle_field_unit/energy/{id}.png',
        racePath: 'resource/card_race/{id}.png',
    });

    const entity = new BattleFieldUnit(
        19,
        1,
        1,
        2,
        1,
        new Vector2d(0, 0),
    );

    const frame = createDefaultUnitFrame(window.innerWidth * 0.1);
    const renderer = new BattleFieldUnitRendererV2(resourceManager);
    const unitGroup = await renderer.build(entity, frame);
    scene.add(unitGroup);

    const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
    animationLoop.start();

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        cameraManager.updateAspect(width, height);
        rendererManager.resize(width, height);
    });
}

main(rootElement).catch((error) => {
    console.error('draw_simple_efr failed to start:', error);
});
