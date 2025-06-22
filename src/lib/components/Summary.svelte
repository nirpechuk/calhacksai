<script lang="ts">
  import type { AgentAction } from '@/utils/types';
  import { slide } from 'svelte/transition';

  export let action: AgentAction;
  let visible = true;

  function handleClose() {
    visible = false;
  }
</script>

{#if visible}
<div class="summary-card" transition:slide>
  <div class="summary-header">
    <h3>Summary</h3>
    <button on:click={handleClose}>&times;</button>
  </div>
  <div class="summary-content">
    <p>{action.explanation}</p>
  </div>
  <div class="summary-footer">
    <p>Confidence: {Math.round(action.confidence * 100)}%</p>
    {#if action.sources.length > 0}
      <a href={action.sources[0]} target="_blank" rel="noopener noreferrer">Source</a>
    {/if}
  </div>
</div>
{/if}

<style>
  .summary-card {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    font-family: sans-serif;
    color: #333;
    display: flex;
    flex-direction: column;
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f7f7f7;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .summary-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .summary-header button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #888;
    padding: 0;
    line-height: 1;
  }

  .summary-header button:hover {
    color: #333;
  }

  .summary-content {
    padding: 16px;
    font-size: 14px;
    line-height: 1.5;
    max-height: 300px;
    overflow-y: auto;
  }

  .summary-footer {
    padding: 12px 16px;
    border-top: 1px solid #e0e0e0;
    background-color: #f7f7f7;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #666;
  }

  .summary-footer a {
    color: #007bff;
    text-decoration: none;
  }

  .summary-footer a:hover {
    text-decoration: underline;
  }
</style>