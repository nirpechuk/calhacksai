import '@/app.css';
import Content from "./Content.svelte";
import { mount } from "svelte";
import { extensionMessenger, websiteMessenger } from '@/utils/messaging';

export default defineContentScript({
  /* NOTE [RON]: we need to be careful setting this to true because many
   * sites add/remove iframes on the fly making this script run over and over.
   */
  allFrames: false,
  matches: ['*://*/*'],
  main() {
    websiteMessenger.removeAllListeners();
    console.log('Content script loaded', { id: browser.runtime.id, manifest: browser.runtime.getManifest() });

    // ================================
    // Initialize Message Listeners
    // ================================
    extensionMessenger.onMessage('highlight', (message) => {
      console.log('highlight', message);
    });

    // ================================
    // Send Message to Background to Run
    // ================================
    extensionMessenger.sendMessage('activate');

    // ================================
    // Mount Content w/ Annotations
    // ================================
    mount(Content, {
      target: document.body
    })
  }
});
