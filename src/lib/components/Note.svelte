<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { AgentAction } from '@/utils/types';
  import Popup from './Popup.svelte';

  let { action, class: className } = $props<{
    action: AgentAction;
    class?: string;
  }>();

  const NOTE_WRAPPER_CLASS = 'note-annotation-wrapper';

  let targetEl: HTMLElement | null = null;
  let originalHTML: string | null = null;
  
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

    const iconWrapper = event.currentTarget as HTMLElement;
    iconRect = iconWrapper.getBoundingClientRect();
    popupVisible = true;
  };

  onMount(() => {
    const { content, targetElement } = action;
    if (!content.trim()) return;

    targetEl = document.querySelector(targetElement);
    if (!targetEl) {
      console.warn(`Target element not found for selector: ${targetElement}`);
      return;
    }

    originalHTML = targetEl.innerHTML;
    const escapedContent = content.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedContent, 'g');

    if (regex.test(originalHTML)) {
      const noteElementHTML = `
          <div class="note-annotation-container ${className || ''}">
            <div class="note-icon-wrapper">
              <div class="note-icon"></div>
            </div>
          </div>`;

      const replacementHTML = `<span class="${NOTE_WRAPPER_CLASS}" style="position: relative;">${content}${noteElementHTML}</span>`;

      targetEl.innerHTML = originalHTML.replace(regex, replacementHTML);

      targetEl.querySelectorAll('.note-icon-wrapper').forEach(el => {
        el.addEventListener('mouseenter', showPopup);
        el.addEventListener('mouseleave', startHideTimer);
      });
    }
  });

  onDestroy(() => {
    popupVisible = false;
    if (targetEl && originalHTML !== null) {
      targetEl.innerHTML = originalHTML;
    }
  });
</script>

{#if popupVisible && iconRect}
    <Popup 
        {action}
        {iconRect}
        onMouseEnter={cancelHideTimer}
        onMouseLeave={startHideTimer}
    />
{/if}

<style>
  @keyframes expand-margin {
    from {
      margin-right: 0;
    }
    to {
      margin-right: 6px;
    }
  }

  @keyframes fade-in-scale-up {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  :global(.note-annotation-wrapper) {
    position: relative;
    animation: expand-margin 0.3s ease-out forwards;
  }

  :global(.note-annotation-container) {
    position: absolute;
    top: -6px;
    right: -4px;
    z-index: 1;
    animation: fade-in-scale-up 0.3s ease-out forwards;
  }

  :global(.note-icon-wrapper) {
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.note-icon) {
    width: 12px;
    height: 12px;
    background-color: rgba(196, 181, 253, 1);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;
  }
</style>
