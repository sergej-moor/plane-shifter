<script lang="ts">
    import { rotation } from '../stores/rotation';
    import { capture } from '../stores/capture';
    import { Utils } from 'svelte-tweakpane-ui';
    import type { PluginMessageEvent } from '../types';
    import domtoimage from 'dom-to-image';
    import { selection } from '../stores/selection';
  import { LucideLoader } from 'lucide-svelte';
    export let loadedImage: string | null = null;
    export let imageWidth: number | null = null;
    export let imageHeight: number | null = null;
    
    let billboardElement: HTMLDivElement;
    let exportCanvas: HTMLDivElement;

    $: perspective = `perspective(${1000 / Math.tan(($rotation.fov * Math.PI) / 360)}px)`;
    $: transform = perspective + ' ' + Utils.eulerToCssTransform($rotation) + ` scale(${$rotation.zoom})`;
    
    $: valueRows = Object.entries($rotation)
        .map(([key, v]) => `${key}: ${v >= 0 ? '+' : ''}${v.toFixed(6)}`)
        .join('\n');

    // Update store with dimensions and calculate scale to fit viewport in container
    $: if (billboardElement) {
        // Calculate initial dimensions to fill container
        const containerSize = 400;
        const padding = 32; // 16px padding on each side
        const availableSpace = containerSize - padding;
        
        let width, height;
        
        if (imageWidth && imageHeight) {
            // Calculate which dimension to fit to
            const aspectRatio = imageWidth / imageHeight;
            
            if (aspectRatio > 1) {
                // Image is wider than tall - fit to width
                width = availableSpace;
                height = width / aspectRatio;
            } else {
                // Image is taller than wide - fit to height
                height = availableSpace;
                width = height * aspectRatio;
            }
        } else {
            width = availableSpace;
            height = availableSpace;
        }
        
        // Update dimensions in rotation store
        if (width !== $rotation.width || height !== $rotation.height) {
            console.log('Updating dimensions:', { width, height });
            rotation.update(r => ({
                ...r,
                width,
                height
            }));
        }

        // Calculate and apply scale for container fit
        const scale = Math.min(
            availableSpace / width,
            availableSpace / height
        );
        
        // Apply scale to viewport
        const viewport = billboardElement.closest('.viewport') as HTMLElement;
        if (viewport) {
            viewport.style.setProperty('--viewport-scale', scale.toString());
        }
    }

    // Register capture function
    $: if (billboardElement && loadedImage) {
        capture.registerCapture(async () => {
            console.log('Starting capture process...');
            
            try {
                // Get original dimensions
                const originalWidth = imageWidth!;
                const originalHeight = imageHeight!;

                console.log('Converting image with dimensions:', {
                    originalWidth,
                    originalHeight,
                    transform,
                    zoom: $rotation.zoom
                });

                // Convert canvas to blob
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), 'image/png');
                });
                
                console.log('Blob created, size:', blob.size);

                const arrayBuffer = await blob.arrayBuffer();
                const imageData = new Uint8Array(arrayBuffer);
                
                // Send original dimensions
                window.parent.postMessage({
                    type: 'add-capture',
                    imageData,
                    width: originalWidth,
                    height: originalHeight
                } satisfies PluginMessageEvent, '*');

                console.log('Capture sent to plugin');
            } catch (error) {
                console.error('Error in capture process:', error);
                if (error instanceof Error) {
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
        });
    }
</script>

<div class="fixed-container">
    <div class="viewport" style:width="{imageWidth || 400}px" style:height="{imageHeight || 400}px">
        <div class="scene">
            <div 
                bind:this={billboardElement} 
                class="billboard" 
                style:transform
            >
                {#if $selection.isLoading}
                    <div class="loading-spinner">
                        <LucideLoader class="animate-[spin_2s_ease-in-out_infinite]" />
                    </div>
                {:else if loadedImage}
                    <img 
                        src={loadedImage} 
                        alt="Loaded selection"
                        style="
                            width: 100%; 
                            height: 100%; 
                            object-fit: contain;
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                            -ms-interpolation-mode: nearest-neighbor;
                            backface-visibility: hidden;
                            padding: 16px;
                        "
                    />
                {:else}
                    <div class="placeholder">
                        <pre>{valueRows}</pre>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    

</div>

<style>
    .fixed-container {
        width: 400px;
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 1px solid black;
        background: var(--panel-background);
    }

    .viewport {
        position: relative;
        transform-origin: center;
        /* Scale the viewport to fit within container while preserving aspect ratio */
        scale: var(--viewport-scale, 1);
    }

    .scene {
        perspective-origin: center;
        width: 100%;
        height: 100%;
        position: absolute; 
        left: 0;
        top: 0;
        transform-style: preserve-3d;
        backface-visibility: hidden;
    }

    .billboard {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        transform-origin: center;
        position: absolute;
        transform-style: preserve-3d;
        backface-visibility: hidden;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--panel-background);
    }

    .billboard img {
        max-width: 100%;
        max-height: 100%;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        -ms-interpolation-mode: nearest-neighbor;
        backface-visibility: hidden;
    }

    @-moz-document url-prefix() {
        .billboard img {
            image-rendering: -moz-crisp-edges;
        }
    }

    .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--panel-background);
    }

/*     .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--text-disabled);
        border-top: 4px solid var(--text-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    } */

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .export-canvas {
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        perspective-origin: center;
        perspective: inherit;
    }
</style>
