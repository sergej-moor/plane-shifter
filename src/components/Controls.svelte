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
</script>

<div class="flex flex-col ">
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

    <div class="flex flex-col gap-2">
        <Button
            on:click={handleReset}
            title="Reset"
        />
        <Button
            on:click={() => $capture.captureView()}
            title="Capture View"
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
</style>