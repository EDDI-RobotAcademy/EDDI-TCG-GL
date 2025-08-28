import {TextureManager} from "../../texture_manager/TextureManager";

function resolveTextureSrc(tex: any): string {
    const img = tex?.image;
    if (!img) throw new Error("Texture has no image");

    if (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement) return img.src;
    if (typeof HTMLCanvasElement !== "undefined" && img instanceof HTMLCanvasElement) return img.toDataURL();
    if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d")!.drawImage(img, 0, 0);
        return c.toDataURL();
    }
    if (typeof img.src === "string") return img.src;

    throw new Error("Cannot resolve texture image source");
}

export async function showFieldEnergy(energy: number = 0) {
    const existing = document.getElementById("battle-field-energy");
    if (existing) existing.remove();

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

    const tm = TextureManager.getInstance();
    const tex = await tm.getTexture("field_energy_button", 1);
    if (!tex) throw new Error("Texture not found: field_energy_button, 1");

    const box = document.createElement("div");
    box.style.position = "relative";
    box.style.width = "100%";
    box.style.borderRadius = "6px";
    box.style.overflow = "hidden";

    const img = document.createElement("img");
    img.src = resolveTextureSrc(tex);
    img.alt = "field-energy-bg";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "auto";
    box.appendChild(img);

    const label = document.createElement("div");
    label.id = "battle-field-energy-text";
    label.textContent = String(energy);
    label.style.position = "absolute";
    label.style.left = "50%";
    label.style.transform = "translateX(-50%)"; // X 중앙만 처리
    label.style.color = "#222";
    label.style.fontWeight = "bold";
    label.style.fontFamily = "'Inter','Roboto','Helvetica','Arial',sans-serif";
    label.style.textShadow = "0 1px 2px rgba(255,255,255,0.6)";
    label.style.textAlign = "center";

    const updateLabelPosition = () => {
        const baseHeight = 1080;
        const baseFont = 48;
        const fontSize = (window.innerHeight / baseHeight) * baseFont;
        label.style.fontSize = `${fontSize}px`;
        label.style.lineHeight = "normal";

        // 글자 높이 측정
        box.appendChild(label);
        const textHeight = label.getBoundingClientRect().height;
        const imgHeight = img.getBoundingClientRect().height;

        // 중앙 기준 + offset 아래로
        const offset = fontSize * 0.1; // 글자 시각적 중심 보정용 (10% 정도)
        label.style.top = `${(imgHeight - textHeight)/2 + offset}px`;
    };

    img.onload = updateLabelPosition;
    window.addEventListener("resize", updateLabelPosition);

    container.appendChild(box);
    document.body.appendChild(container);
}

/** 숫자만 교체 */
export function updateFieldEnergy(energy: number) {
    const label = document.getElementById("battle-field-energy-text");
    if (!label) {
        showFieldEnergy(energy);
        return;
    }
    label.textContent = String(energy);

    const img = label.parentElement?.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    const baseHeight = 1080;
    const baseFont = 48;
    const fontSize = (window.innerHeight / baseHeight) * baseFont;
    label.style.fontSize = `${fontSize}px`;
    label.style.lineHeight = "normal";

    const textHeight = label.getBoundingClientRect().height;
    const imgHeight = img.getBoundingClientRect().height;
    const offset = fontSize * 0.1; // 아래로 보정
    label.style.top = `${(imgHeight - textHeight)/2 + offset}px`;
}
