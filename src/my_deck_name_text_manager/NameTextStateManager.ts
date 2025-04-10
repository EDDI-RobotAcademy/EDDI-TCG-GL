import {MyDeckNameText} from "../my_deck_name_text/entity/MyDeckNameText";
import {MyDeckNameTextRepositoryImpl} from"../my_deck_name_text/repository/MyDeckNameTextRepositoryImpl";

export class NameTextStateManager {
    private static instance: NameTextStateManager | null = null;
    private myDeckNameTextRepository: MyDeckNameTextRepositoryImpl;
    private textVisibilityState: Map<number, boolean>;

    constructor() {
        this.myDeckNameTextRepository = MyDeckNameTextRepositoryImpl.getInstance();
        this.textVisibilityState = new Map();
    }

    public static getInstance(): NameTextStateManager {
        if (!NameTextStateManager.instance) {
            NameTextStateManager.instance = new NameTextStateManager();
        }
        return NameTextStateManager.instance;
    }

    // 나중에 덱 이름 텍스트도 덱 버튼 클릭되었을 때와 안 되었을 때 구분하면 적용하기
    // 구분 안 하면 해당 메서드 삭제
    public initializeTextVisibility(): void {
        const nameTextIdList = this.myDeckNameTextRepository.findAllNameTextIdList();
        nameTextIdList.forEach((textId, index) => {
            if (index > 0) {
                this.textVisibilityState.set(textId, true);
                this.myDeckNameTextRepository.showText(textId);
            } else {
                this.textVisibilityState.set(textId, false);
                this.myDeckNameTextRepository.hideText(textId);
            }
        });
    }

    public setVisibility(textId: number, isVisible: boolean): void {
        this.textVisibilityState.set(textId, isVisible);
        if (isVisible == true) {
            this.myDeckNameTextRepository.showText(textId);
        } else {
           this.myDeckNameTextRepository.hideText(textId);
        }
    }

    public findVisibility(textId: number): boolean {
        return this.textVisibilityState.get(textId) || false;
    }

    public resetVisibility(): void {
        this.textVisibilityState.clear();
    }

}
