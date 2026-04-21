import { TurnOwner } from "../entity/TurnState";
import { TurnStateRepository } from "./TurnStateRepository";

// Singleton turn-owner state. Starts on YOUR turn (matches the convention that the local
// player is the one who opens the game). A later network layer will synchronize transitions
// with the server; for now the repository is the single in-memory authority.
export class TurnStateRepositoryImpl implements TurnStateRepository {
    private static instance: TurnStateRepositoryImpl | null = null;
    private owner: TurnOwner = 'your';

    private constructor() {}

    public static getInstance(): TurnStateRepositoryImpl {
        if (!TurnStateRepositoryImpl.instance) {
            TurnStateRepositoryImpl.instance = new TurnStateRepositoryImpl();
        }
        return TurnStateRepositoryImpl.instance;
    }

    public getOwner(): TurnOwner {
        return this.owner;
    }

    public setOwner(owner: TurnOwner): void {
        if (this.owner === owner) return;
        const prev = this.owner;
        this.owner = owner;
        console.log(`[turn-state] owner: ${prev} → ${owner}`);
    }
}
