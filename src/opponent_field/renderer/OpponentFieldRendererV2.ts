import * as THREE from "three";

import { HandCard } from "../../battle_field_hand/entity/HandCard";
import { HandCardFrame } from "../../battle_field_hand/frame/HandCardFrame";
import { HandCardRendererV2 } from "../../battle_field_hand/renderer/HandCardRendererV2";
import {
    OpponentFieldLayoutFrame,
    computeOpponentFieldCardCenter,
} from "../frame/OpponentFieldLayoutFrame";

interface OpponentFieldEntry {
    card: HandCard;
    cardIndex: number;
    group: THREE.Group;
}

interface OpponentFieldUserData {
    entries: OpponentFieldEntry[];
}

// Reuses HandCardRendererV2 for per-card rendering (card + slots). The opponent card has the
// same visual composition as a hand card in legacy, so no new renderer is needed — just a
// different parent layout.
//
// Opponent cards MUST NOT trigger hand-drag interactions: HandInteractionBridge walks up from
// a raycaster hit looking for `userData.entityId`. HandCardRendererV2 sets that field on each
// card group; we strip it here so the bridge skips opponent cards during pickup.
export class OpponentFieldRendererV2 {
    constructor(private readonly cardRenderer: HandCardRendererV2 = new HandCardRendererV2()) {}

    public async build(
        cards: readonly HandCard[],
        cardFrame: HandCardFrame,
        layout: OpponentFieldLayoutFrame,
    ): Promise<THREE.Group> {
        const opponentGroup = new THREE.Group();
        const entries: OpponentFieldEntry[] = [];

        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            const card = cards[cardIndex];
            const cardGroup = await this.cardRenderer.build(card, cardFrame);

            // Detach from input pipeline — opponent cards are display-only in this pilot.
            delete (cardGroup.userData as { entityId?: unknown }).entityId;

            const { x, y } = computeOpponentFieldCardCenter(layout, cardIndex, w, h);
            cardGroup.position.set(x, y, 0);

            opponentGroup.add(cardGroup);
            entries.push({ card, cardIndex, group: cardGroup });
        }

        const userData: OpponentFieldUserData = { entries };
        opponentGroup.userData = userData;
        return opponentGroup;
    }

    public resize(
        cardFrame: HandCardFrame,
        layout: OpponentFieldLayoutFrame,
        opponentGroup: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
    ): void {
        const { entries } = opponentGroup.userData as OpponentFieldUserData;
        for (const entry of entries) {
            this.cardRenderer.resize(cardFrame, entry.group);
            const { x, y } = computeOpponentFieldCardCenter(
                layout,
                entry.cardIndex,
                viewportWidth,
                viewportHeight,
            );
            entry.group.position.set(x, y, 0);
        }
    }

    public dispose(opponentGroup: THREE.Group): void {
        const { entries } = opponentGroup.userData as OpponentFieldUserData;
        for (const entry of entries) {
            this.cardRenderer.dispose(entry.group);
        }
        opponentGroup.clear();
    }
}
