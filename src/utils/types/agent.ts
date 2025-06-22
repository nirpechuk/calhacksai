/**
 * Types of actions that agents can perform
 */
export enum ActionType {
    HIGHLIGHT = 'highlight',
    UNDERLINE = 'underline',
    ADD_NOTE = 'add_note'
}

/**
 * Represents an action that an agent wants to perform
 */
export type AgentAction = {
    type: ActionType; // highlight, underline, add_note
    targetElement: string; // CSS selector to the DOM element
    content: string; // specific quote to highlight
    confidence: number; // 0.0 to 1.0
    severity: number; // 0.0 to 1.0
    explanation: string; // correction, augmentation, etc.
    sources: string[]; // sources of the information
}

/**
 * Result from agent analysis
 */
export type AgentResult = {
    success: boolean;
    actions: AgentAction[];
    errors?: string[];
};  