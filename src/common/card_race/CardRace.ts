// 최초 표시
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
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d")!.drawImage(img, 0, 0);
        return c.toDataURL();
    }
    // 마지막 시도: src 필드
    if (typeof img.src === "string") return img.src;

    throw new Error("Cannot resolve texture image source");
}

export async function showFieldEnergyRace(raceId: number = 1) {
    const existing = document.getElementById("battle-field-energy-race");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "battle-field-energy-race";
    container.style.position = "fixed";
    container.style.top = "72.1%";
    container.style.left = "92.15%";
    container.style.width = "3.6%";           // 화면 기준 비율
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.zIndex = "1000";
    container.style.pointerEvents = "none";

    const img = document.createElement("img");
    img.id = "battle-field-energy-race-img";
    img.style.width = "100%";   // 부모 크기에 맞추기
    img.style.height = "auto";  // 비율 유지
    container.appendChild(img);

    document.body.appendChild(container);

    // 최초 이미지 세팅
    await updateFieldEnergyRace(raceId);
}

// 이미지 교체 (사용자가 raceId 요청 시 호출)
export async function updateFieldEnergyRace(raceId: number) {
    const img = document.getElementById("battle-field-energy-race-img") as HTMLImageElement;
    if (!img) return;

    const tm = TextureManager.getInstance();
    const tex = await tm.getTexture("race", raceId);
    if (!tex) throw new Error(`Texture not found: race, ${raceId}`);

    img.src = resolveTextureSrc(tex);
    img.alt = `field-energy-race-${raceId}`;
}
