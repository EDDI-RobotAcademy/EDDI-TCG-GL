// Pure domain — whose turn it is right now.
export type TurnOwner = 'your' | 'opponent';

export interface TurnState {
    readonly owner: TurnOwner;
}
