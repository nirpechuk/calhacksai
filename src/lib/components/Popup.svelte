<script lang="ts">
  import { onMount } from 'svelte';
  import type { AgentAction } from '@/utils/types';

  let { action, iconRect, onMouseEnter, onMouseLeave, ...props } = $props<{
    action: AgentAction;
    iconRect: DOMRect;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    [key: string]: any;
  }>();

  let popupEl: HTMLElement;

  onMount(() => {
    document.body.appendChild(popupEl);

    const popupRect = popupEl.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const margin = 8;

    // Vertical positioning
    let top = iconRect.bottom + 5;
    if (top + popupRect.height > vh - margin) {
      top = iconRect.top - popupRect.height - 5;
    }
    if (top < margin) { top = margin; }

    // Horizontal positioning
    let left;
    const isIconOnRight = (iconRect.left + iconRect.width / 2) > (vw / 2);

    if (isIconOnRight) {
      left = iconRect.right - popupRect.width;
    } else {
      left = iconRect.left;
    }

    if (left < margin) { left = margin; }
    if (left + popupRect.width > vw - margin) {
      left = vw - popupRect.width - margin;
    }

    popupEl.style.top = `${top}px`;
    popupEl.style.left = `${left}px`;
    popupEl.style.opacity = '1';

    return () => {
        if (popupEl.parentNode) {
            popupEl.parentNode.removeChild(popupEl);
        }
    }
  });
</script>

<div
  bind:this={popupEl}
  class="note-popup-global"
  {...props}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
>
  <div class="popup-content-wrapper">
    <div class="popup-section">
      <strong class="popup-title">Explanation</strong>
      <p class="popup-text">{action.explanation}</p>
    </div>
    <div class="popup-section popup-meta">
      <div>
        <strong class="popup-title">Confidence</strong>
        <span class="popup-value">{(action.confidence * 100).toFixed(0)}%</span>
      </div>
      <div>
        <strong class="popup-title">Severity</strong>
        <span class="popup-value">{(action.severity * 100).toFixed(0)}%</span>
      </div>
    </div>
    <div class="popup-section">
      <strong class="popup-title">Sources</strong>
      <ol class="popup-source-list">
        {#each action.sources as source, i}
          <li>
            <span class="popup-source-number">[{i + 1}]</span>
            <a class='w-fit' href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname}</a>
          </li>
        {/each}
      </ol>
    </div>
  </div>
</div>

<style>
  .note-popup-global {
    position: fixed;
    opacity: 0;
    z-index: 10000;
    width: 320px;
    background-color: white;
    border: 2px solid rgba(196, 181, 253, 1);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: opacity 0.2s ease-in-out;
    
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    color: #1a202c;
    line-height: 1.5;
    text-align: left;
  }

  .popup-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .popup-section {
    /* Base section styling */
  }

  .popup-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7fafc;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #edf2f7;
  }

  .popup-title {
    font-weight: 600;
    color: #4a5568;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .popup-text {
    margin: 0;
    color: #2d3748;
  }

  .popup-value {
    font-weight: 600;
    font-size: 16px;
    color: #1a202c;
  }

  .popup-source-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 13px;
  }
  
  .popup-source-number {
    font-family: monospace;
    color: #4a5568;
  }

  .popup-source-list li a {
    color: #4299e1;
  }
</style> 