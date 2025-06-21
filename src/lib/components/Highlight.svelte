<script lang="ts">
  import { onMount } from 'svelte';
  const ANIMATION_STYLE_ID = 'text-highlighter-animation-style';
  const HIGHLIGHT_MARK_CLASS = 'text-highlighter-mark';

  // Inject the CSS needed for the animation into the page's head.
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
      }
    `;
    document.head.appendChild(style);
  };

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

  const highlightText = (keyword: string) => {
    if (!keyword.trim()) return;

    const regex = new RegExp(`(${keyword})`, 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (parent?.closest(`.${HIGHLIGHT_MARK_CLASS}`) || parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE' || parent?.isContentEditable) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue?.trim() || !regex.test(node.nodeValue)) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodesToHighlight: Text[] = [];
    while (walker.nextNode()) {
      nodesToHighlight.push(walker.currentNode as Text);
    }

    for (const node of nodesToHighlight) {
      const span = document.createElement('span');
      const nodeValue = node.nodeValue;
      if (nodeValue) {
        span.innerHTML = nodeValue.replace(regex, `<mark class="${HIGHLIGHT_MARK_CLASS}" data-highlight="true">$1</mark>`);
        node.parentNode?.replaceChild(span, node);
      }
    }
  };

  onMount(() => {
    console.log('Highlight.svelte component mounted, highlighting "Svelte".');
    injectAnimationStyles();
    // TODO @ann: get the keyword to highlight from LLM actions
    highlightText("Svelte");
  });
</script>
