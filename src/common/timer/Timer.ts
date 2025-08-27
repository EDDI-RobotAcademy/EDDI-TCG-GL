export function showSandTimer(duration: number = 60) {
    const existing = document.getElementById("battle-timer");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "battle-timer";
    container.style.position = "fixed";
    container.style.top = "26%";
    container.style.left = "86.4%";
    container.style.width = "13.6%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.zIndex = "1000";
    container.style.pointerEvents = "none";

    // 네모 박스
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center"; // 박스 안에서 중앙 정렬
    box.style.padding = "8px";
    box.style.borderRadius = "6px";
    box.style.width = "100%";
    box.style.background = "linear-gradient(to right, rgba(255,255,255,0.2), rgba(139,69,19,0.3), rgba(0,0,0,0.2))";
    container.appendChild(box);

    // 모래시계 캔버스
    const canvas = document.createElement("canvas");
    canvas.width = 30;
    canvas.height = 60;
    box.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;

    // 숫자 표시 div (모래시계 옆)
    const timeDisplay = document.createElement("div");
    timeDisplay.style.color = "#fff";
    timeDisplay.style.fontSize = "32px";
    timeDisplay.style.fontWeight = "bold";
    timeDisplay.style.marginLeft = "12px"; // 옆으로 공간 확보
    box.appendChild(timeDisplay);

    document.body.appendChild(container);

    interface Grain { x: number; y: number; radius: number; speed: number; }
    const grains: Grain[] = [];
    const maxGrains = 60;
    let elapsed = 0;
    const neckY = canvas.height / 2;

    function cubicBezier(p0:number, p1:number, p2:number, p3:number, t:number) {
        const mt = 1-t;
        return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
    }

    function drawFrame() {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.bezierCurveTo(11, 20, 13, neckY, 13, neckY);
        ctx.bezierCurveTo(11, 40, 5, canvas.height, 5, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.bezierCurveTo(19, 20, 17, neckY, 17, neckY);
        ctx.bezierCurveTo(19, 40, 25, canvas.height, 25, canvas.height);
        ctx.stroke();

        ctx.beginPath(); ctx.moveTo(5,0); ctx.lineTo(25,0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5,canvas.height); ctx.lineTo(25,canvas.height); ctx.stroke();
    }

    function drawTopSand(topHeight:number) {
        ctx.fillStyle = "#ffd700";
        const yStart = neckY - topHeight;
        for (let y = yStart; y < neckY; y++) {
            const t = y / neckY;
            const leftX = cubicBezier(5, 11, 13, 13, t);
            const rightX = cubicBezier(25, 19, 17, 17, t);
            ctx.fillRect(leftX, y, rightX - leftX, 1);
        }
    }

    function drawBottomSand(bottomHeight:number) {
        ctx.fillStyle = "#ffd700";
        const yEnd = canvas.height - bottomHeight;
        for (let y = canvas.height; y > yEnd; y--) {
            const t = (y - neckY) / (canvas.height - neckY);
            const leftX = cubicBezier(13, 11, 5, 5, t);
            const rightX = cubicBezier(17, 19, 25, 25, t);
            ctx.fillRect(leftX, y, rightX - leftX, 1);
        }
        return yEnd;
    }

    function spawnGrain(topHeight:number) {
        const yStart = neckY - topHeight;
        const x = canvas.width / 2 + (Math.random() * 2 - 1);
        const y = yStart + Math.random() * topHeight * 0.2;
        const speed = 0.5 + Math.random() * 0.5;
        grains.push({ x, y, radius: 0.6, speed });
    }

    function updateGrains(surfaceY:number) {
        for (let i = grains.length - 1; i >= 0; i--) {
            const g = grains[i];
            g.y += g.speed;
            if (g.y >= neckY - 1 && g.y <= neckY + 1) {
                g.x = canvas.width / 2 + (Math.random() * 2 - 1);
            }
            if (g.y >= surfaceY) grains.splice(i, 1);
        }
    }

    function drawGrains() {
        ctx.fillStyle = "#ffd700";
        grains.forEach(g => {
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawFrame();

        const progress = Math.min(1, elapsed / duration);
        const topHeight = (1 - progress) * neckY * 0.7;
        const bottomHeight = progress * neckY * 0.7;

        drawTopSand(topHeight);
        const surfaceY = drawBottomSand(bottomHeight);

        if (grains.length < maxGrains && Math.random() < 0.5) {
            spawnGrain(topHeight);
        }

        updateGrains(surfaceY);
        drawGrains();

        const remaining = Math.max(0, Math.ceil(duration - elapsed));
        timeDisplay.innerText = remaining.toString();
    }

    let lastTime = performance.now();
    function animate(time:number) {
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        elapsed += delta;

        draw();

        if (elapsed < duration) requestAnimationFrame(animate);
        else container.remove();
    }

    animate(lastTime);
}
