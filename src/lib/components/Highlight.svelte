<script lang="ts">
    import { AgentAction } from '@/utils/types';
    import { getContext } from 'svelte';
    // Get WXT context if available
    const ctx = getContext('wxt:context');
    let {
      action,
      ...props
    } = $props<{
      action: AgentAction;
      class?: string;
    }>();
</script>

<button
  class="highlight-wipe-in w-full bg-gradient-to-r from-violet-300/50 to-violet-300/50 bg-no-repeat border-b-2 border-violet-300 bg-transparent cursor-pointer transition-all duration-200 ease-out rounded-[3px] px-0.5 py-px text-left hover:from-violet-300/70 hover:to-violet-300/70 hover:scale-[1.02] hover:shadow-[0_2px_8px_rgba(196,181,253,0.3)] hover:rounded-md {props.class}"
  {...props}
>
  {action.explanation}
</button>

<style>
  @keyframes highlight-wipe-in {
    from {
      background-size: 0% 100%;
    }
    to {
      background-size: 100% 100%;
    }
  }

  .highlight-wipe-in {
    background-size: 0% 100%;
    animation: highlight-wipe-in 0.4s ease-out forwards;
  }
</style>

