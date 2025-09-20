import {DeckCardSearchStateInDeckEditMode} from "../entity/DeckCardSearchStateInDeckEditMode";

export interface DeckCardSearchInputEnterDetectService {
    onKeyDown(event: KeyboardEvent): void;
    getDeckEditSearchState(): DeckCardSearchStateInDeckEditMode;
    getMatchedOwnedCardIdList(): number[];
}
