// Pure domain mirror of YourDeck — ordered list of cardIds remaining in the opponent's
// draw pile. In production this will be driven by the network server (the server is the
// authority on opponent deck state); the repository just holds whatever snapshot the
// client has been handed.
export interface OpponentDeck {
    readonly cards: readonly number[];
}
