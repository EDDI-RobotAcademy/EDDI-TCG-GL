import {MyDeckButtonEffect} from "../my_deck_button_effect/entity/MyDeckButtonEffect";
import {MyDeckButtonEffectRepositoryImpl} from "../my_deck_button_effect/repository/MyDeckButtonEffectRepositoryImpl";

export class ButtonEffectManager {
    private static instance: ButtonEffectManager | null = null;
    private buttonEffectState: Map<number, boolean> = new Map();
    private myDeckButtonEffectRepository: MyDeckButtonEffectRepositoryImpl;

    constructor() {
        this.myDeckButtonEffectRepository = MyDeckButtonEffectRepositoryImpl.getInstance();
    }

    public static getInstance(): ButtonEffectManager {
        if (!ButtonEffectManager.instance) {
            ButtonEffectManager.instance = new ButtonEffectManager();
        }
        return ButtonEffectManager.instance;
    }

    public initializeEffectState(): void {
        const deckIdList = this.myDeckButtonEffectRepository.findEffectDeckIdList();
        deckIdList.forEach((deckId, index) => {
            if (index === 0) {
                this.setEffectVisibility(deckId, true);
            } else {
                this.setEffectVisibility(deckId, false);
            }
        });
    }

    public setEffectVisibility(deckId: number, isVisible: boolean): void {
        this.buttonEffectState.set(deckId, isVisible);
        if (isVisible == true) {
            this.myDeckButtonEffectRepository.showEffect(deckId);
        } else {
            this.myDeckButtonEffectRepository.hideEffect(deckId);
        }
    }

    public findVisibility(deckId: number): boolean {
        return this.buttonEffectState.get(deckId) ?? false;
    }

    public resetVisibility(): void {
        this.buttonEffectState.clear();
//         console.log(`[DEBUG] Reset all button visibility.`);
    }

}
