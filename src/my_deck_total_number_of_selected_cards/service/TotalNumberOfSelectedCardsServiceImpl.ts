import * as THREE from 'three';
import {TotalNumberOfSelectedCardsService} from './TotalNumberOfSelectedCardsService';
import {TotalNumberOfSelectedCards} from "../entity/TotalNumberOfSelectedCards";
import {TotalNumberOfSelectedCardsRepositoryImpl} from "../repository/TotalNumberOfSelectedCardsRepositoryImpl";
import {Vector2d} from "../../common/math/Vector2d";

export class TotalNumberOfSelectedCardsServiceImpl implements TotalNumberOfSelectedCardsService {
    private static instance: TotalNumberOfSelectedCardsServiceImpl;
    private totalNumberOfSelectedCardsRepository: TotalNumberOfSelectedCardsRepositoryImpl;

    private constructor() {
        this.totalNumberOfSelectedCardsRepository = TotalNumberOfSelectedCardsRepositoryImpl.getInstance();
    }

    public static getInstance(): TotalNumberOfSelectedCardsServiceImpl {
        if (!TotalNumberOfSelectedCardsServiceImpl.instance) {
            TotalNumberOfSelectedCardsServiceImpl.instance = new TotalNumberOfSelectedCardsServiceImpl();
        }
        return TotalNumberOfSelectedCardsServiceImpl.instance;
    }

    public async createTotalNumberOfSelectedCards(deckId: number, count: number): Promise<THREE.Group | null> {
        const numberGroup = new THREE.Group();
        try {
            const existingNumber = this.getTotalNumberOfSelectedCardsByDeckId(deckId);
            if (existingNumber !== null) {
                const existingNumberMesh = existingNumber.getMesh();
                const existingPosition = existingNumber.position;
                const positionX = existingPosition.getX() * window.innerWidth;
                const positionY = existingPosition.getY() * window.innerHeight;

                existingNumberMesh.position.set(positionX, positionY, 0);
                numberGroup.add(existingNumberMesh);

            } else {
                console.log(`[Total Number Of Selected Cards] Deck Id: ${deckId}, Total Card Count: ${count}`);
                const totalNumber = await this.totalNumberOfSelectedCardsRepository.createTotalNumberOfSelectedCards(deckId, count);
                numberGroup.add(totalNumber.getMesh());
            }

        } catch (error) {
            console.error('Error creating Total Number Of Selected Cards:', error);
            return null;
        }
        return numberGroup;
    }

    public adjustTotalNumberOfSelectedCardsPosition(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const deckIdList = this.getAllDeckIdList();

        for (const deckId of deckIdList) {
            const totalNumber = this.getTotalNumberOfSelectedCardsByDeckId(deckId);
            if (totalNumber !== null) {
                const totalNumberMesh = totalNumber.getMesh();
                const initialPosition = totalNumber.position;

                const numberWidth = 0.013 * windowWidth;
                const numberHeight = numberWidth;

                const newPositionX = initialPosition.getX() * windowWidth;
                const newPositionY = initialPosition.getY() * windowHeight;

                totalNumberMesh.geometry.dispose();
                totalNumberMesh.geometry = new THREE.PlaneGeometry(numberWidth, numberHeight);
                totalNumberMesh.position.set(newPositionX, newPositionY, 0);
            }
        }
    }

    public getTotalNumberOfSelectedCardsByDeckId(deckId: number): TotalNumberOfSelectedCards | null {
        return this.totalNumberOfSelectedCardsRepository.findNumberByDeckId(deckId);
    }

    public getAllDeckIdList(): number[] {
        return this.totalNumberOfSelectedCardsRepository.findDeckIdList();
    }

}
