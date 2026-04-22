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
        lineThickness: 18,
        timeIncrement: 0.015,
        zOffset: 0.001,
    };
}

export function createEnemyNeonBorderFrame(): NeonBorderFrame {
    return {
        baseColor: 0xFF1A1A,
        glowColor: 0xFFEF7F,
        lineThickness: 18,
        timeIncrement: 0.015,
        zOffset: 0.001,
    };
}

// Green neon for ALLY-targeting items (e.g. 사기 전환) — highlights the player's OWN field
// units as valid drop targets. Distinct from createAllyNeonBorderFrame (blue) which signals
// "this is the currently-selected ally card", not "this is a potential target".
export function createAllyTargetingNeonBorderFrame(): NeonBorderFrame {
    return {
        baseColor: 0x22AA44,
        glowColor: 0xA8FFB0,
        lineThickness: 18,
        timeIncrement: 0.015,
        zOffset: 0.001,
    };
}
