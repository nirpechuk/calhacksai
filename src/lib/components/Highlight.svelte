<script lang="ts">
    import { AgentAction } from '@/utils/types';
    import { onMount, onDestroy } from 'svelte';
    import Popup from './Popup.svelte';
    import { HIGHLIGHT_MARK_CLASS } from '@/utils/constants';
    // Props - now takes a single action instead of an array
    let {
      action,
      underline_only = false,
      ...props
    } = $props<{
      action: AgentAction;
      underline_only?: boolean;
      class?: string;
    }>();

    let popupVisible = $state(false);
    let iconRect: DOMRect | null = $state(null);
    let hideTimer: number | null = null;

    const startHideTimer = () => {
      hideTimer = window.setTimeout(() => {
        popupVisible = false;
      }, 200);
    };

    const cancelHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const showPopup = (event: Event) => {
      cancelHideTimer();
      const markEl = event.currentTarget as HTMLElement;
      iconRect = markEl.getBoundingClientRect();
      popupVisible = true;
    };

    const clearHighlights = () => {
      // Only clear highlights for this specific keyword
      const existingSpans = document.querySelectorAll(`span[data-highlight="true"][data-content="${action.content}"]`);
      existingSpans.forEach(span => {
        const parent = span.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(span.textContent || ''), span);
          parent.normalize(); // Merge adjacent text nodes
        }
      });
    };

    const addEventListeners = () => {
      // Find spans that contain this specific keyword
      const spans = document.querySelectorAll(`span[data-highlight="true"][data-content="${action.content}"]`);
      spans.forEach(span => {
        const spanText = span.textContent || '';
        // Only add listeners if this span contains our keyword
        if (spanText.toLowerCase().includes(action.content.toLowerCase())) {
          span.addEventListener('mouseenter', showPopup);
          span.addEventListener('mouseleave', startHideTimer);
        }
      });
    };

    const highlightText = () => {
      const { content, targetElement } = action;
      if (!content.trim()) return;

      // Get the target element to search within for this action
      const el = document.querySelector(targetElement);
      if (!el) {
        console.warn(`Target element not found for selector: ${targetElement} (content: ${content})`);
        return;
      }

      const regex = new RegExp(`(${content})`, 'gi');

      const walk = (node: Node) => {
        if (node.nodeType === 3) { // TEXT_NODE
          const parent = node.parentElement;
          // Reject if parent is already highlighted or is content-editable
          if (!parent || parent.closest(`.${HIGHLIGHT_MARK_CLASS}`) || parent.isContentEditable) {
            return;
          }
          const nodeValue = node.nodeValue;
          if (nodeValue && regex.test(nodeValue)) {
            const span = document.createElement('span');
            const klasses = [HIGHLIGHT_MARK_CLASS];
            if (underline_only) {
              klasses.push('underline-only');
            }
            const classString = klasses.join(' ');
            span.innerHTML = nodeValue.replace(regex, `<span class="${classString}" data-highlight="true" data-content="${content}">$1</span>`);
            node.parentNode!.replaceChild(span, node);
          }
        } else if (node.nodeType === 1) { // ELEMENT_NODE
          const el = node as HTMLElement;
          // Do not traverse into certain elements
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.isContentEditable || el.closest(`.${HIGHLIGHT_MARK_CLASS}`)) {
            return;
          }
          // Traverse children
          const children = Array.from(node.childNodes);
          for (const child of children) {
            walk(child);
          }
        }
      };

      walk(el);

      // Add event listeners for this specific keyword
      addEventListeners();
    };

    onMount(() => {
      console.log('Highlight.svelte component mounted:', action);
      highlightText();
    });

    onDestroy(() => {
      // Clean up highlights when component is destroyed
      clearHighlights();
    });
  </script>

  {#if popupVisible && iconRect}
    <Popup {action} {iconRect} onMouseEnter={cancelHideTimer} onMouseLeave={startHideTimer} />
  {/if}

  <div data-highlight-container class={props.class || ''}>
    <!-- This component doesn't render visible content, it just manages highlights -->
  </div>