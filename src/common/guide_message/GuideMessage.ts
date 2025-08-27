export function showGuideMessage(message: string, duration: number = 2000, topPercent: number = 50) {
    const existing = document.getElementById("guide-message");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.id = "guide-message";
    div.style.position = "fixed"; // 스크롤에도 중앙 고정
    div.style.top = `${topPercent}%`;
    div.style.left = "0"; // 전체 가로 차지
    div.style.width = "100%"; // 가로 전체
    div.style.transform = "translateY(-50%)"; // 세로만 중앙 정렬
    div.style.padding = "30px 0"; // 좌우는 자동으로 전체 차지
    div.style.background = "rgba(40, 40, 40, 0.9)";
    div.style.color = "#fff";
    div.style.borderRadius = "0"; // 전체 가로라면 테두리 둥글기 제거
    div.style.fontSize = "36px";
    div.style.fontWeight = "500";
    div.style.borderTop = "2px solid #00ffd0";
    div.style.borderBottom = "2px solid #00ffd0";
    div.style.boxShadow = "0 0 10px rgba(0, 255, 208, 0.6)";
    div.style.zIndex = "1000";
    div.style.pointerEvents = "none";
    div.style.textAlign = "center"; // 텍스트 중앙 정렬
    div.innerText = message;

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, duration);
}
