import * as THREE from "three";

import { HandCard } from "../entity/HandCard";
import { HandCardFrame } from "../frame/HandCardFrame";
import {
    BattleFieldHandLayoutFrame,
    computeHandCardCenter,
} from "../frame/BattleFieldHandLayoutFrame";
import { HandCardRendererV2 } from "./HandCardRendererV2";

export interface HandEntry {
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

    // Appends a single card to an already-built hand group and registers it in userData.entries.
    // Position is left at (0,0) — the caller is responsible for reflowing hand/placed slots after.
    public async appendCard(
        handGroup: THREE.Group,
        card: HandCard,
        cardFrame: HandCardFrame,
    ): Promise<HandEntry> {
        const { entries } = handGroup.userData as HandUserData;
        const cardGroup = await this.cardRenderer.build(card, cardFrame);
        handGroup.add(cardGroup);
        const entry: HandEntry = { card, cardIndex: entries.length, group: cardGroup };
        entries.push(entry);
        return entry;
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

    public getEntries(handGroup: THREE.Group): readonly HandEntry[] {
        return (handGroup.userData as HandUserData).entries;
    }

    public getCardRenderer(): HandCardRendererV2 {
        return this.cardRenderer;
    }
}
