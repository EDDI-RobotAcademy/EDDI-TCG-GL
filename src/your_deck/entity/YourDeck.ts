// Pure data entity representing a player's draw pile.
// Order is the draw order: index 0 is the next card to be drawn.
export interface YourDeck {
    readonly cards: readonly number[];
}
