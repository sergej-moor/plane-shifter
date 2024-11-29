<script lang="ts">
    import { rotation } from '../stores/rotation';
    import { Utils } from 'svelte-tweakpane-ui';

    $: perspective = `perspective(${1000 / Math.tan(($rotation.fov * Math.PI) / 360)}px)`;
    $: transform = perspective + ' ' + Utils.eulerToCssTransform($rotation) + ` scale(${$rotation.zoom})`;
    
    $: valueRows = Object.entries($rotation)
        .map(([key, v]) => `${key}: ${v >= 0 ? '+' : ''}${v.toFixed(6)}`)
        .join('\n');
</script>

<div class="viewport">
    <div class="scene">
        <div class="billboard" style:transform>
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
