// Frame for the energy-count number rendered just above the field-energy button.
// Fixed-size box matching the Race icon dimensions so the neon glow stays consistent
// regardless of the displayed number.

export interface FieldEnergyCountHudFrame {
    readonly topPercent: string;
    readonly leftPercent: string;
    readonly widthPercent: string;
    readonly transform: string;
    readonly zIndex: string;
    readonly color: string;
    readonly fontWeight: string;
    readonly baseViewportHeight: number;
    readonly baseFontSize: number;
}

export function createDefaultFieldEnergyCountHudFrame(): FieldEnergyCountHudFrame {
    return {
        topPercent: '65.5%',
        leftPercent: '94.05%',
        widthPercent: '3.4%',
        transform: 'translate(-50%, -50%)',
        zIndex: '1000',
        color: '#fff',
        fontWeight: 'bold',
        baseViewportHeight: 1080,
        baseFontSize: 42,
    };
}
