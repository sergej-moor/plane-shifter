<script lang="ts">
    import { rotation } from '../stores/rotation';
    import { capture } from '../stores/capture';
    import { Utils } from 'svelte-tweakpane-ui';
    import type { PluginMessageEvent } from '../types';
    import domtoimage from 'dom-to-image';

    let billboardElement: HTMLDivElement;

    $: perspective = `perspective(${1000 / Math.tan(($rotation.fov * Math.PI) / 360)}px)`;
    $: transform = perspective + ' ' + Utils.eulerToCssTransform($rotation) + ` scale(${$rotation.zoom})`;
    
    $: valueRows = Object.entries($rotation)
        .map(([key, v]) => `${key}: ${v >= 0 ? '+' : ''}${v.toFixed(6)}`)
        .join('\n');

    // Update store with actual element dimensions
    $: if (billboardElement) {
        const rect = billboardElement.getBoundingClientRect();
        const actualWidth = Math.round(rect.width);
        const actualHeight = Math.round(rect.height);
        
        if (actualWidth !== $rotation.width || actualHeight !== $rotation.height) {
            console.log('Updating dimensions:', { width: actualWidth, height: actualHeight });
            rotation.update(r => ({
                ...r,
                width: actualWidth,
                height: actualHeight
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

<div class="viewport">
    <div class="scene">
        <div 
            bind:this={billboardElement} 
            class="billboard" 
            style:transform
        >
            <pre>{valueRows}</pre>
        </div>
    </div>
</div>

<style>
    .viewport {
        width: 400px;
        height: 400px;
        overflow: hidden; 
        position: relative;
        border: 1px solid black;
    }

    .scene {
        perspective-origin: center;
        width: 100%;
        height: 100%;
        position: absolute; 
        left: 0;
        top: 0;
    }

    .billboard {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, magenta, orange);
        transform-origin: center;
        position: absolute; 
    }
</style>
