/**
 * Letta Fact Checker Agent Implementation
 * 
 * This module implements the IAgent interface for the Letta fact-checking agent.
 * It uses the official Letta client to communicate with the Letta API
 * to analyze web pages for misinformation and return structured annotations.
 */

import { IAgent, AgentResult, validateAgentActions } from '../types/agent';
import { LettaClient } from '@letta-ai/letta-client';


export class LettaAgent implements IAgent {
  private client: LettaClient;
  private agentId?: string;
  private isInitialized = false;

  constructor(agentId: string) {
    // Initialize with default Letta Cloud configuration
    this.client = new LettaClient({
      baseUrl: 'https://app.letta.com',
      token: '',
    });
    this.agentId = agentId;
  }

  /**
   * Initialize the agent with API key
   */
  async initialize(apiKey: string): Promise<void> {
    try {
      // Update client with provided API key
      this.client = new LettaClient({
        baseUrl: 'https://app.letta.com',
        token: apiKey,
      });

      // Check if agent ID is set
      if (!this.agentId) {
        throw new Error('Agent ID not set. Please create an agent in the Letta console and set the agent ID using setAgentId() before calling initialize().');
      }

      this.isInitialized = true;
      console.log('Letta fact checker agent initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Letta fact checker agent: ${errorMessage}`);
    }
  }

  /**
   * Get fact-checking actions from the Letta agent based on DOM analysis
   */
  async getActions(dom: string, prompt: string): Promise<AgentResult> {
    if (!this.isInitialized) {
      throw new Error('Letta fact checker agent not initialized. Call initialize() first.');
    }

    if (!this.agentId) {
      throw new Error('No Letta agent ID available. Call initialize() first.');
    }

    try {
      // Prepare the message content
      const messageContent = `Your purpose: ${prompt} Remember to use the output format exactly as specified in the JSON schema. Anyways, here is the DOM:\n\n${dom}`;
      
      console.log('Sending message to agent:', this.agentId);
      console.log('Message content length:', messageContent.length);

      // Send message to Letta agent with unique timestamp to prevent loops
      const response = await this.client.agents.messages.create(this.agentId, {
        messages: [
          {
            role: 'user',
            content: `[${new Date().toISOString()}] ${messageContent}`,
          },
        ],
      });

      console.log('Response received, message count:', response.messages.length);
      console.log('Message types:', response.messages.map(m => m.messageType));

      // Extract the assistant's response
      let assistantContent = '';
      for (const message of response.messages) {
        if (message.messageType === 'assistant_message' && message.content) {
          // Handle the content which might be an array of text content
          if (Array.isArray(message.content)) {
            assistantContent = message.content
              .map(item => typeof item === 'string' ? item : item.text || '')
              .join('');
          } else if (typeof message.content === 'string') {
            assistantContent = message.content;
          }
          break;
        }
      }

      if (!assistantContent) {
        throw new Error('No assistant response received from Letta agent');
      }

      console.log("Raw assistantContent: ", assistantContent);

      // Try to parse JSON from the response
      let parsedData: any;
      try {
        // Look for JSON in the response (it might be wrapped in markdown code blocks)
        const jsonMatch = assistantContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire response as JSON
          parsedData = JSON.parse(assistantContent);
        }
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response from Letta agent: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
      }

      // Validate the response against our schema
      const validatedActions = validateAgentActions(parsedData);

      return {
        success: true,
        actions: validatedActions,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting actions from Letta agent:', errorMessage);
      
      return {
        success: false,
        actions: [],
        errors: [errorMessage],
      };
    }
  }

  /**
   * Set a specific agent ID (useful for testing or when you have a pre-created agent)
   */
  setAgentId(agentId: string): void {
    this.agentId = agentId;
  }

  /**
   * Get the current agent ID
   */
  getAgentId(): string | undefined {
    return this.agentId;
  }

  /**
   * Check if the agent is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.agentId;
  }
}

/**
 * Create a new Letta fact checker agent instance
 */
export function createLettaAgent(agentId: string): LettaAgent {
  return new LettaAgent(agentId);
}
