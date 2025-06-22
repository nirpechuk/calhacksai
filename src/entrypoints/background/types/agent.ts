/**
 * Agent Types and Interfaces for Misinformation Prevention Chrome Extension
 * 
 * This module defines the core interfaces and types for the agent system
 * that analyzes web pages for misinformation and provides annotations.
 */


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

/**
 * JSON schema for AgentAction validation
 */
export const agentActionSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $comment: "Schema for an array of AgentAction objects returned by the fact-checking agent.",
  type: "array",
  items: {
    $comment: "A single action describing how to annotate an incorrect (or misleading) fact.",
    type: "object",
    additionalProperties: false,
    required: [
      "type",
      "targetElement",
      "content",
      "confidence",
      "severity",
      "explanation",
      "sources"
    ],
    properties: {
      type: {
        type: "string",
        enum: ["highlight", "underline", "add_note"],
        description: "Visual treatment the extension should apply. Accepted values mirror the ActionType enum."
      },
      targetElement: {
        type: "string",
        minLength: 1,
        description: "CSS selector that uniquely identifies the DOM element containing the quoted text. Keep it as short and stable as possible (e.g. '#article > p:nth-of-type(3)')."
      },
      content: {
        type: "string",
        minLength: 1,
        description: "Exact substring (quote) within the target element that is factually incorrect or needs annotation."
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Model-estimated probability that the statement is indeed incorrect. 0 = very unsure, 1 = absolutely certain."
      },
      severity: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Reader-impact scale: 0 = negligible, 1 = critical. The UI can map this to highlight colors or ordering."
      },
      explanation: {
        type: "string",
        minLength: 1,
        description: "Concise correction or clarification the user should see (e.g. 'The moon is mostly rock, not cheese')."
      },
      sources: {
        type: "array",
        minItems: 1,
        items: {
          type: "string",
          format: "uri"
        },
        description: "Authoritative URLs that back up the correction. At least one source is required."
      }
    }
  }
} as const;

/**
 * Validate that a response matches the expected AgentAction schema
 */
export function validateAgentActions(data: any): AgentAction[] {
  if (!Array.isArray(data)) {
    throw new Error('Agent response must be an array of actions');
  }

  return data.map((action, index) => {
    // Quick validation using schema structure
    const requiredFields = agentActionSchema.items.required;
    const properties = agentActionSchema.items.properties;

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in action)) {
        throw new Error(`Missing required field '${field}' at index ${index}`);
      }
    }

    // Validate type enum
    if (!properties.type.enum.includes(action.type)) {
      throw new Error(`Invalid action type at index ${index}: ${action.type}`);
    }

    // Validate string fields
    const stringFields = ['targetElement', 'content', 'explanation'];
    for (const field of stringFields) {
      if (typeof action[field] !== 'string' || !action[field].trim()) {
        throw new Error(`Invalid ${field} at index ${index}: must be a non-empty string`);
      }
    }

    // Validate number fields
    const numberFields = ['confidence', 'severity'];
    for (const field of numberFields) {
      const value = action[field];
      if (typeof value !== 'number' || value < 0 || value > 1) {
        throw new Error(`Invalid ${field} at index ${index}: must be a number between 0 and 1`);
      }
    }

    // // Validate sources array
    // if (!Array.isArray(action.sources) || action.sources.length === 0) {
    //   throw new Error(`Invalid sources at index ${index}: must be a non-empty array`);
    // }

    // Validate each source URL
    for (const source of action.sources) {
      if (typeof source !== 'string' || !source.trim()) {
        throw new Error(`Invalid source at index ${index}: must be a non-empty string`);
      }
      try {
        new URL(source);
      } catch {
        throw new Error(`Invalid source URL at index ${index}: ${source}`);
      }
    }

    return {
      type: action.type as ActionType,
      targetElement: action.targetElement,
      content: action.content,
      confidence: action.confidence,
      severity: action.severity,
      explanation: action.explanation,
      sources: action.sources,
    } as AgentAction;
  });
}

/**
 * Core interface that all agents must implement
 */
export interface IAgent {
  /**
   * Initialize the agent
   * @param apiKey - API key for the agent service
   * @returns Promise that resolves when initialization is complete
   */
  initialize(apiKey: string): Promise<void>;

  /**
   * Get actions from the agent based on DOM analysis
   * @param dom - The page DOM as a string
   * @param prompt - The prompt to send to the agent
   * @returns Promise that resolves to agent actions
   */
  getActions(dom: string, prompt: string): Promise<AgentResult>;
}
