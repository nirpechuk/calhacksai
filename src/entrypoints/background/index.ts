import { extensionMessenger } from "@/utils/messaging";

export default defineBackground(() => {
  console.log('Background script loaded', { id: browser.runtime.id });

  extensionMessenger.onMessage('activate', (message) => {
    console.log('activate', message);
    if (message.sender.tab?.id) {
      extensionMessenger.sendMessage('highlight', 'body', message.sender.tab.id);
    }
  });
});