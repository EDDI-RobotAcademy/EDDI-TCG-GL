import { getCardById } from "../../src/card/utility";
import { CardRace } from "../../src/card/race";
import { CardGrade } from "../../src/card/grade";
import { CardKind } from "../../src/card/kind";
import { TextureManager } from "../../src/texture_manager/TextureManager";
import { Vector2d } from "../../src/common/math/Vector2d";
import * as THREE from "three";
import {LegacyNonBackgroundImage} from "../../src/shape/image/LegacyNonBackgroundImage";
import {MeshGenerator} from "../../src/mesh/generator";
import {SupportCardGenerator} from "../../src/card/support/generate";
import {UnitCardGenerator} from "../../src/card/unit/generate";

const rootElement = document.getElementById('app');  // 렌더링할 요소를 가져옴

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

if (rootElement) {
    rootElement.appendChild(renderer.domElement);  // DOM에 렌더러 추가
} else {
    console.error('Root element not found!');
}

const aspect = window.innerWidth / window.innerHeight;
const viewSize = window.innerHeight
const camera = new THREE.OrthographicCamera(
    -aspect * viewSize / 2, aspect * viewSize / 2,
    viewSize / 2, -viewSize / 2,
    0.1, 1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// TextureManager 및 카드 생성 함수들은 기존과 동일하게 유지
const textureManager = TextureManager.getInstance();

async function createSupportCard(card: any) {
    console.log("Creating support card with data:", card);
    const positionVector = new Vector2d(-400, 0)
    const supportCard = await SupportCardGenerator.createSupportCard(card, positionVector);
    scene.add(supportCard);
}

async function createUnitCard(card: any) {
    console.log("Creating a UNIT card:", card);

    const positionVector = new Vector2d(-135, 0)
    const unitCard = await UnitCardGenerator.createUnitCard(card, positionVector)
    scene.add(unitCard)
}

function createItemCard(card: any) {
    console.log("Creating an ITEM card:", card);
    // 카드 생성 코드 추가
}

function createTrapCard(card: any) {
    console.log("Creating a TRAP card:", card);
    // 카드 생성 코드 추가
}

function createToolCard(card: any) {
    console.log("Creating a TOOL card:", card);
    // 카드 생성 코드 추가
}

function createEnergyCard(card: any) {
    console.log("Creating a ENERGY card:", card);
    // 카드 생성 코드 추가
}

function createEnvironmentCard(card: any) {
    console.log("Creating a ENVIRONMENT card:", card);
    // 카드 생성 코드 추가
}

function createTokenCard(card: any) {
    console.log("Creating a TOKEN card:", card);
    // 카드 생성 코드 추가
}

const cardKindHandlers: { [key in CardKind]?: (card: any) => void } = {
    [CardKind.UNIT]: createUnitCard,
    [CardKind.ITEM]: createItemCard,
    [CardKind.TRAP]: createTrapCard,
    [CardKind.SUPPORT]: createSupportCard,
    [CardKind.TOOL]: createToolCard,
    [CardKind.ENERGY]: createEnergyCard,
    [CardKind.ENVIRONMENT]: createEnvironmentCard,
    [CardKind.TOKEN]: createTokenCard,
};

function renderCardTextures(
    cardTexture: THREE.Texture | null,
    cardKindsTexture: THREE.Texture | null,
    cardRaceTexture: THREE.Texture | null
) {
    // 기존 씬에서 카드 메쉬 제거
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            scene.remove(child);
        }
    });

    if (!cardTexture) {
        console.error('No card texture provided.');
        return;
    }

    const cardPosition = new Vector2d(-2, 0);
    const cardMesh = MeshGenerator.createMesh(cardTexture, 2, 3, cardPosition);
    scene.add(cardMesh);

    // 카드 종류 및 카드 종족 텍스처를 사용할 경우 추가 메쉬 생성
    if (cardKindsTexture) {
        const kindsPosition = new Vector2d(cardPosition.getX() + 1.0, cardPosition.getY() - 1.5);
        const kindsMesh = MeshGenerator.createMesh(cardKindsTexture, 1, 1, kindsPosition);
        scene.add(kindsMesh);
    }

    if (cardRaceTexture) {
        const racePosition = new Vector2d(cardPosition.getX() + 1.0, cardPosition.getY() + 1.5);
        const raceMesh = MeshGenerator.createMesh(cardRaceTexture, 1, 1, racePosition);
        scene.add(raceMesh);
    }
}

async function main() {
    try {
        const textureManager = TextureManager.getInstance();
        await textureManager.preloadTextures("image-paths.json");

        const cardIdToFind = 2;
        const card = getCardById(cardIdToFind);

        if (card) {
            const damage = card.공격력;
            const hp = card.체력 !== null ? card.체력 : "No HP specified";
            const race = CardRace[parseInt(card.종족, 10)] as keyof typeof CardRace;
            const gradeInt = parseInt(card.등급, 10);
            const grade = CardGrade[gradeInt] as keyof typeof CardGrade;
            const kindInt = parseInt(card.종류, 10) as CardKind;
            const kind = CardKind[kindInt] as keyof typeof CardKind;
            const requiredEnergy = card.필요_에너지;

            console.log('Card found:');
            console.log('공격력:', damage);
            console.log('체력:', hp);
            console.log('종족:', race);
            console.log('등급:', grade);
            console.log('종류_enum:', kindInt);
            console.log('종류:', kind);
            console.log('필요_에너지:', requiredEnergy);
            console.log('type(필요_에너지):', typeof requiredEnergy);

            const handler = cardKindHandlers[kindInt];
            if (handler) {
                await handler(card);
            } else {
                console.log('No handler for CardKind:', CardKind[kindInt]);
            }
        } else {
            console.log('Card not found');
        }

        const netherBladeCardId = 19
        const netherBlade = getCardById(netherBladeCardId)

        if (netherBlade) {
            const kindInt = parseInt(netherBlade.종류, 10) as CardKind;

            const unitHandler = cardKindHandlers[kindInt]
            if (unitHandler) {
                await unitHandler(netherBlade);
            }
        }
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main().catch(console.error);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();
