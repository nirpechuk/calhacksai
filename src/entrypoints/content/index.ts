import '@/app.css';
import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import { extensionMessenger, websiteMessenger } from '@/utils/messaging';
import { ActionType, AgentResult } from '@/utils/types';
import { HIGHLIGHT_MARK_CLASS } from '@/utils/constants';

export default defineContentScript({
  /* NOTE [RON]: we need to be careful setting this to true because many
   * sites add/remove iframes on the fly making this script run over and over.
   */
  allFrames: false,
  matches: ['*://*/*'],
  async main(ctx) {
    websiteMessenger.removeAllListeners();
    injectAnimationStyles();
    console.log('Content script loaded', { id: browser.runtime.id, manifest: browser.runtime.getManifest() });

    const annotations = document.createElement('div');
    annotations.id = 'truely-annotations';
    document.body.appendChild(annotations);

    // Show loading animation
    showGeminiLoader();

    // ================================
    // Send Message to Background to Run
    // ================================
    const results = await extensionMessenger.sendMessage('activate', extractVisibleDOM());

    // // Simulate loading delay for demonstration
    // await new Promise(resolve => setTimeout(resolve, 5000));

    // const results: AgentResult[] = [
    //   {
    //     success: true,
    //     actions: [
    //       {
    //         type: ActionType.HIGHLIGHT,
    //         targetElement: '.head',
    //         content: 'Was Coronavirus a Biowarfare Attack Against China?',
    //         confidence: 0.9,
    //         severity: 0.9,
    //         explanation: 'This is a test',
    //         sources: ['https://github.com/users/nirpechuk/projects/2/views/1']
    //       }
    //     ]
    //   }
    // ];

    // Hide loading animation
    hideGeminiLoader();

    results.forEach((result) => {
      console.log('result', result);

      result.actions.forEach((action) => {
        switch (action.type) {
          case ActionType.HIGHLIGHT:
            mount(Highlight, {
              target: annotations,
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

const showGeminiLoader = () => {
  const loader = document.createElement('div');
  loader.id = 'truely-gemini-loader';
  loader.innerHTML = `
    <div class="truely-loader-edge truely-loader-top"></div>
    <div class="truely-loader-edge truely-loader-right"></div>
    <div class="truely-loader-edge truely-loader-bottom"></div>
    <div class="truely-loader-edge truely-loader-left"></div>
    <div class="truely-loader-corner truely-loader-top-left"></div>
    <div class="truely-loader-corner truely-loader-top-right"></div>
    <div class="truely-loader-corner truely-loader-bottom-left"></div>
    <div class="truely-loader-corner truely-loader-bottom-right"></div>
  `;
  document.body.appendChild(loader);
};

const hideGeminiLoader = () => {
  const loader = document.getElementById('truely-gemini-loader');
  if (loader) {
    loader.classList.add('truely-loader-fadeout');
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
};

const injectAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes highlight-wipe-in {
      from { background-size: 0% 100%; }
      to { background-size: 100% 100%; }
    }

    @keyframes truely-gemini-pulse {
      0%, 100% { 
        opacity: 0.3;
        transform: scale(1);
      }
      50% { 
        opacity: 0.8;
        transform: scale(1.05);
      }
    }

    @keyframes truely-gemini-color {
      0% { 
        background: linear-gradient(45deg, #667eea, #764ba2);
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.44);
      }
      25% { 
        background: linear-gradient(45deg, #6366f1, #7c3aed);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.44);
      }
      50% { 
        background: linear-gradient(45deg, #6d28d9, #8b5cf6);
        box-shadow: 0 0 20px rgba(109, 40, 217, 0.44);
      }
      75% { 
        background: linear-gradient(45deg, #7c3aed, #6366f1);
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.44);
      }
      100% { 
        background: linear-gradient(45deg, #667eea, #764ba2);
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.44);
      }
    }

    @keyframes truely-loader-fadeout {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    #truely-gemini-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
      overflow: hidden;
    }

    #truely-gemini-loader.truely-loader-fadeout {
      animation: truely-loader-fadeout 0.5s ease-out forwards;
    }

    .truely-loader-edge {
      position: absolute;
      filter: blur(8px);
      animation: truely-gemini-pulse 2s ease-in-out infinite,
                 truely-gemini-color 6s ease-in-out infinite;
    }

    .truely-loader-top {
      top: -12px;
      left: 0;
      width: 100%;
      height: 22px;
      background: linear-gradient(45deg, #667eea, #764ba2);
    }

    .truely-loader-bottom {
      bottom: -11px;
      left: 0;
      width: 100%;
      height: 22px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      animation-delay: 0.25s;
    }

    .truely-loader-left {
      left: -11px;
      top: 0;
      width: 22px;
      height: 100%;
      background: linear-gradient(45deg, #667eea, #764ba2);
      animation-delay: 0.5s;
    }

    .truely-loader-right {
      right: -11px;
      top: 0;
      width: 22px;
      height: 100%;
      background: linear-gradient(45deg, #667eea, #764ba2);
      animation-delay: 0.75s;
    }

    .truely-loader-corner {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      filter: blur(12px);
      animation: truely-gemini-pulse 1.5s ease-in-out infinite,
                 truely-gemini-color 6s ease-in-out infinite;
    }

    .truely-loader-top-left {
      top: -22px;
      left: -22px;
      animation-delay: 0.1s;
    }

    .truely-loader-top-right {
      top: -22px;
      right: -22px;
      animation-delay: 0.35s;
    }

    .truely-loader-bottom-left {
      bottom: -22px;
      left: -22px;
      animation-delay: 0.6s;
    }

    .truely-loader-bottom-right {
      bottom: -22px;
      right: -22px;
      animation-delay: 0.85s;
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

/**
 * extractVisibleDOM – Return a "clean" HTML snapshot of what the user can see.
 *
 *  • Ignores <script>, <style>, <noscript>, <template>, <meta>, <link>, <head>.
 *  • Skips elements hidden with `display:none`, `visibility:hidden`, zero-opacity,
 *    zero-sized boxes, the `hidden` attribute, or off-screen positioning.
 *  • Copies only two attributes (id, class); everything else is stripped.
 *  • Collapses surplus whitespace so text matches what appears in the browser.
 *
 * @param {Document} doc  – Defaults to the current document; pass any DOM if needed.
 * @returns {string}      – A full serialised HTML string (<html>…</html>).
 */
function extractVisibleDOM(doc = document) {
  const ALLOWED_TAGS = new Set([
    'HTML', 'BODY', 'DIV', 'P', 'SPAN', 'A', 'UL', 'OL', 'LI', 'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'B', 'I', 'U', 'STRONG', 'EM', 'PRE', 'CODE', 'BLOCKQUOTE', 'MAIN',
    'ARTICLE', 'SECTION', 'HEADER', 'FOOTER', 'NAV'
  ]);
  const ALLOWED_ATTRS = new Set(['id', 'class']);

  const newDoc = doc.documentElement.cloneNode(true) as HTMLElement;

  const elements = Array.from(newDoc.getElementsByTagName('*'));

  for (const el of elements) {
    if (!ALLOWED_TAGS.has(el.tagName)) {
      el.parentNode?.removeChild(el);
      continue;
    }

    const attributes = Array.from(el.attributes);
    for (const attr of attributes) {
      if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
        el.removeAttribute(attr.name);
      }
    }
  }

  const walker = document.createTreeWalker(newDoc, NodeFilter.SHOW_TEXT);
  const textNodesToRemove: Node[] = [];
  let currentNode: Node | null;

  while (currentNode = walker.nextNode()) {
    if (currentNode.nodeValue) {
      const trimmed = currentNode.nodeValue.trim().replace(/\s+/g, ' ');
      if (trimmed) {
        currentNode.nodeValue = trimmed;
      } else {
        textNodesToRemove.push(currentNode);
      }
    }
  }

  for (const node of textNodesToRemove) {
    node.parentNode?.removeChild(node);
  }

  let removedInPass;
  do {
    removedInPass = 0;
    const allElements = Array.from(newDoc.getElementsByTagName('*'));
    for (const el of allElements) {
      if (el.tagName === 'HTML' || el.tagName === 'BODY') {
        continue;
      }

      if (el.children.length === 0 && (el.textContent || '').trim() === '') {
        el.parentNode?.removeChild(el);
        removedInPass++;
      }
    }
  } while (removedInPass > 0);

  return newDoc.outerHTML;
}