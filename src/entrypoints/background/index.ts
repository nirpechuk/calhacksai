import { extensionMessenger } from "@/utils/messaging";
import { createLettaAgent } from "./agents/lettaAgent";

// const prompt = `
// You are a fact checker. You will investigate all facts that are even slightly non-reputable by using
// the web_search tool and finding respectable, trusted sources (not forums or blogs) speaking on the
// matter. However, only run at most 1-2 successful web_search functions for each fact, because you
// want to return results as fast and as soon as possible. Make sure to use the tool properly and pay
// special attention to your request.`

const prompt = `Return the container of the first instance of the word "svelte". It is very important that you do not use ANY tools under any circumstances.`

export default defineBackground(() => {
  console.log('Background script loaded', { id: browser.runtime.id });

  const agent = createLettaAgent(import.meta.env.VITE_LETTA_AGENT_ID || '');
  agent.initialize(import.meta.env.VITE_LETTA_API_KEY || ''); // TODO: Can't await here what to do?

  extensionMessenger.onMessage('activate', async (message) => {
    console.log('activate', message);

    const result = await agent.getActions(message.data, prompt);
    console.log('result', result);

    if (message.sender.tab?.id) {
      extensionMessenger.sendMessage('highlight', result.actions[0].targetElement, message.sender.tab.id);
    }
  });
});