<script lang="ts">
    import {
        Button,
        Ring,
        RotationEuler,
        type RotationEulerValueObject,
        type RingUnit
    } from 'svelte-tweakpane-ui';
    import { rotation } from '../stores/rotation';
    import { capture } from '../stores/capture';
    import { selection } from '../stores/selection';

    let value: RotationEulerValueObject = {
        x: 0,
        y: 0,
        z: 0
    };

    let zoom = 1;
    let fov = 75;

    let zoomUnitConfig: RingUnit = {
        value: 0.1,
        pixels: 40,
        ticks: 5
    };

    let fovUnitConfig: RingUnit = {
        value: 5,
        pixels: 40,
        ticks: 5
    };

    $: rotation.update(r => ({
        ...r,
        ...value,
        zoom,
        fov
    }));

    function handleReset() {
        value = {
            x: 0,
            y: 0,
            z: 0
        };
        zoom = 1;
        fov = 75;
    }

    function handleLoadSelection() {
        window.parent.postMessage({
            type: "load-selection"
        }, '*');
    }
</script>

<div class="flex flex-col gap-4">
    <div class="selection-info">
        {#if $selection.selectedName}
            <span class="selected">Selected: {$selection.selectedName}</span>
        {:else}
            <span class="none-selected">No element selected</span>
        {/if}
    </div>

    <RotationEuler
        bind:value
        expanded={true}
        label="3D Transform"
        picker={'inline'}
    />

    <Ring
        bind:value={zoom}
        label="Zoom"
        format={(v) => `${v.toFixed(2)}x`}
        min={0.1}
        max={3}
        pointerScale={-2.5}
        unit={zoomUnitConfig}
        wide={true}
    />

    <Ring
        bind:value={fov}
        label="FOV"
        format={(v) => `${v.toFixed(0)}°`}
        min={45}
        max={120}
        pointerScale={-2.5}
        unit={fovUnitConfig}
        wide={true}
    />

    <div class="flex gap-2">
        <Button
            on:click={handleReset}
            title="Reset"
        />
        <Button
            on:click={() => $capture.captureView()}
            title="Capture View"
        />
        <Button
            on:click={handleLoadSelection}
            title="Load Selection"
        />
    </div>
</div>

<style>
    .gap-4 {
        gap: 1rem;
    }
    .gap-2 {
        gap: 0.5rem;
    }
    .selection-info {
        padding: 8px;
        border-radius: 4px;
        background: var(--panel-background);
        font-size: 0.9em;
    }
    .none-selected {
        color: var(--text-disabled);
    }
    .selected {
        color: var(--text-primary);
    }
</style>