import { OpponentFieldAreaService } from './OpponentFieldAreaService';
import { OpponentFieldArea } from "../entity/OpponentFieldArea";
import { OpponentFieldAreaRepository } from "../repository/OpponentFieldAreaRepository";
import {OpponentFieldAreaRepositoryImpl} from "../repository/OpponentFieldAreaRepositoryImpl";

export class OpponentFieldAreaServiceImpl implements OpponentFieldAreaService {
    private static instance: OpponentFieldAreaServiceImpl;
    private opponentFieldAreaRepository: OpponentFieldAreaRepository;

    constructor() {
        this.opponentFieldAreaRepository = OpponentFieldAreaRepositoryImpl.getInstance();
    }

    static getInstance(): OpponentFieldAreaServiceImpl {
        if (!this.instance) {
            this.instance = new OpponentFieldAreaServiceImpl();
        }
        return this.instance;
    }

    createOpponentField(): OpponentFieldArea {
        const { xPos, yPos, width, height } = this.calculateFieldDimensions();
        return this.opponentFieldAreaRepository.createOpponentFieldArea(xPos, yPos, width, height);
    }

    // 화면 크기 계산 로직을 별도의 메서드로 분리
    private calculateFieldDimensions() {
        const xPos = 0
        const yPos = (window.innerHeight / 2) + (0.024 * 3 + 0.11 * 2.5) * window.innerHeight
        const width = window.innerWidth * 0.7;
        const height = window.innerHeight * 0.23;

        return { xPos, yPos, width, height };
    }
}
