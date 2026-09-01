import { YourFieldAreaService } from './YourFieldAreaService';
import { YourFieldArea } from "../entity/YourFieldArea";
import { YourFieldAreaRepository } from "../repository/YourFieldAreaRepository";
import {YourFieldAreaRepositoryImpl} from "../repository/YourFieldAreaRepositoryImpl";

export class YourFieldAreaServiceImpl implements YourFieldAreaService {
    private static instance: YourFieldAreaServiceImpl;
    private yourFieldAreaRepository: YourFieldAreaRepository;

    constructor() {
        this.yourFieldAreaRepository = YourFieldAreaRepositoryImpl.getInstance();
    }

    static getInstance(): YourFieldAreaServiceImpl {
        if (!this.instance) {
            this.instance = new YourFieldAreaServiceImpl();
        }
        return this.instance;
    }

    createYourField(): YourFieldArea {
        const { xPos, yPos, width, height } = this.calculateFieldDimensions();
        return this.yourFieldAreaRepository.createYourFieldArea(xPos, yPos, width, height);
    }

    // 화면 크기 계산 로직을 별도의 메서드로 분리
    private calculateFieldDimensions() {
        const xPos = 0
        const yPos = -(window.innerHeight / 2) + (0.024 * 3 + 0.11 * 2.5) * window.innerHeight
        const width = window.innerWidth * 0.7;
        const height = window.innerHeight * 0.23;

        return { xPos, yPos, width, height };
    }
}
