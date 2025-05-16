import { EventEmitter } from "events";

export interface LabelSelectEventDetails {
    waypointId?: number;
    action: "labelSelect" | "labelDeselect";
}

export type EvaluationEventMap = {
    labelSelect: LabelSelectEventDetails;
};

export type EvaluationEvent<K extends keyof EvaluationEventMap = keyof EvaluationEventMap> = {
    timestamp: Date;
    name: K;
    url: string;
    details: EvaluationEventMap[K];
};

// TODO: The emitter should be in the map maker tool to track events from there
export class EvaluationEventEmitter {
    private emitter = new EventEmitter();

    on<K extends keyof EvaluationEventMap>(event: "evaluationEvent", listener: (event: EvaluationEvent<K>) => void): this {
        this.emitter.on(event, listener);
        return this;
    }

    off<K extends keyof EvaluationEventMap>(event: "evaluationEvent", listener: (event: EvaluationEvent<K>) => void): this {
        this.emitter.off(event, listener);
        return this;
    }

    emit<K extends keyof EvaluationEventMap>(event: EvaluationEvent<K>): boolean {
        return this.emitter.emit("evaluationEvent", event);
    }
}

export const evaluationEventEmitter = new EvaluationEventEmitter();

export function trackEvent<K extends keyof EvaluationEventMap>(event: EvaluationEvent<K>) {
    evaluationEventEmitter.emit(event);
}