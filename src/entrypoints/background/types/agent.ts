/**
 * Agent Types and Interfaces for Misinformation Prevention Chrome Extension
 * 
 * This module defines the core interfaces and types for the agent system
 * that analyzes web pages for misinformation and provides annotations.
 */

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/**
 * Supported agent orchestrators/platforms
 */
export enum AgentOrchestrator {
  LETTA_AI = 'letta_ai',
  FETCH_AI = 'fetch_ai',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE_AI = 'google_ai',
  CUSTOM = 'custom'
}

/**
 * Types of agents for different analysis purposes
 */
export enum AgentType {
  FACT_CHECKER = 'fact_checker',
  TEXT_ANALYZER = 'text_analyzer',
  IMAGE_ANALYZER = 'image_analyzer',
  SOURCE_VERIFIER = 'source_verifier',
  BIAS_DETECTOR = 'bias_detector',
  CLAIM_EXTRACTOR = 'claim_extractor',
  CONTEXT_ANALYZER = 'context_analyzer'
}

/**
 * Types of actions that agents can perform
 */
export enum ActionType {
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  ADD_NOTE = 'add_note',
}

/**
 * Confidence levels for agent assessments
 */
export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

/**
 * Severity levels for misinformation detection
 */
export enum SeverityLevel {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Represents a DOM element with its context
 */
export interface DOMElement {
  selector: string;
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  parentContext?: string;
}

/**
 * Represents the full DOM structure for analysis
 */
export interface PageDOM {
  url: string;
  title: string;
  mainContent: string;
  elements: DOMElement[];
  metadata: {
    author?: string;
    publishDate?: string;
    lastModified?: string;
    keywords?: string[];
    description?: string;
  };
  images: Array<{
    src: string;
    alt: string;
    selector: string;
    position: { x: number; y: number; width: number; height: number };
  }>;
}

/**
 * Permissions and capabilities for an agent
 */
export interface AgentPermissions {
  canAccessInternet: boolean;
  canUseAPIs: boolean;
  canAccessDatabases: boolean;
  canPerformImageAnalysis: boolean;
  canAccessHistoricalData: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  allowedDomains?: string[];
  blockedDomains?: string[];
}

/**
 * Configuration for agent initialization
 */
export interface AgentConfig {
  orchestrator: AgentOrchestrator;
  agentType: AgentType;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryAttempts?: number;
  customHeaders?: Record<string, string>;
}

/**
 * Represents an action that an agent wants to perform
 */
export interface AgentAction {
  type: ActionType;
  targetElement: string; // CSS selector to the DOM element
  content: string; // specific quote to highlight
  confidence: ConfidenceLevel;
  severity: SeverityLevel;
  explanation: string;
  sources: string[];
}

/**
 * Result from agent analysis
 */
export interface AgentResult {
  success: boolean;
  actions: AgentAction[];
  processingTime: number;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Prompt template for agent communication
 */
export interface AgentPrompt {
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, any>;
  examples?: Array<{
    input: string;
    output: AgentAction[];
  }>;
}

// ============================================================================
// MAIN AGENT INTERFACE
// ============================================================================

/**
 * Core interface that all agents must implement
 */
export interface IAgent {
  /**
   * Initialize the agent with configuration
   * @param config - Agent configuration including orchestrator and type
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config: AgentConfig): Promise<void>;

  /**
   * Get actions from the agent based on DOM analysis
   * @param dom - The page DOM structure to analyze
   * @param prompt - Custom prompt for the agent
   * @param permissions - What the agent is allowed to do
   * @returns Promise that resolves to agent actions
   */
  getActions(
    dom: PageDOM,
    prompt: AgentPrompt,
    permissions: AgentPermissions
  ): Promise<AgentResult>;

  /**
   * Check if the agent is ready to process requests
   * @returns Promise that resolves to readiness status
   */
  isReady(): Promise<boolean>;

  /**
   * Get agent status and health information
   * @returns Promise that resolves to agent status
   */
  getStatus(): Promise<{
    isReady: boolean;
    lastUsed: Date;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    errors: string[];
  }>;

  /**
   * Clean up resources when agent is no longer needed
   * @returns Promise that resolves when cleanup is complete
   */
  cleanup(): Promise<void>;

  /**
   * Get agent capabilities and supported features
   * @returns Agent capabilities information
   */
  getCapabilities(): {
    supportedTypes: AgentType[];
    supportedActions: ActionType[];
    maxConcurrentRequests: number;
    supportedLanguages: string[];
    requiresInternet: boolean;
    requiresAPIKey: boolean;
  };
}

// ============================================================================
// AGENT FACTORY AND REGISTRY
// ============================================================================

/**
 * Factory function type for creating agents
 */
export type AgentFactory = (config: AgentConfig) => Promise<IAgent>;

/**
 * Registry for agent factories
 */
export interface AgentRegistry {
  register(orchestrator: AgentOrchestrator, factory: AgentFactory): void;
  create(config: AgentConfig): Promise<IAgent>;
  getSupportedOrchestrators(): AgentOrchestrator[];
  getSupportedTypes(): AgentType[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Batch processing result for multiple agents
 */
export interface BatchAgentResult {
  results: Map<AgentType, AgentResult>;
  summary: {
    totalActions: number;
    averageConfidence: ConfidenceLevel;
    processingTime: number;
    errors: string[];
  };
}

/**
 * Agent orchestration strategy
 */
export enum OrchestrationStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CASCADE = 'cascade',
  VOTING = 'voting'
}

/**
 * Configuration for agent orchestration
 */
export interface OrchestrationConfig {
  strategy: OrchestrationStrategy;
  agents: AgentConfig[];
  timeout: number;
  retryAttempts: number;
  confidenceThreshold: ConfidenceLevel;
  severityThreshold: SeverityLevel;
}
