<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getContext } from 'svelte';
    import type { AgentAction } from '@/utils/types';
  
    // Props - now takes a single action instead of an array
    let {
      action,
      ...props
    } = $props<{
      action: AgentAction;
      class?: string;
    }>();
  
    // Get WXT context if available
    const ctx = getContext('wxt:context');
  
    // Use the same constants as defined in content.ts
    const HIGHLIGHT_MARK_CLASS = 'text-highlighter-mark';
  
    const clearHighlights = () => {
      // Only clear highlights for this specific keyword
      const existingMarks = document.querySelectorAll(`mark[data-highlight="true"][data-keyword="${action.keyword}"]`);
      existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
          parent.normalize(); // Merge adjacent text nodes
        }
      });
    };
  
    const addEventListeners = () => {
      // Find marks that contain this specific keyword
      const marks = document.querySelectorAll(`mark[data-highlight="true"][data-keyword="${action.keyword}"]`);
      marks.forEach(mark => {
        const markText = mark.textContent || '';
        // Only add listeners if this mark contains our keyword
        if (markText.toLowerCase().includes(action.keyword.toLowerCase())) {
          // Add hover event
          if (action.onHover) {
            mark.addEventListener('mouseenter', () => {
              action.onHover!();
            });
          }
  
          // Add click event
          if (action.onClick) {
            mark.addEventListener('click', () => {
              action.onClick!();
            });
          }
        }
      });
    };
  
    const highlightText = () => {
      const { content, targetSelector } = action;
      if (!content.trim()) return;
  
      // Get the target element to search within for this action
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Target element not found for selector: ${targetSelector} (content: ${content})`);
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
            span.innerHTML = nodeValue.replace(regex, `<mark class="${HIGHLIGHT_MARK_CLASS}" data-highlight="true" data-keyword="${keyword}">$1</mark>`);
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

      walk(targetElement);
  
      // Add event listeners for this specific keyword
      addEventListeners();
    };
  
    onMount(() => {
      console.log('Highlight.svelte component mounted:', action.content);
      highlightText();
    });
  
    onDestroy(() => {
      // Clean up highlights when component is destroyed
      clearHighlights();
    });
  </script>
  
  <div data-highlight-container class={props.class || ''}>
    <!-- This component doesn't render visible content, it just manages highlights -->
  </div>