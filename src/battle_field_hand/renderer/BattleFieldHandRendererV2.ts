import * as THREE from "three";

import { HandCard } from "../entity/HandCard";
import { HandCardFrame } from "../frame/HandCardFrame";
import {
    BattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../frame/BattleFieldHandLayoutFrame";
import { HandCardRendererV2 } from "./HandCardRendererV2";

interface HandEntry {
    card: HandCard;
    cardIndex: number;
    group: THREE.Group;
}

interface HandUserData {
    entries: HandEntry[];
}

// Composes per-card Groups along a row. The outer Group is positioned at world origin;
// each child Group is positioned at its computed hand-slot center.
export class BattleFieldHandRendererV2 {
    constructor(private readonly cardRenderer: HandCardRendererV2 = new HandCardRendererV2()) {}

    public async build(
        hand: readonly HandCard[],
        cardFrame: HandCardFrame,
        layout: BattleFieldHandLayoutFrame,
    ): Promise<THREE.Group> {
        const handGroup = new THREE.Group();
        const entries: HandEntry[] = [];

        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let cardIndex = 0; cardIndex < hand.length; cardIndex++) {
            const card = hand[cardIndex];
            const cardGroup = await this.cardRenderer.build(card, cardFrame);

            const { x, y } = computeHandCardCenter(layout, cardIndex, w, h);
            cardGroup.position.set(x, y, 0);

            handGroup.add(cardGroup);
            entries.push({ card, cardIndex, group: cardGroup });
        }

        const userData: HandUserData = { entries };
        handGroup.userData = userData;
        return handGroup;
    }

    public resize(
        cardFrame: HandCardFrame,
        layout: BattleFieldHandLayoutFrame,
        handGroup: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const { entries } = handGroup.userData as HandUserData;
        for (const entry of entries) {
            const { x, y } = computeHandCardCenter(layout, entry.cardIndex, viewportWidth, viewportHeight);
            entry.group.position.set(x, y, 0);
            this.cardRenderer.resize(cardFrame, entry.group);
        }
    }

    public dispose(handGroup: THREE.Group): void {
        const { entries } = handGroup.userData as HandUserData;
        for (const entry of entries) {
            this.cardRenderer.dispose(entry.group);
        }
        handGroup.clear();
    }
}
