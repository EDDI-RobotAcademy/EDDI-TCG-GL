// Frame for the field-energy HUD element — a fixed-position container holding a background
// image and a centered numeric label. Mirrors showFieldEnergy() in src/battle/field_energy/your/FieldEnergy.ts:
//   container: top 82.4%, left 90.4%, width 7.2%
//   label:     baseFont 48 at baseViewportHeight 1080, verticalOffsetRatio 0.1
//   image:     resource/battle_field/field_energy/field_energy_button.png

export interface FieldEnergyHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly zIndex: string;
    readonly imageSrc: string;
    readonly labelColor: string;
    readonly labelFontFamily: string;
    readonly labelTextShadow: string;
    readonly baseViewportHeight: number;
    readonly baseFontSize: number;
    readonly labelVerticalOffsetRatio: number;
}

export function createDefaultFieldEnergyHudFrame(): FieldEnergyHudFrame {
    return {
        topPercent: '82.4%',
        leftPercent: '90.4%',
        widthPercent: '7.2%',
        zIndex: '1000',
        imageSrc: 'resource/battle_field/field_energy/field_energy_button.png',
        labelColor: '#222',
        labelFontFamily: "'Inter','Roboto','Helvetica','Arial',sans-serif",
        labelTextShadow: '0 1px 2px rgba(255,255,255,0.6)',
        baseViewportHeight: 1080,
        baseFontSize: 48,
        labelVerticalOffsetRatio: 0.1,
    };
}
