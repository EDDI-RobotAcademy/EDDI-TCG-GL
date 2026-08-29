// Pure domain — no THREE.* imports. An ordered list of cardIds that have been sent to
// the player's Lost Zone (cards removed from play by effects like energy burn, scythe,
// etc.). Order is insertion order: most recently lost at the end.
export interface YourLostZone {
    readonly cardIds: readonly number[];
}
