import {TextureManager} from "../../texture_manager/TextureManager";

function resolveTextureSrc(tex: any): string {
    const img = tex?.image;
    if (!img) throw new Error("Texture has no image");

    // HTMLImageElement
    if (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement) {
        return img.src;
    }
    // HTMLCanvasElement
    if (typeof HTMLCanvasElement !== "undefined" && img instanceof HTMLCanvasElement) {
        return img.toDataURL();
    }
    // ImageBitmap -> canvas로 변환
    if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        c.getContext("2d")!.drawImage(img, 0, 0);
        return c.toDataURL();
    }
    // 마지막 시도: src 필드
    if (typeof img.src === "string") return img.src;

    throw new Error("Cannot resolve texture image source");
}

/** DOM 오버레이로 필드 에너지 표시 (배경 Texture + 중앙 숫자) */
export async function showFieldEnergy(energy: number = 0) {
    // 기존 것 제거
    const existing = document.getElementById("battle-field-energy");
    if (existing) existing.remove();

    // 컨테이너
    const container = document.createElement("div");
    container.id = "battle-field-energy";
    container.style.position = "fixed";
    container.style.top = "82.4%";
    container.style.left = "90.4%";
    container.style.width = "7.2%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.zIndex = "1000";
    container.style.pointerEvents = "none";

    // 배경 Texture 로드
    const tm = TextureManager.getInstance();
    const tex = await tm.getTexture("field_energy_button", 1);
    if (!tex) throw new Error("Texture not found: field_energy_button, 1");

    // 내부 박스 (relative: 텍스트 겹치기용)
    const box = document.createElement("div");
    box.style.position = "relative";
    box.style.width = "100%";
    box.style.borderRadius = "6px";
    box.style.overflow = "hidden";

    // Texture → <img>
    const img = document.createElement("img");
    img.src = resolveTextureSrc(tex);
    img.alt = "field-energy-bg";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "auto";
    box.appendChild(img);

    // 숫자 오버레이
    const baseHeight = 1080;
    const baseFont = 48;
    const fontSize = (window.innerHeight / baseHeight) * baseFont;

    const label = document.createElement("div");
    label.id = "battle-field-energy-text";
    label.textContent = String(energy);
    label.style.position = "absolute";
    label.style.left = "50%";
    label.style.top = "50%";
    label.style.transform = "translate(-50%, -50%)";
    label.style.color = "#222"; // 진한 회색
    label.style.fontWeight = "bold";
    label.style.fontFamily = "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif";
    label.style.fontSize = `${fontSize}px`;
    label.style.textShadow = "0 1px 2px rgba(255,255,255,0.6)"; // 밝은 버튼 대비 부드러운 그림자
    box.appendChild(label);

    container.appendChild(box);
    document.body.appendChild(container);
}

/** 숫자만 교체 (재그리기 없이 빠름) */
export function updateFieldEnergy(energy: number) {
    const label = document.getElementById("battle-field-energy-text");
    if (label) {
        label.textContent = String(energy);
        const baseHeight = 1080;
        const baseFont = 48;
        const fontSize = (window.innerHeight / baseHeight) * baseFont;
        (label as HTMLElement).style.fontSize = `${fontSize}px`;
    } else {
        // 없으면 새로 생성
        showFieldEnergy(energy);
    }
}

/** 리사이즈 시 폰트만 재계산해서 유지 */
export function relayoutFieldEnergy() {
    const label = document.getElementById("battle-field-energy-text") as HTMLElement | null;
    if (!label) return;
    const baseHeight = 1080;
    const baseFont = 48;
    label.style.fontSize = `${(window.innerHeight / baseHeight) * baseFont}px`;
}
