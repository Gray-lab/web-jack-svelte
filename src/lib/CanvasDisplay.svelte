<!-- CanvasDisplay.svelte -->
<script>
	export let canvas;
	export let width = 512;
	export let height = 256;
	export let scale = 1;
	export let programLoaded = false;
	export let onStepClick;
	export let onRunClick;
	export let onStopClick;
	export let onEndClick;
</script>

<div class="canvas-container">
	<!-- Display canvas and buttons here -->
	<canvas
		bind:this={canvas}
		width={width * scale}
		height={height * scale}
		style="width: {width * scale}px; height: {height * scale}px;"
	/>
	<div class="btn-container">
		<button class="btn" disabled={!programLoaded} on:click={onStepClick}>Step</button>
		<button class="btn" disabled={!programLoaded} on:click={onRunClick}>Run</button>
		<button class="btn" on:click={onStopClick}>Stop</button>
		<button class="btn" on:click={onEndClick}>End</button>
	</div>
</div>
