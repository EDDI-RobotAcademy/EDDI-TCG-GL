// Per-card frame for hand rendering. All offsets are proportional to the card's own width/height:
//   cardWidth  = cardWidthRatio * window.innerWidth
//   cardHeight = cardWidth * cardAspect
//   slot X      = offsetXRatio * cardWidth   (from the card's local origin = card center)
//   slot Y      = offsetYRatio * cardHeight
//   slot width  = widthRatio * cardWidth
//   slot height = slot width * slot.aspect
//
// These match BattleFieldHandServiceImpl.calculate*Position / create*Mesh exactly.
// Staff aspect/offset differ from weapon, so a staff-cast MAGICIAN looks identical to the legacy path.

export interface HandCardSlot {
    readonly widthRatio: number;
    readonly aspect: number;
    readonly offsetXRatio: number;
    readonly offsetYRatio: number;
    readonly renderOrder: number;
}

export interface HandCardFrame {
    readonly cardWidthRatio: number;
    readonly cardAspect: number;
    readonly slots: {
        readonly weapon: HandCardSlot;
        readonly staff: HandCardSlot;
        readonly kinds: HandCardSlot;
        readonly race: HandCardSlot;
        readonly hp: HandCardSlot;
        readonly energy: HandCardSlot;
    };
}

export function createDefaultHandCardFrame(): HandCardFrame {
    return {
        cardWidthRatio: 0.06493506493,
        cardAspect: 1.615,
        slots: {
            weapon: { widthRatio: 0.63, aspect: 1.651,    offsetXRatio:  0.44, offsetYRatio: -0.45666, renderOrder: 2 },
            staff:  { widthRatio: 0.63, aspect: 1.9353,   offsetXRatio:  0.54, offsetYRatio: -0.30666, renderOrder: 2 },
            kinds:  { widthRatio: 0.4,  aspect: 1,        offsetXRatio:  0.5,  offsetYRatio: -0.5,     renderOrder: 2 },
            race:   { widthRatio: 0.4,  aspect: 1,        offsetXRatio:  0.5,  offsetYRatio:  0.5,     renderOrder: 2 },
            hp:     { widthRatio: 0.31, aspect: 1.65454,  offsetXRatio: -0.5,  offsetYRatio: -0.43438, renderOrder: 2 },
            energy: { widthRatio: 0.39, aspect: 1.344907, offsetXRatio: -0.5,  offsetYRatio:  0.5,     renderOrder: 2 },
        },
    };
}
