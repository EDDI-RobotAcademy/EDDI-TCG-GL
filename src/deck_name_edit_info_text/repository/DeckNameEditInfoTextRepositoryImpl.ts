import * as THREE from 'three';
import {DeckNameEditInfoTextRepository} from './DeckNameEditInfoTextRepository';
import {DeckNameEditInfoText} from "../entity/DeckNameEditInfoText";
import {TextGenerator} from "../../text/generator";
import {MeshGenerator} from "../../mesh/generator";
import {Vector2d} from "../../common/math/Vector2d";
import {MeshDestroyer} from "../../mesh/destroyer";
import {DeckNameEditInfoTextType} from "../entity/DeckNameEditInfoTextType";

export class DeckNameEditInfoTextRepositoryImpl implements DeckNameEditInfoTextRepository {
    private static instance: DeckNameEditInfoTextRepositoryImpl;
    private infoTextMap: Map<number, { typeId: DeckNameEditInfoTextType, infoText: string, textMesh: DeckNameEditInfoText }> = new Map(); // text unique id: {deck id: text mesh}

    private meshDestroyer: MeshDestroyer;

    private constructor(scene: THREE.Scene) {
        this.meshDestroyer = new MeshDestroyer(scene);
    }

    public static getInstance(scene: THREE.Scene): DeckNameEditInfoTextRepositoryImpl {
        if (!DeckNameEditInfoTextRepositoryImpl.instance) {
            DeckNameEditInfoTextRepositoryImpl.instance = new DeckNameEditInfoTextRepositoryImpl(scene);
        }
        return DeckNameEditInfoTextRepositoryImpl.instance;
    }

    public async createDeckNameEditInfoText(
        typeId: DeckNameEditInfoTextType,
        color: string,
        infoText: string,
        position: Vector2d
    ): Promise<DeckNameEditInfoText> {
        const generator = new TextGenerator();

        const canvas = generator.createCanvas(infoText, 'KakaoFont', color, 8);
        if (!canvas) {
            throw new Error('Deck Name Edit Info Text Canvas not found.');
        }

        const texture = generator.createTextureFromCanvas(canvas);
        if (!texture) {
            throw new Error('Deck Name Edit Info Text Texture not found.');
        }

        const infoTextTexture = texture.image;
        const textWidth = infoTextTexture.width;
        const textHeight = infoTextTexture.height;

        console.log(`%c 안내 문구 텍스트 가로 길이: ${textWidth}`, 'color: #ff14b5; font-weight: bold;');
        console.log(`%c 안내 문구 텍스트 세로 길이: ${textHeight}`, 'color: #ff14b5; font-weight: bold;');

        const infoTextWidth = (textWidth/1800) * window.innerWidth;
        const infoTextHeight = infoTextWidth * (textHeight / textWidth);

        const infoTextPositionX = position.getX() * window.innerWidth;
        const infoTextPositionY = position.getY() * window.innerHeight;

        const infoTextMesh = MeshGenerator.createMesh(texture, infoTextWidth, infoTextHeight, position);
        infoTextMesh.position.set(infoTextPositionX, infoTextPositionY, 0);

        const newInfoText = new DeckNameEditInfoText(infoTextMesh, position, textWidth, textHeight);
        this.infoTextMap.set(newInfoText.id, { typeId, infoText, textMesh: newInfoText });

        return newInfoText;
    }

    public findInfoTextById(textUniqueId: number): DeckNameEditInfoText | null {
        return this.infoTextMap.get(textUniqueId)?.textMesh ?? null;
    }

    public findAllInfoText(): DeckNameEditInfoText[] {
        return Array.from(this.infoTextMap.values()).map(({ textMesh }) => textMesh);
    }

    public findAllNameTextIdList(): number[] {
        return Array.from(this.infoTextMap.keys());
    }

    public findTextTypeList(): DeckNameEditInfoTextType[] {
        return Array.from(this.infoTextMap.values()).map(({ typeId }) => typeId);
    }

    public deleteInfoTextById(textUniqueId: number): void {
        const text = this.findInfoTextById(textUniqueId);
        if (!text) return;

        const mesh = text.getMesh();
        this.meshDestroyer.destroyMesh(mesh);

        this.infoTextMap.delete(textUniqueId);
    }

    public deleteAllInfoText(): void {
        this.infoTextMap.clear();
    }

}
