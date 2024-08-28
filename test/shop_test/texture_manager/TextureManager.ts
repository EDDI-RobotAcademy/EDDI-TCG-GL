import * as THREE from 'three';

interface ImageInfo {
    relative_path: string;
    reference_path: string;
}

export class TextureManager {
    private static instance: TextureManager;
    private battleFieldUnitCardTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitWeaponTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitHpTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitEnergyTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldUnitRaceTextureList: { [id: number]: THREE.Texture } = {};
    private mainLobbyBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private mainLobbyButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private shopBackgroundTextureList: { [id: number]: THREE.Texture } = {};
    private shopButtonsTextureList: { [id: number]: THREE.Texture } = {};
    private battleFieldBackgroundTextureList: { [id: number]: THREE.Texture } = {};

    private constructor() {}

    public static getInstance(): TextureManager {
        if (!TextureManager.instance) {
            TextureManager.instance = new TextureManager();
        }
        return TextureManager.instance;
    }

    public async preloadTextures(jsonUrl: string): Promise<void> {

        try {
            const response = await fetch(jsonUrl);
            const imageData = await response.json();
            console.log('imageData:', imageData);

            await Promise.all([
                this.loadTextures(imageData.card, this.battleFieldUnitCardTextureList),
                this.loadTextures(imageData.weapon, this.battleFieldUnitWeaponTextureList),
                this.loadTextures(imageData.hp, this.battleFieldUnitHpTextureList),
                this.loadTextures(imageData.energy, this.battleFieldUnitEnergyTextureList),
                this.loadTextures(imageData.race, this.battleFieldUnitRaceTextureList),
                this.loadTextures(imageData.main_lobby_background, this.mainLobbyBackgroundTextureList),
                this.loadTextures(imageData.main_lobby_buttons, this.mainLobbyButtonsTextureList),
                this.loadTextures(imageData.shop_background, this.shopBackgroundTextureList),
                this.loadTextures(imageData.shop_buttons, this.shopButtonsTextureList),
                this.loadTextures(imageData.battle_field_background, this.battleFieldBackgroundTextureList),
            ]);

            console.log('All textures preloaded from TextureManager.ts');
            console.log('mainLobbyBackgroundTextureList:', this.mainLobbyBackgroundTextureList);
        } catch (error) {
            console.error(`Failed to fetch or parse JSON from: ${jsonUrl}`, error);
        }
    }

    private getBasePath(): string {
        return window.location.origin; // 현재 작업 디렉토리 경로를 반환
    }

    private loadTextures(images: string[], textureList: { [id: number]: THREE.Texture }): Promise<void> {
        const promises = images.map((imagePath, index) => {
            return new Promise<void>((resolve, reject) => {
                const textureLoader = new THREE.TextureLoader();
                const fullPath = imagePath;
                // console.log('Loading texture:', fullPath);
                textureLoader.load(
                    fullPath,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace; // 색 공간 설정
                        texture.magFilter = THREE.LinearFilter; // 확대 필터
                        texture.minFilter = THREE.LinearFilter; // 축소 필터
                        texture.generateMipmaps = false;
                        textureList[index + 1] = texture;
                        // console.log(`Loaded texture: ${fullPath} with id: ${index + 1}`);
                        resolve();
                    },
                    undefined,
                    (error) => {
                        // console.error(`An error occurred loading the texture ${fullPath}:`, error);
                        reject(error);
                    }
                );
            });
        });
        return Promise.all(promises).then(() => {
            console.log(`Loaded textures: ${Object.keys(textureList).length}`);
        });
    }

    private extractIdFromPath(path: string): number | null {
        const match = path.match(/(\d+)\.png$/);
        return match ? parseInt(match[1], 10) : null;
    }

    public getTexture(category: string, id: number): THREE.Texture | undefined {
        console.log('getTexture -> category:', category, ',id:', id)
        switch (category) {
            case 'card':
                return this.battleFieldUnitCardTextureList[id];
            case 'weapon':
                return this.battleFieldUnitWeaponTextureList[id];
            case 'hp':
                return this.battleFieldUnitHpTextureList[id];
            case 'energy':
                return this.battleFieldUnitEnergyTextureList[id];
            case 'race':
                return this.battleFieldUnitRaceTextureList[id];
            case 'main_lobby_background':
                return this.mainLobbyBackgroundTextureList[id];
            case 'main_lobby_buttons':
                return this.mainLobbyButtonsTextureList[id];
            case 'shop_background':
                return this.shopBackgroundTextureList[id]
            case 'shop_buttons':
                return this.shopButtonsTextureList[id]
            case 'battle_field_background':
                return this.battleFieldBackgroundTextureList[id]
            default:
                return undefined;
        }
    }
}

// // 예제 사용법:
// const textureManager = LegacyTextureManager.getInstance();
// textureManager.preloadTextures('image-paths.json').then(() => {
//     console.log('All textures preloaded.');
// });
