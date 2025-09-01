import { MarkSceneType } from "../../battle_field_card_attribute_mark_scene/entity/MarkSceneType";
import { Vector2d } from "../math/Vector2d";

export class AttributeMarkPositionCalculator {
    static positionCalculators: Record<MarkSceneType, (handPosition: Vector2d, cardWidth: number, cardHeight: number) => Vector2d> = {
        [MarkSceneType.SWORD]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, 0.44, -0.45666),
        [MarkSceneType.STAFF]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, 0.54, -0.30666),
        [MarkSceneType.KINDS]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, 0.5, -0.5),
        [MarkSceneType.RACE]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, 0.5, 0.5),
        [MarkSceneType.HP]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, -0.5, -0.43438),
        [MarkSceneType.ENERGY]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, -0.5, 0.5),
        [MarkSceneType.ENERGY_COUNT]: (handPosition, cardWidth, cardHeight) => AttributeMarkPositionCalculator.calculatePosition(handPosition, cardWidth, cardHeight, -0.5, 0.5),
    };

    static getPositionForType(markType: MarkSceneType, handPosition: Vector2d, cardWidth: number, cardHeight: number): Vector2d {
        const calculator = AttributeMarkPositionCalculator.positionCalculators[markType];
        if (!calculator) {
            throw new Error(`Unknown MarkSceneType: ${markType}`);
        }
        return calculator(handPosition, cardWidth, cardHeight);
    }

    private static calculatePosition(handPosition: Vector2d, cardWidth: number, cardHeight: number, xFactor: number, yFactor: number): Vector2d {
        const x = handPosition.getX() + cardWidth * xFactor * window.innerWidth;
        const y = handPosition.getY() + cardHeight * yFactor * window.innerWidth; // yFactor에서 부호 처리
        return new Vector2d(x, y);
    }
}
