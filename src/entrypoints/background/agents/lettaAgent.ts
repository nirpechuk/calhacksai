import type { AgentResult } from '@/utils/types';
import { LettaClient } from '@letta-ai/letta-client';
import { Agent } from './agent';


export class LettaAgent extends Agent {
  private client?: LettaClient;
  private lettaAgentId: string;

  constructor(agentId: string, mission: string) {
    super(mission);
    this.lettaAgentId = agentId;
  }

  /**
   * Initialize the agent with API key
   */
  initialize(apiKey: string): void {
    try {
      // Update client with provided API key
      this.client = new LettaClient({
        baseUrl: 'https://app.letta.com',
        token: apiKey,
      });

      this.isInitialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Letta fact checker agent: ${errorMessage}`);
    }
  }

  /**
   * Get fact-checking actions from the Letta agent based on DOM analysis
   */
  async getActions(dom: string): Promise<AgentResult> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Letta fact checker agent not initialized. Call initialize() first.');
    }
    try {
      const content = this.getMessage(dom);

      console.log('Sending message to agent:', this.lettaAgentId);
      console.log(`Message content (len: ${content.length}):\n${content}`);

      await this.client.agents.messages.reset(this.lettaAgentId);

      // let run = await this.client.agents.messages.createAsync(this.lettaAgentId, {
      //   messages: [
      //     { role: 'user', content },
      //   ],
      // });

      // // poll the run status every 1 second
      // while (run.status !== 'completed' && run.id) {
      //   await new Promise(resolve => setTimeout(resolve, 1000));
      //   run = await this.client.runs.retrieve(run.id);
      // }

      // Send message to Letta agent with unique timestamp to prevent loops
      const response = await this.client.agents.messages.create(this.lettaAgentId, {
        messages: [
          { role: 'user', content },
        ],
      });

      console.log('Response received:', JSON.stringify(response, null, 2));

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
      const validatedActions = this.validateAgentActions(parsedData);

      return {
        success: true,
        actions: validatedActions,
      };

    } catch (error) {
      console.error('Error getting actions from Letta agent:\n', error);

      return {
        success: false,
        actions: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Check if the agent is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.lettaAgentId;
  }
}
