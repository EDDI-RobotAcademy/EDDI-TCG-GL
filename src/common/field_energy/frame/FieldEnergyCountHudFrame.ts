// Frame for the energy-count number rendered just above the field-energy button. Mirrors
// showFieldEnergyCount() in src/common/field_energy/FieldEnergyCount.ts:
//   display: top 65%, left 94.0%, transform translate(-50%, -50%)
//   font:    baseFontSize 42 at baseViewportHeight 1080, color #fff, bold

export interface FieldEnergyCountHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly transform: string;
    readonly zIndex: string;
    readonly color: string;
    readonly fontWeight: string;
    readonly baseViewportHeight: number;
    readonly baseFontSize: number;
}

export function createDefaultFieldEnergyCountHudFrame(): FieldEnergyCountHudFrame {
    return {
        topPercent: '65%',
        leftPercent: '94.0%',
        transform: 'translate(-50%, -50%)',
        zIndex: '1000',
        color: '#fff',
        fontWeight: 'bold',
        baseViewportHeight: 1080,
        baseFontSize: 42,
    };
}
