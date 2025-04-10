import {BuildDeckButton} from "../build_deck_button/entity/BuildDeckButton";
import {BuildDeckButtonRepositoryImpl} from "../build_deck_button/repository/BuildDeckButtonRepositoryImpl";

export class BuildDeckButtonStateManager {
    private static instance: BuildDeckButtonStateManager | null = null;
    private buildDeckButtonRepository: BuildDeckButtonRepositoryImpl;
    private buttonVisibilityState: Map<number, boolean>;

    constructor() {
        this.buildDeckButtonRepository = BuildDeckButtonRepositoryImpl.getInstance();
        this.buttonVisibilityState = new Map();
    }

    public static getInstance(): BuildDeckButtonStateManager {
        if (!BuildDeckButtonStateManager.instance) {
            BuildDeckButtonStateManager.instance = new BuildDeckButtonStateManager();
        }
        return BuildDeckButtonStateManager.instance;
    }

    public initializeButtonVisibility(): void {
        this.setVisibility(0, true);
        this.setVisibility(1, false);
    }

    public setVisibility(buttonId: number, isVisible: boolean): void {
        this.buttonVisibilityState.set(buttonId, isVisible);
        if (isVisible == true) {
            this.buildDeckButtonRepository.showButton(buttonId);
        } else {
            this.buildDeckButtonRepository.hideButton(buttonId);
        }
    }

    public findVisibility(buttonId: number): boolean {
        return this.buttonVisibilityState.get(buttonId) || false;
    }

    public resetVisibility(): void {
        this.buttonVisibilityState.clear();
    }

}
