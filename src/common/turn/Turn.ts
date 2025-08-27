export function showTurn(turn: number = 1) {
    const existing = document.getElementById("battle-turn");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "battle-turn";
    container.style.position = "fixed";
    container.style.top = "34%";
    container.style.left = "86.4%";
    container.style.width = "13.6%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.zIndex = "1000";
    container.style.pointerEvents = "none";

    // 네모 박스 (그라데이션 배경)
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.padding = "12px";
    box.style.borderRadius = "6px";
    box.style.width = "100%";
    box.style.background = "linear-gradient(to right, rgba(255,255,255,0.2), rgba(139,69,19,0.3), rgba(0,0,0,0.2))";
    container.appendChild(box);

    // TURN 표시
    const turnDisplay = document.createElement("div");
    turnDisplay.style.color = "#fff";
    turnDisplay.style.fontSize = "32px";
    turnDisplay.style.fontWeight = "bold";
    turnDisplay.innerText = `TURN ${turn}`;
    box.appendChild(turnDisplay);

    document.body.appendChild(container);
}
