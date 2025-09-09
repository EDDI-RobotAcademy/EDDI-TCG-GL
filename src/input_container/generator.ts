export class InputContainerGenerator {
    public static createInputContainer(
        containerWidth: number,
        containerHeight: number,
        containerPosition: { top: number, left: number },
        inputWidth: number,
        inputHeight: number,
        inputFontSize: number,
        maxLength: number,
        placeholder?: string
    ): { container: HTMLDivElement; input: HTMLInputElement } {
        // 컨테이너 생성
        const inputContainer = document.createElement('div');
        inputContainer.style.position = 'absolute';
        inputContainer.style.top = `${containerPosition.top}px`;
        inputContainer.style.left = `${containerPosition.left}px`;
        inputContainer.style.width = `${containerWidth}px`;
        inputContainer.style.height = `${containerHeight}px`;
        inputContainer.style.zIndex = '10';
        inputContainer.style.display = 'none'; // 처음에는 보이지 않음 'none'

        // 입력창 생성
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        if (placeholder) {
            inputElement.placeholder = placeholder;
        }
        inputElement.style.width = `${inputWidth}px`;
        inputElement.style.height = `${inputHeight}px`;
        inputElement.style.fontSize = `${inputFontSize}px`;
        inputElement.style.padding = '12px';
        inputElement.style.outline = "none";
        inputElement.style.boxShadow = "none";

        inputElement.maxLength = maxLength;

        // 요소 컨테이너에 추가
        inputContainer.appendChild(inputElement);

        // 전체 컨테이너 반환
        document.body.appendChild(inputContainer);
        return { container: inputContainer, input: inputElement };
    }

    public static setContainerVisible(inputContainer: HTMLDivElement, displayState: 'block' | 'none'): void {
        inputContainer.style.display = displayState;
    }

    public static setInputStyle(
        inputContainer: HTMLDivElement,
        backgroundColor: string,
        borderStyle: string,
        textColor: string
    ): void {
        const inputElement = inputContainer.querySelector('input');
        if (inputElement) {
            inputElement.style.backgroundColor = backgroundColor;
            inputElement.style.border = borderStyle;
            inputElement.style.color = textColor;
        }
    }

}
