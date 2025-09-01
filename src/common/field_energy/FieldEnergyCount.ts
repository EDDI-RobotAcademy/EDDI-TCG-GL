export function showFieldEnergyCount(energyCount: number = 1) {
    const existing = document.getElementById("battle-field-energy-count");
    if (existing) existing.remove();

    const numberDisplay = document.createElement("div");
    numberDisplay.id = "battle-field-energy-count";
    numberDisplay.style.position = "fixed";
    numberDisplay.style.top = "65%";
    numberDisplay.style.left = "94.0%";
    numberDisplay.style.transform = "translate(-50%, -50%)"; // 정확히 중앙 맞춤
    numberDisplay.style.color = "#fff";
    numberDisplay.style.fontWeight = "bold";
    numberDisplay.style.zIndex = "1000";
    numberDisplay.style.pointerEvents = "none";

    // 폰트 크기 계산 (화면 높이에 비례)
    const baseHeight = 1080;
    const baseFontSize = 42;
    numberDisplay.style.fontSize = `${(window.innerHeight / baseHeight) * baseFontSize}px`;

    numberDisplay.innerText = String(energyCount);

    document.body.appendChild(numberDisplay);
}

export function updateFieldEnergyCount(energyCount: number) {
    const numberDisplay = document.getElementById("battle-field-energy-count");
    if (numberDisplay) {
        numberDisplay.innerText = String(energyCount);
    }
}
