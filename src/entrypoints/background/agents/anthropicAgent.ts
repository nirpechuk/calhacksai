import Anthropic from '@anthropic-ai/sdk';
import type { AgentResult } from '@/utils/types';
import { Agent } from './agent';
import { anthropicSystemPrompt } from './system-prompt';

export class AnthropicAgent extends Agent {
  private client?: Anthropic;

  constructor(mission: string) {
    super(mission);
  }

  /**
   * Initialize the agent with API key
   */
  initialize(apiKey: string): void {
    if (!apiKey) {
      throw new Error('Anthropic API key is required to initialize the agent.');
    }
    try {
      this.client = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      this.isInitialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Anthropic agent: ${errorMessage}`);
    }
  }

  /**
   * Get actions from the Anthropic agent based on DOM analysis
   */
  async getActions(dom: string): Promise<AgentResult> {
    if (!this.isInitialized || !this.client) {
      throw new Error('Anthropic agent not initialized. Call initialize() first.');
    }
    try {
      const content = this.getMessage(dom);

      const stream = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        system: anthropicSystemPrompt,
        messages: [{ role: 'user', content }],
        stream: true,
      });

      let fullResponse = '';
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullResponse += event.delta.text;
        }
      }

      console.log('Streamed response received:', fullResponse);

      if (!fullResponse) {
        throw new Error('No assistant response received from Anthropic agent');
      }

      let parsedData: any;
      try {
        const jsonMatch = fullResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          const arrayStartIndex = fullResponse.indexOf('[');
          if (arrayStartIndex > -1) {
            const jsonString = fullResponse.substring(arrayStartIndex);
            parsedData = JSON.parse(jsonString);
          } else {
            parsedData = JSON.parse(fullResponse);
          }
        }
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON response from Anthropic agent: ${
            parseError instanceof Error ? parseError.message : 'Unknown parse error'
          }`
        );
      }

      const validatedActions = this.validateAgentActions(parsedData);

      return {
        success: true,
        actions: validatedActions,
      };
    } catch (error) {
      console.error('Error getting actions from Anthropic agent:\n', error);
      return {
        success: false,
        actions: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  protected getMessage(dom: string): string {
    return `Your purpose: ${this.mission}\n\nAnyways, here is the DOM: ${dom}`;
  }
}
