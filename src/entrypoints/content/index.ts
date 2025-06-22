import '@/app.css';
import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import { extensionMessenger, websiteMessenger } from '@/utils/messaging';
import { ActionType } from '@/utils/types';

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
    const cleanHTMLContent = extractCleanContent(document.body.outerHTML);
    const results = await extensionMessenger.sendMessage('activate', cleanHTMLContent);

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

const extractCleanContent = (htmlString: string): string => {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Elements to remove completely
  const elementsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'embed', 'object',
    'applet', 'canvas', 'svg', 'math', 'form', 'input', 'textarea',
    'select', 'button', 'nav', 'header', 'footer', 'aside',
    'meta', 'link', 'base', 'title', 'head', 'img', 'picture'
  ];

  // Remove unwanted elements
  elementsToRemove.forEach(tagName => {
    const elements = tempDiv.querySelectorAll(tagName);
    elements.forEach(el => el.remove());
  });

  // Remove elements with specific classes/attributes that are typically non-content
  const nonContentSelectors = [
    '[class*="ad"]', '[class*="banner"]', '[class*="sidebar"]',
    '[class*="nav"]', '[class*="menu"]', '[class*="footer"]',
    '[class*="header"]', '[class*="cookie"]', '[class*="popup"]',
    '[class*="modal"]', '[class*="overlay"]', '[class*="tooltip"]',
    '[data-ad]', '[data-banner]', '[aria-hidden="true"]',
    '[style*="display: none"]', '[style*="visibility: hidden"]'
  ];

  nonContentSelectors.forEach(selector => {
    const elements = tempDiv.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Remove inline styles and classes to clean up the HTML
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove style attributes
    el.removeAttribute('style');

    // Remove class attributes (optional - comment out if you want to keep classes)
    // el.removeAttribute('class');

    // Remove data attributes (except data-* that might be important for content)
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('data-') &&
        !['data-content', 'data-text', 'data-value'].includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove event handlers
    const eventAttributes = ['onclick', 'onload', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
    eventAttributes.forEach(attr => el.removeAttribute(attr));
  });

  // Get the cleaned HTML
  let cleanHTML = tempDiv.innerHTML;

  // Remove excessive whitespace and normalize
  cleanHTML = cleanHTML
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();

  // Truncate if needed
  if (cleanHTML.length > 15000) {
    // Try to truncate at a word boundary
    const truncated = cleanHTML.substring(0, 15000);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 15000 * 0.8) { // Only truncate at word if it's not too far back
      cleanHTML = truncated.substring(0, lastSpace) + '...';
    } else {
      cleanHTML = truncated + '...';
    }
  }

  return cleanHTML;
};