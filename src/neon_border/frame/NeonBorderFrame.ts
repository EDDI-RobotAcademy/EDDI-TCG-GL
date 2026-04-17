export interface NeonBorderFrame {
    readonly baseColor: number;
    readonly glowColor: number;
    readonly lineThickness: number;
    readonly timeIncrement: number;
    readonly zOffset: number;
}

export function createAllyNeonBorderFrame(): NeonBorderFrame {
    return {
        baseColor: 0x2C75FF,
        glowColor: 0x2EFEF7,
        lineThickness: 5,
        timeIncrement: 0.015,
        zOffset: 0.001,
    };
}

export function createEnemyNeonBorderFrame(): NeonBorderFrame {
    return {
        baseColor: 0xFF1A1A,
        glowColor: 0xFFEF7F,
        lineThickness: 5,
        timeIncrement: 0.015,
        zOffset: 0.001,
    };
}
