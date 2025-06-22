import '@/app.css';
import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import { extensionMessenger, websiteMessenger } from '@/utils/messaging';

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
  main(ctx) {
    websiteMessenger.removeAllListeners();
    injectAnimationStyles();
    console.log('Content script loaded', { id: browser.runtime.id, manifest: browser.runtime.getManifest() });

    // ================================
    // Initialize Message Listeners
    // ================================
    extensionMessenger.onMessage('highlight', (message) => {
      console.log('highlight', message);
      highlightActions.forEach((action) => {
        mount(Highlight, {
          target: document.querySelector(message.data) as HTMLElement,
          context: new Map([["wxt:context", ctx]]),
          props: {
            action: action,
          }
        });
      });
    });

    // ================================
    // Send Message to Background to Run
    // ================================

    const visibleContent = document.body.querySelector('#uOz6nd')!.innerHTML.slice(0, 5000);
    extensionMessenger.sendMessage('activate', visibleContent);
  }
});


// Animation styles - only need to be injected once
const ANIMATION_STYLE_ID = 'text-highlighter-animation-style';
const HIGHLIGHT_MARK_CLASS = 'text-highlighter-mark';

const injectAnimationStyles = () => {
  if (document.getElementById(ANIMATION_STYLE_ID)) {
    return; // Styles already injected
  }
  const style = document.createElement('style');
  style.id = ANIMATION_STYLE_ID;
  style.textContent = `
    @keyframes highlight-wipe-in {
      from { background-size: 0% 100%; }
      to { background-size: 100% 100%; }
    }

    .${HIGHLIGHT_MARK_CLASS} {
      background-image: linear-gradient(to right, rgba(196, 181, 253, 0.5), rgba(196, 181, 253, 0.5));
      background-repeat: no-repeat;
      background-size: 0% 100%;
      border-bottom: 2px solid rgba(196, 181, 253, 1);
      background-color: transparent;
      color: inherit;
      animation: highlight-wipe-in 0.4s ease-out forwards;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 3px;
      padding: 1px 2px;
    }

    .${HIGHLIGHT_MARK_CLASS}:hover {
      background-image: linear-gradient(to right, rgba(196, 181, 253, 0.7), rgba(196, 181, 253, 0.7));
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(196, 181, 253, 0.3);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
};