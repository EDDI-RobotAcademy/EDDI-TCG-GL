import { SlotSpec } from "./SlotSpec";

export interface Frame {
    readonly rootWidth: number;
    readonly rootAspect: number;
    readonly slots: Readonly<Record<string, SlotSpec>>;
}
