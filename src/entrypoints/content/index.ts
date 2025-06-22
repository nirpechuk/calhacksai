import '@/app.css';
import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import { extensionMessenger, websiteMessenger } from '@/utils/messaging';
import { ActionType } from '@/utils/types';

const highlightActions = [
  {
    keyword: "Svelte",
    targetSelector: 'div.PZPZlf.ssJ7i.B5dxMb[aria-level="2"][data-attrid="title"][role="heading"]',
    onHover: () => {
      console.log('Hovered over Svelte - could show framework info');
    },
    onClick: () => {
      console.log('Clicked on Svelte - could open framework docs');
    }
  },
  // TODO: Add more TEST actions here as needed
];

export default defineContentScript({
  /* NOTE [RON]: we need to be careful setting this to true because many
   * sites add/remove iframes on the fly making this script run over and over.
   */
  allFrames: false,
  matches: ['*://*/*'],
  async main(ctx) {
    websiteMessenger.removeAllListeners();
    console.log('Content script loaded', { id: browser.runtime.id, manifest: browser.runtime.getManifest() });

    const annotations = document.createElement('div');
    annotations.id = 'truely-annotations';
    document.body.appendChild(annotations);

    // ================================
    // Send Message to Background to Run
    // ================================
    const visibleContent = document.body.querySelector('#uOz6nd')!.innerHTML.slice(0, 5000);
    const results = await extensionMessenger.sendMessage('activate', visibleContent);

    results.forEach((result) => {
      console.log('result', result);

      result.actions.forEach((action) => {
        switch (action.type) {
          case ActionType.HIGHLIGHT:
            const targetElement = document.querySelector(action.targetElement);
            if (!targetElement) {
              console.warn(`Target element not found for selector: ${action.targetElement}`);
              return;
            }
            mount(Highlight, {
              target: targetElement,
              context: new Map([["wxt:context", ctx]]),
              props: {
                action: action,
              }
            });
            break;
          default:
            console.log(`Unsupported action type: ${action.type}\nAction: ${JSON.stringify(null, null, 2)}`);
            break;
        }
      });
    });
  }
});
