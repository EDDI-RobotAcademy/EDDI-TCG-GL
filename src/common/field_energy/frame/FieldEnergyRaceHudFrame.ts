// Frame for the race-icon HUD element sitting above the field-energy button. Mirrors
// showFieldEnergyRace() in src/common/card_race/CardRace.ts:
//   container: top 72.1%, left 92.35%, width 3.4%
//   image:     resource/card_race/<raceId>.png  (originally via TextureManager "race" category)

export interface FieldEnergyRaceHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly zIndex: string;
    readonly imageSrcTemplate: string;
    readonly raceId: number;
}

export function createDefaultFieldEnergyRaceHudFrame(raceId: number = 1): FieldEnergyRaceHudFrame {
    return {
        topPercent: '72.1%',
        leftPercent: '92.35%',
        widthPercent: '3.4%',
        zIndex: '1000',
        imageSrcTemplate: 'resource/card_race/{id}.png',
        raceId,
    };
}

export function resolveFieldEnergyRaceImageSrc(frame: FieldEnergyRaceHudFrame): string {
    return frame.imageSrcTemplate.replace('{id}', String(frame.raceId));
}
