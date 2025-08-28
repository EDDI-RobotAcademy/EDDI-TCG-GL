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

    // 화면 비율 기반 패딩
    const paddingX = window.innerWidth * 0.00625;
    const paddingY = window.innerHeight * 0.01210898082;

    // 박스
    const box = document.createElement("div");
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.padding = `${paddingY}px ${paddingX}px`;
    box.style.borderRadius = "6px";
    box.style.width = "100%";
    box.style.background = "linear-gradient(to right, rgba(255,255,255,0.2), rgba(139,69,19,0.3), rgba(0,0,0,0.2))";
    container.appendChild(box);

    // 실제 캔버스 크기
    const canvasWidth = window.innerWidth * 0.027;
    const canvasHeight = window.innerHeight * 0.055;
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    box.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    // 숫자 div
    const timeDisplay = document.createElement("div");
    timeDisplay.style.color = "#fff";
    const baseHeight = 1080;
    const baseFontSize = 32;
    const fontSize = (window.innerHeight / baseHeight) * baseFontSize;
    timeDisplay.style.fontSize = `${fontSize}px`;
    timeDisplay.style.fontWeight = "bold";
    timeDisplay.style.marginLeft = `${window.innerWidth * 0.0125}px`;
    box.appendChild(timeDisplay);

    document.body.appendChild(container);

    interface Grain { x: number; y: number; radius: number; speed: number; }
    const grains: Grain[] = [];
    const maxGrains = 60;
    let elapsed = 0;

    // 기준 캔버스 크기
    const baseWidth = 30;
    const baseHeightCanvas = 60;

    const neckY = canvas.height / 2;

    function scaleX(x:number) {
        return (x / baseWidth) * canvas.width;
    }

    function scaleY(y:number) {
        return (y / baseHeightCanvas) * canvas.height;
    }

    function cubicBezier(p0:number, p1:number, p2:number, p3:number, t:number) {
        const mt = 1-t;
        return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
    }

    function drawFrame() {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;

        // 좌측
        ctx.beginPath();
        ctx.moveTo(scaleX(5), scaleY(0));
        ctx.bezierCurveTo(scaleX(11), scaleY(20), scaleX(13), neckY, scaleX(13), neckY);
        ctx.bezierCurveTo(scaleX(11), scaleY(40), scaleX(5), scaleY(60), scaleX(5), scaleY(60));
        ctx.stroke();

        // 우측
        ctx.beginPath();
        ctx.moveTo(scaleX(25), scaleY(0));
        ctx.bezierCurveTo(scaleX(19), scaleY(20), scaleX(17), neckY, scaleX(17), neckY);
        ctx.bezierCurveTo(scaleX(19), scaleY(40), scaleX(25), scaleY(60), scaleX(25), scaleY(60));
        ctx.stroke();

        ctx.beginPath(); ctx.moveTo(scaleX(5), scaleY(0)); ctx.lineTo(scaleX(25), scaleY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(scaleX(5), scaleY(60)); ctx.lineTo(scaleX(25), scaleY(60)); ctx.stroke();
    }

    function drawTopSand(topHeight:number) {
        ctx.fillStyle = "#ffd700";
        const yStart = neckY - topHeight;

        for (let y = yStart; y < neckY; y++) {
            const t = y / neckY;
            const leftX = cubicBezier(scaleX(5), scaleX(11), scaleX(13), scaleX(13), t);
            const rightX = cubicBezier(scaleX(25), scaleX(19), scaleX(17), scaleX(17), t);
            ctx.fillRect(leftX, y, rightX - leftX, 1);
        }
    }

    function drawBottomSand(bottomHeight:number) {
        ctx.fillStyle = "#ffd700";
        const yEnd = canvas.height - bottomHeight;

        for (let y = canvas.height; y > yEnd; y--) {
            const t = (y - neckY) / (canvas.height - neckY);
            const leftX = cubicBezier(scaleX(13), scaleX(11), scaleX(5), scaleX(5), t);
            const rightX = cubicBezier(scaleX(17), scaleX(19), scaleX(25), scaleX(25), t);
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
        if (grains.length < maxGrains && Math.random() < 0.5) spawnGrain(topHeight);
        updateGrains(surfaceY);
        drawGrains();

        const remaining = Math.max(0, duration - Math.floor(elapsed));
        timeDisplay.style.color = remaining <= 20 ? "#ff3c3c" : "#fff";
        timeDisplay.innerText = remaining.toString();
    }

    let lastTime = performance.now();
    function animate(time:number) {
        const delta = (time - lastTime) / 1000;
        lastTime = time;
        elapsed += delta;
        draw();
        if (elapsed < duration) requestAnimationFrame(animate);
        else {
            grains.length = 0;
            draw();
        }
    }

    animate(lastTime);
}
