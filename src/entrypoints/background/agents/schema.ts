/**
 * JSON Schema for AgentAction validation
 * 
 * This schema defines the expected structure of AgentAction objects
 * returned by the Letta fact-checking agent.
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