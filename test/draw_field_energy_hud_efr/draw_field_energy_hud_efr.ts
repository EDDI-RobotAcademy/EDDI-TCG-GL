import { CameraManager } from "../../src/core/camera/CameraManager";
import { RendererManager } from "../../src/core/renderer/RendererManager";
import { SceneManager } from "../../src/core/scene/SceneManager";
import { AnimationLoop } from "../../src/core/animation/AnimationLoop";

import { createBattleFieldBackgroundFrame } from "../../src/background/frame/BackgroundFrame";
import { BackgroundRendererV2 } from "../../src/background/renderer/BackgroundRendererV2";

import {
    createDefaultYourFieldAreaFrame,
    computeYourFieldAreaBounds,
} from "../../src/battle/field/your/area/frame/YourFieldAreaFrame";
import { YourFieldAreaRendererV2 } from "../../src/battle/field/your/area/renderer/YourFieldAreaRendererV2";
import {
    createDefaultPlacedCardPlacementFrame,
    computePlacedCardPosition,
} from "../../src/battle/field/your/area/frame/PlacedCardPlacementFrame";

import { BattleFieldHandMapRepositoryImpl } from "../../src/battle/hand/repository/BattleFieldHandMapRepositoryImpl";
import { HandCard } from "../../src/battle/hand/entity/HandCard";
import { createDefaultHandCardFrame } from "../../src/battle/hand/frame/HandCardFrame";
import {
    createDefaultBattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../../src/battle/hand/frame/BattleFieldHandLayoutFrame";
import { BattleFieldHandRendererV2 } from "../../src/battle/hand/renderer/BattleFieldHandRendererV2";
import { HandInteractionBridge } from "../../src/battle/hand/interaction/HandInteractionBridge";

import { getCardById } from "../../src/card/utility";
import { CardJob } from "../../src/card/job";
import { CardKind } from "../../src/card/kind";

import { createDefaultFieldEnergyHudFrame } from "../../src/battle/field_energy/your/frame/FieldEnergyHudFrame";
import { FieldEnergyHudRendererV2 } from "../../src/battle/field_energy/your/renderer/FieldEnergyHudRendererV2";
import { createDefaultFieldEnergyRaceHudFrame } from "../../src/battle/field_energy/your/frame/FieldEnergyRaceHudFrame";
import { FieldEnergyRaceHudRendererV2 } from "../../src/battle/field_energy/your/renderer/FieldEnergyRaceHudRendererV2";
import { createDefaultFieldEnergyCountHudFrame } from "../../src/battle/field_energy/your/frame/FieldEnergyCountHudFrame";
import { FieldEnergyCountHudRendererV2 } from "../../src/battle/field_energy/your/renderer/FieldEnergyCountHudRendererV2";

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
    const camera = cameraManager.createAndSetActiveCamera(aspectRatio, viewSize);

    const scene = sceneManager.createScene('draw-field-energy-hud-efr');

    // Pilot A — background + your field area
    const backgroundFrame = createBattleFieldBackgroundFrame();
    const backgroundRenderer = new BackgroundRendererV2();
    const backgroundGroup = await backgroundRenderer.build(backgroundFrame);
    scene.add(backgroundGroup);

    const yourFieldAreaFrame = createDefaultYourFieldAreaFrame();
    const yourFieldAreaRenderer = new YourFieldAreaRendererV2();
    const yourFieldAreaGroup = await yourFieldAreaRenderer.build(yourFieldAreaFrame);
    scene.add(yourFieldAreaGroup);

    // Pilot B — hand row
    const placementFrame = createDefaultPlacedCardPlacementFrame();

    const handCardIds = BattleFieldHandMapRepositoryImpl.getInstance().getBattleFieldHandList();
    const hand = resolveHandCards(handCardIds);

    const handCardFrame = createDefaultHandCardFrame();
    const handLayoutFrame = createDefaultBattleFieldHandLayoutFrame();
    const handRenderer = new BattleFieldHandRendererV2();
    const handGroup = await handRenderer.build(hand, handCardFrame, handLayoutFrame);
    scene.add(handGroup);

    const entries = handRenderer.getEntries(handGroup);

    const handOrder: number[] = entries.map((e) => e.card.cardId);
    const placedOrder: number[] = [];

    const getEntryByCardId = (cardId: number) =>
        entries.find((e) => e.card.cardId === cardId);

    const reflowAll = (): void => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        handOrder.forEach((cardId, index) => {
            const entry = getEntryByCardId(cardId);
            if (!entry) return;
            const { x, y } = computeHandCardCenter(handLayoutFrame, index, w, h);
            entry.group.position.set(x, y, 0);
        });

        placedOrder.forEach((cardId, index) => {
            const entry = getEntryByCardId(cardId);
            if (!entry) return;
            const { x, y } = computePlacedCardPosition(placementFrame, index, w, h);
            entry.group.position.set(x, y, 0);
        });
    };

    const animationLoop = new AnimationLoop(rendererManager, sceneManager, cameraManager);
    animationLoop.start();

    // Pilot C — click / drag / drop with multi-slot field + hand reflow
    const bridge = new HandInteractionBridge(
        rendererManager.getDomElement(),
        camera,
        scene,
        {
            onPickup: (_entityId, group) => {
                group.renderOrder = 100;
                group.position.z = 1;
            },
            onDrop: (entityId, group, worldX, worldY) => {
                group.renderOrder = 0;
                group.position.z = 0;

                const bounds = computeYourFieldAreaBounds(
                    yourFieldAreaFrame,
                    window.innerWidth,
                    window.innerHeight,
                );
                const inside =
                    worldX >= bounds.minX && worldX <= bounds.maxX &&
                    worldY >= bounds.minY && worldY <= bounds.maxY;

                // Legacy MouseDropHandler only lands UNIT cards on the field — ITEM/ENERGY/
                // SUPPORT/TRAP/TOOL/ENVIRONMENT/TOKEN are no-ops and snap back to hand.
                const handIndex = handOrder.indexOf(entityId);
                const droppedEntry = getEntryByCardId(entityId);
                const isUnit = droppedEntry?.card.cardKind === CardKind.UNIT;
                if (inside && handIndex >= 0 && isUnit) {
                    handOrder.splice(handIndex, 1);
                    placedOrder.push(entityId);
                }

                reflowAll();
            },
        },
    );
    bridge.attach();

    // Pilot D-1 — field-energy HUD overlays (new)
    const energyFrame = createDefaultFieldEnergyHudFrame();
    const energyRenderer = new FieldEnergyHudRendererV2(7);
    const energyElement = await energyRenderer.build(energyFrame);
    document.body.appendChild(energyElement);

    const raceFrame = createDefaultFieldEnergyRaceHudFrame(1);
    const raceRenderer = new FieldEnergyRaceHudRendererV2();
    const raceElement = await raceRenderer.build(raceFrame);
    document.body.appendChild(raceElement);

    const countFrame = createDefaultFieldEnergyCountHudFrame();
    const countRenderer = new FieldEnergyCountHudRendererV2(1);
    const countElement = await countRenderer.build(countFrame);
    document.body.appendChild(countElement);

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        cameraManager.updateAspect(width, height);
        rendererManager.resize(width, height);
        backgroundRenderer.resize(backgroundFrame, backgroundGroup, width, height);
        yourFieldAreaRenderer.resize(yourFieldAreaFrame, yourFieldAreaGroup, width, height);

        const cardRenderer = handRenderer.getCardRenderer();
        for (const entry of entries) {
            cardRenderer.resize(handCardFrame, entry.group);
        }
        reflowAll();

        energyRenderer.update(energyFrame, energyElement, width, height);
        raceRenderer.update(raceFrame, raceElement, width, height);
        countRenderer.update(countFrame, countElement, width, height);
    });
}

main(rootElement).catch((error) => {
    console.error('draw_field_energy_hud_efr failed to start:', error);
});
