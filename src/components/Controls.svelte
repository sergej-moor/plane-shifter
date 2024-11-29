<script lang="ts">
    import {
        Button,
        Ring,
        RotationEuler,
        type RotationEulerValueObject,
        type RingUnit
    } from 'svelte-tweakpane-ui';
    import { rotation } from '../stores/rotation';

    let value: RotationEulerValueObject = {
        x: 0,
        y: 0,
        z: 0
    };

    let zoom = 1;
    let fov = 75;  // Initial FOV

    // Zoom configuration
    let zoomUnitConfig: RingUnit = {
        value: 0.1,
        pixels: 40,
        ticks: 5
    };

    // FOV configuration
    let fovUnitConfig: RingUnit = {
        value: 5,  // Step size of 5 degrees
        pixels: 40,
        ticks: 5
    };

    // Update store when values change
    $: $rotation = {
        ...value,
        zoom,
        fov
    };
</script>

<div class="flex flex-col">
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

    <Button
        on:click={() => {
            value = {
                x: 0,
                y: 0,
                z: 0
            };
            zoom = 1;
            fov = 75;
        }}
        title="Reset"
    />
</div>