/**
 * Validation utilities for AgentAction responses
 */

import { AgentAction, ActionType } from '../types/agent';
import { agentActionSchema } from './schema';

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

    // Validate sources array
    if (!Array.isArray(action.sources) || action.sources.length === 0) {
      throw new Error(`Invalid sources at index ${index}: must be a non-empty array`);
    }

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