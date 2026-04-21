import { TurnOwner } from "../entity/TurnState";

export interface TurnStateRepository {
    getOwner(): TurnOwner;
    setOwner(owner: TurnOwner): void;
}
