import {MyDeckOwnedCards} from "../../my_deck_owned_cards/entity/MyDeckOwnedCards";
import * as THREE from "three";

export interface MyDeckOwnedCardsClickDetectRepository {
    isMyDeckOwnedCardsClicked(clickPoint: { x: number; y: number },
                          cardList: MyDeckOwnedCards[],
                          camera: THREE.Camera): any | null;
}