import { MyDeckButton } from "../my_deck_button/entity/MyDeckButton";
import {MyDeckButtonRepositoryImpl} from "../my_deck_button/repository/MyDeckButtonRepositoryImpl";
import {MyDeckButtonClickDetectRepositoryImpl} from "../deck_button_click_detect/repository/MyDeckButtonClickDetectRepositoryImpl";

export class ButtonStateManager {
    private static instance: ButtonStateManager | null = null;
    private buttonVisibilityState: Map<number, boolean> = new Map(); // 버튼의 visibility 상태를 저장하는 Map
    private buttonClickCount: number;
    private myDeckButtonRepository: MyDeckButtonRepositoryImpl;
    private myDeckButtonClickDetectRepository: MyDeckButtonClickDetectRepositoryImpl;

    constructor() {
        this.buttonClickCount = 0;
        this.myDeckButtonRepository = MyDeckButtonRepositoryImpl.getInstance();
        this.myDeckButtonClickDetectRepository = MyDeckButtonClickDetectRepositoryImpl.getInstance();
    }

    public static getInstance(): ButtonStateManager {
        if (!ButtonStateManager.instance) {
            ButtonStateManager.instance = new ButtonStateManager();
        }
        return ButtonStateManager.instance;
    }

    public initializeButtonState(): void {
        const deckIdList = this.myDeckButtonRepository.findButtonDeckIdList();
        const allButtonMesh = this.myDeckButtonRepository.findAll();
        const firstButtonDeckId = deckIdList[0];

        deckIdList.forEach((deckId, index) => {
            this.buttonVisibilityState.set(deckId, index > 0);
        });

        allButtonMesh.forEach((button, index) => {
            button.getMesh().visible = index > 0;
        });

        this.myDeckButtonClickDetectRepository.saveCurrentClickDeckButtonId(firstButtonDeckId);
    }

    public setButtonVisibility(deckId: number, isVisible: boolean): void {
        this.buttonVisibilityState.set(deckId, isVisible);
        if (isVisible == true) {
            this.myDeckButtonRepository.showButton(deckId);
        } else {
            this.myDeckButtonRepository.hideButton(deckId);
        }
    }

    public findButtonVisibility(deckId: number): boolean {
        return this.buttonVisibilityState.get(deckId) || false;
    }

    // 모든 버튼의 상태를 초기화
    public resetVisibility(): void {
        this.buttonVisibilityState.clear();  // 모든 상태를 초기화
    }

    public getButtonClickCount(): number {
        return this.buttonClickCount;
    }

    public setButtonClickCount(clickCount: number): void {
        this.buttonClickCount = clickCount;
    }

    public resetButtonClickCount(): void {
        this.buttonClickCount = 0;
    }
}
