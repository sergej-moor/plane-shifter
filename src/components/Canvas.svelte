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

    $: perspective = `perspective(${1000 / Math.tan(($rotation.fov * Math.PI) / 360)}px)`;
    $: transform = perspective + ' ' + Utils.eulerToCssTransform($rotation) + ` scale(${$rotation.zoom})`;
    
    $: valueRows = Object.entries($rotation)
        .map(([key, v]) => `${key}: ${v >= 0 ? '+' : ''}${v.toFixed(6)}`)
        .join('\n');

    // Update store with dimensions based on loaded image or default size
    $: if (billboardElement) {
        const width = imageWidth || 400;
        const height = imageHeight || 400;
        
        if (width !== $rotation.width || height !== $rotation.height) {
            console.log('Updating dimensions:', { width, height });
            rotation.update(r => ({
                ...r,
                width,
                height
            }));
        }
    }

    // Register capture function
    $: if (billboardElement) {
        capture.registerCapture(async () => {
            console.log('Starting capture process...');
            
            try {
                const rect = billboardElement.getBoundingClientRect();
                const actualWidth = Math.round(rect.width);
                const actualHeight = Math.round(rect.height);

                console.log('Converting DOM to image with dimensions:', {
                    width: actualWidth,
                    height: actualHeight
                });

                const blob = await domtoimage.toBlob(billboardElement, {
                    width: actualWidth,
                    height: actualHeight,
                    style: {
                        transform,
                        'transform-origin': 'center',
                        width: `${actualWidth}px`,
                        height: `${actualHeight}px`
                    },
                    bgcolor: null,
                });
                
                console.log('Blob created, size:', blob.size);

                const arrayBuffer = await blob.arrayBuffer();
                const imageData = new Uint8Array(arrayBuffer);
                console.log('Final image data size:', imageData.length);
                
                window.parent.postMessage({
                   
                        type: 'add-capture',
                        imageData,
                        width: $rotation.width,
                        height: $rotation.height
                    
                }  satisfies PluginMessageEvent, '*');

                console.log('Capture sent to plugin');
            } catch (error) {
                console.error('Error in capture process:', error);
                if (error instanceof Error) {
                    console.error('Error name:', error.name);
                    console.error('Error message:', error.message);
                    console.error('Stack trace:', error.stack);
                } else {
                    console.error('Unknown error type:', error);
                }
            }
        });
    }
</script>

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

<style>
    .viewport {
        overflow: hidden; 
        position: relative;
        border: 1px solid black;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
</style>
