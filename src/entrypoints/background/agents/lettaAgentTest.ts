#!/usr/bin/env node

/**
 * Simple test script for Letta Fact Checker Agent
 * Run with: npm run test:letta
 */

import { createLettaFactCheckerAgent } from './lettaAgent';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testLettaAgent() {
  console.log('🧪 Testing Letta Fact Checker Agent...\n');

  try {
    // Create agent
    const agent = createLettaFactCheckerAgent();
    console.log('✅ Agent created successfully');

    // Set agent ID (you'll need to create an agent in Letta console first)
    const agentId = process.env.LETTA_AGENT_ID || '';
    if (!agentId) {
      throw new Error('LETTA_AGENT_ID environment variable is required. Create an agent in Letta console and get its ID.');
    }
    agent.setAgentId(agentId);
    console.log(`📋 Using agent ID: ${agentId}`);

    // Initialize with API key
    const apiKey = process.env.LETTA_API_KEY || '';
    if (!apiKey) {
      throw new Error('LETTA_API_KEY environment variable is required');
    }
    
    await agent.initialize(apiKey);
    console.log('✅ Agent initialized successfully');
    console.log(`📋 Agent ID: ${agent.getAgentId()}`);

    // Test with a simple DOM
    const testDom = `
      <html>
        <body>
          <h1>Test Page</h1>
          <p>The moon is made of cheese.</p>
          <p>This is a factual statement about Earth's natural satellite.</p>
        </body>
      </html>
    `;

    console.log('\n🔍 Testing fact-checking analysis...');
    const result = await agent.getActions(testDom);

    if (result.success) {
      console.log('✅ Analysis completed successfully');
      console.log(`📊 Found ${result.actions.length} actions`);
      
      if (result.actions.length > 0) {
        console.log('\n📝 Sample action:');
        const action = result.actions[0];
        console.log(`  Type: ${action.type}`);
        console.log(`  Target: ${action.targetElement}`);
        console.log(`  Content: "${action.content}"`);
        console.log(`  Confidence: ${action.confidence}`);
        console.log(`  Severity: ${action.severity}`);
        console.log(`  Explanation: ${action.explanation}`);
        console.log(`  Sources: ${action.sources.length} URLs`);
      }
    } else {
      console.log('❌ Analysis failed');
      console.log('Errors:', result.errors);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testLettaAgent(); 