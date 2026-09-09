import * as THREE from "three";

import { CardFace } from "../../../hand/entity/CardFace";
import { HandCardFrame } from "../../../hand/frame/HandCardFrame";
import { HandCardRendererV2 } from "../../../hand/renderer/HandCardRendererV2";
import {
    OpponentFieldLayoutFrame,
    computeOpponentFieldCardCenter,
} from "../frame/OpponentFieldLayoutFrame";

interface OpponentFieldEntry {
    card: CardFace;
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
        cards: readonly CardFace[],
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

    // 필드에 남아 있는 카드를 앞에서부터 차례로 세운다.
    //
    // 어느 자리에 서는지는 [필드에 몇 번째로 남아 있는가] 로 정해진다. 처음 나온 순서가
    // 아니다. 가운데 것이 죽으면 뒤의 것이 한 칸 당겨 서야 하기 때문이다. 그래서 살아 있는
    // 카드의 번호를 순서대로 받는다.
    //
    // 죽은 카드는 안 보이게만 하고 지우지 않는다. 부활로 다시 설 수 있다.
    public layout(
        layout: OpponentFieldLayoutFrame,
        opponentGroup: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
        aliveCardIndexes: readonly number[],
    ): void {
        const { entries } = opponentGroup.userData as OpponentFieldUserData;
        for (const entry of entries) {
            const aliveIndex = aliveCardIndexes.indexOf(entry.cardIndex);
            if (aliveIndex < 0) {
                entry.group.visible = false;
                continue;
            }
            const { x, y } = computeOpponentFieldCardCenter(
                layout,
                aliveIndex,
                viewportWidth,
                viewportHeight,
            );
            entry.group.position.set(x, y, 0);
            entry.group.visible = true;
        }
    }

    // 창 크기가 바뀌었을 때. 카드 크기를 다시 잰 다음 다시 세운다.
    //
    // 죽어서 안 보이는 카드도 크기는 다시 잰다. 부활해서 다시 섰을 때 혼자 옛 크기로
    // 남지 않게 하기 위해서다.
    public resize(
        cardFrame: HandCardFrame,
        layout: OpponentFieldLayoutFrame,
        opponentGroup: THREE.Group,
        viewportWidth: number,
        viewportHeight: number,
        aliveCardIndexes: readonly number[],
    ): void {
        const { entries } = opponentGroup.userData as OpponentFieldUserData;
        for (const entry of entries) {
            this.cardRenderer.resize(cardFrame, entry.group);
        }
        this.layout(layout, opponentGroup, viewportWidth, viewportHeight, aliveCardIndexes);
    }

    public dispose(opponentGroup: THREE.Group): void {
        const { entries } = opponentGroup.userData as OpponentFieldUserData;
        for (const entry of entries) {
            this.cardRenderer.dispose(entry.group);
        }
        opponentGroup.clear();
    }

    public getCardRenderer(): HandCardRendererV2 {
        return this.cardRenderer;
    }
}
