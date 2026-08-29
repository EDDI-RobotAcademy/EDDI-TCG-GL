// Pure domain mirror of YourLostZone — ordered list of cardIds currently in the player's
// tomb/graveyard. Insertion order is preserved (most recently buried at the end).
export interface YourTomb {
    readonly cardIds: readonly number[];
}
