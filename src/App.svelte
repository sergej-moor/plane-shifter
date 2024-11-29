<script lang="ts">
  import Canvas from './components/Canvas.svelte';
  import Controls from './components/Controls.svelte';
  import { theme, updateTheme } from './stores/theme';
  import { selection } from './stores/selection';
  import { rotation } from './stores/rotation';
  
  let loadedImage: string | null = null;
  
  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    if (!message) return;

    if (message.type === 'theme') {
      updateTheme(message.content);
    } else if (message.type === 'selection-update') {
      selection.update(s => ({
        ...s,
        selectedName: message.name
      }));
    } else if (message.type === 'selection-loaded') {
      console.log("hallo")
      const { imageData, width, height } = message;
      
      // Convert array back to Uint8Array
      const uint8Array = new Uint8Array(imageData);
      
      // Create blob and object URL
      const blob = new Blob([uint8Array], { type: 'image/png' });
      loadedImage = URL.createObjectURL(blob);
      console.log(loadedImage)
      // Update rotation store with new dimensions
      rotation.update(r => ({
        ...r,
        width,
        height
      }));
    }
  }
</script>

<svelte:window onmessage={handleMessage} />

<main data-theme={$theme}>
  <h1>Plugin Template</h1>
  <div class="flex">
    <Controls></Controls>
    <Canvas {loadedImage} />
  </div>
</main>

<style>
  main {
    padding: var(--spacing-8);
  }
</style>



