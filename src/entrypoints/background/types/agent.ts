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
