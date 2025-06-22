<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getContext } from 'svelte';

  // Define the structure for highlight actions
  interface HighlightAction {
    keyword: string;
    targetSelector: string;
    onHover?: () => void;
    onClick?: () => void;
  }

  // Props
  let {
    actions = [{ keyword: "Svelte", targetSelector: "body" }], // Array of highlight actions
    ...props
  } = $props<{
    actions?: HighlightAction[];
    class?: string;
  }>();

  // Get WXT context if available
  const ctx = getContext('wxt:context');

  // Use the same constants as defined in content.ts
  const HIGHLIGHT_MARK_CLASS = 'text-highlighter-mark';

  const clearHighlights = () => {
    const existingMarks = document.querySelectorAll(`mark[data-highlight="true"]`);
    existingMarks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
  };

  const addEventListeners = (keyword: string, onHover?: () => void, onClick?: () => void) => {
    // Find marks that contain this specific keyword
    const marks = document.querySelectorAll(`mark[data-highlight="true"]`);
    marks.forEach(mark => {
      const markText = mark.textContent || '';
      // Only add listeners if this mark contains our keyword
      if (markText.toLowerCase().includes(keyword.toLowerCase())) {
        // Add hover event
        if (onHover) {
          mark.addEventListener('mouseenter', () => {
            onHover();
          });
        }

        // Add click event
        if (onClick) {
          mark.addEventListener('click', () => {
            onClick();
          });
        }
      }
    });
  };

  const highlightText = (actions: HighlightAction[]) => {
    if (!actions.length) return;

    // Clear existing highlights first
    clearHighlights();

    // Process each action
    actions.forEach(action => {
      const { keyword, targetSelector, onHover, onClick } = action;
      if (!keyword.trim()) return;

      // Get the target element to search within for this action
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Target element not found for selector: ${targetSelector} (keyword: ${keyword})`);
        return;
      }

      // Get all text nodes within the target element
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(
        targetElement,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if parent is already highlighted or is a script/style
            const parent = node.parentElement;
            if (parent?.closest(`.${HIGHLIGHT_MARK_CLASS}`) ||
                parent?.tagName === 'SCRIPT' ||
                parent?.tagName === 'STYLE' ||
                parent?.isContentEditable) {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip empty text nodes
            if (!node.nodeValue?.trim()) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      // Collect all text nodes for this target
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
      }

      const regex = new RegExp(`(${keyword})`, 'gi');

      textNodes.forEach(node => {
        const nodeValue = node.nodeValue;
        if (nodeValue && regex.test(nodeValue)) {
          const span = document.createElement('span');
          span.innerHTML = nodeValue.replace(regex, `<mark class="${HIGHLIGHT_MARK_CLASS}" data-highlight="true" data-keyword="${keyword}">$1</mark>`);
          node.parentNode?.replaceChild(span, node);
        }
      });

      // Add event listeners for this specific keyword
      addEventListeners(keyword, onHover, onClick);
    });
  };

  // Watch for actions changes
  $effect(() => {
    if (actions.length) {
      highlightText(actions);
    }
  });

  onMount(() => {
    console.log('Highlight.svelte component mounted, highlighting actions:', actions);
    highlightText(actions);
  });

  onDestroy(() => {
    // Clean up highlights when component is destroyed
    clearHighlights();
  });
</script>

<div data-highlight-container class={props.class || ''}>
  <!-- This component doesn't render visible content, it just manages highlights -->
</div>
