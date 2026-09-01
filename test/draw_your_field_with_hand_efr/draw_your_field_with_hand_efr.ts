import { CameraManager } from "../../src/core/camera/CameraManager";
import { RendererManager } from "../../src/core/renderer/RendererManager";
import { SceneManager } from "../../src/core/scene/SceneManager";
import { AnimationLoop } from "../../src/core/animation/AnimationLoop";

import { createBattleFieldBackgroundFrame } from "../../src/background/frame/BackgroundFrame";
import { BackgroundRendererV2 } from "../../src/background/renderer/BackgroundRendererV2";

import { createDefaultYourFieldAreaFrame } from "../../src/battle/field/your/area/frame/YourFieldAreaFrame";
import { YourFieldAreaRendererV2 } from "../../src/battle/field/your/area/renderer/YourFieldAreaRendererV2";

import { BattleFieldHandMapRepositoryImpl } from "../../src/battle/hand/repository/BattleFieldHandMapRepositoryImpl";
import { HandCard } from "../../src/battle/hand/entity/HandCard";
import { createDefaultHandCardFrame } from "../../src/battle/hand/frame/HandCardFrame";
import { createDefaultBattleFieldHandLayoutFrame } from "../../src/battle/hand/frame/BattleFieldHandLayoutFrame";
import { BattleFieldHandRendererV2 } from "../../src/battle/hand/renderer/BattleFieldHandRendererV2";

import { getCardById } from "../../src/card/utility";
import { CardJob } from "../../src/card/job";
import { CardKind } from "../../src/card/kind";

const rootElement = document.getElementById('app');
if (!rootElement) {
    throw new Error("Cannot find element with id 'app'.");
}

function resolveHandCards(cardIds: number[]): HandCard[] {
    const hand: HandCard[] = [];
    for (const cardId of cardIds) {
        const card = getCardById(cardId);
        if (!card) {
            console.warn(`Card ${cardId} not found in every_card_info — skipping.`);
            continue;
        }
        hand.push({
            cardId,
            cardKind: parseInt(card.종류, 10) as CardKind,
            unitJob: parseInt(card.병종, 10) as CardJob,
            raceId: parseInt(card.종족, 10),
            hpId: card.체력,
            attackPowerId: card.공격력,
            kindId: parseInt(card.종류, 10),
            // No real energy-attachment data source in the pilot; default to 0 so the Renderer
            // skips the energy icon + number (see feedback_zero_value_visuals memory).
            energyCount: 0,
        });
    }
    return hand;
}

async function main(container: HTMLElement): Promise<void> {
    const rendererManager = new RendererManager(container);
    const sceneManager = new SceneManager();
    const cameraManager = CameraManager.getInstance();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = window.innerHeight;
    cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

    const scene = sceneManager.createScene('draw-your-field-with-hand-efr');

    const backgroundFrame = createBattleFieldBackgroundFrame();
    const backgroundRenderer = new BackgroundRendererV2();
    const backgroundGroup = await backgroundRenderer.build(backgroundFrame);
    scene.add(backgroundGroup);

    const yourFieldAreaFrame = createDefaultYourFieldAreaFrame();
    const yourFieldAreaRenderer = new YourFieldAreaRendererV2();
    const yourFieldAreaGroup = await yourFieldAreaRenderer.build(yourFieldAreaFrame);
    scene.add(yourFieldAreaGroup);

    const handCardIds = BattleFieldHandMapRepositoryImpl.getInstance().getBattleFieldHandList();
    const hand = resolveHandCards(handCardIds);

    const handCardFrame = createDefaultHandCardFrame();
    const handLayoutFrame = createDefaultBattleFieldHandLayoutFrame();
    const handRenderer = new BattleFieldHandRendererV2();
    const handGroup = await handRenderer.build(hand, handCardFrame, handLayoutFrame);
    scene.add(handGroup);

    const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
    animationLoop.start();

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        cameraManager.updateAspect(width, height);
        rendererManager.resize(width, height);
        backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height);
        yourFieldAreaRenderer.resize(yourFieldAreaFrame, yourFieldAreaGroup, width, height);
        handRenderer.resize(handCardFrame, handLayoutFrame, handGroup, width, height);
    });
}

main(rootElement).catch((error) => {
    console.error('draw_your_field_with_hand_efr failed to start:', error);
});
