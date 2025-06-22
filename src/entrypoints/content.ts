import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import "../app.css";

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

export default defineContentScript({
  allFrames: true,
  matches: ["<all_urls>"],
  main(ctx) {
    // const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"
    console.log("Content script mounting Svelte component.");

    // Inject styles once when content script loads
    injectAnimationStyles();

    const target = document.createElement("div");
    target.id = "highlight-container";
    document.body.appendChild(target);

    // Define multiple highlight actions with different handlers and target selectors
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
    ];

    // Mount the Svelte component with actions
    mount(Highlight, {
      target,
      context: new Map([["wxt:context", ctx]]),
      props: {
        actions: highlightActions,
      }
    });
  },
});
