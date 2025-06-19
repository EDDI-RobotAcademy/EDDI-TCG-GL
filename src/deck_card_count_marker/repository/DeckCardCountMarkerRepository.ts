import * as THREE from 'three';
import {DeckCardCountMarker} from "../entity/DeckCardCountMarker";
import {Vector2d} from "../../common/math/Vector2d";

export interface DeckCardCountMarkerRepository {
    createDeckCardCountMarker(deckId: number, cardId: number, position: Vector2d): Promise<DeckCardCountMarker>;
    findMarkerByMarkerId(markerId: number): DeckCardCountMarker | null;
    findMarkerListByDeckId(deckId: number): DeckCardCountMarker[] | null;
    deleteMarkerByDeckIdAndMarkerId(deckId: number, markerId: number): void;
    deleteAllMarker(): void;
}