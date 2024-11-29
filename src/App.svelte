<script lang="ts">
  import Canvas from './components/Canvas.svelte';
  import Controls from './components/Controls.svelte';
  import { theme, updateTheme } from './stores/theme';
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'theme') {
      updateTheme(event.data.content);
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  <h1>Plugin Template</h1>
  <!-- Add your plugin UI components here -->
   <div class="flex">
    <Controls></Controls>
   <Canvas></Canvas>
   </div>
</main>

<style>
  main {
    padding: var(--spacing-8);
  }
</style>



