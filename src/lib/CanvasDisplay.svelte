<!-- CanvasDisplay.svelte -->
<script>
	import Button from './Button.svelte';
	import ButtonContainer from './ButtonContainer.svelte';

	export let canvas;
	export let width = 512;
	export let height = 256;
	export let scale = 1;
	export let programLoaded = false;
	export let running = false;
	export let onStepClick;
	export let onRunClick;
	export let onStopClick;
	export let onEndClick;
</script>

<div>
	<!-- Display canvas and buttons here -->
	<canvas
		bind:this={canvas}
		width={width * scale}
		height={height * scale}
		style="width: {width * scale}px; height: {height * scale}px;"
	/>
	<ButtonContainer>
		<Button onClick={onRunClick} disabled={!programLoaded} style={'default'}>Run</Button>
		<Button onClick={onStopClick} disabled={!programLoaded || !running} style={'default'}>Pause</Button>
		<Button onClick={onStepClick} disabled={!programLoaded} style={'default'}>Step</Button>
		<Button onClick={onEndClick} disabled={!programLoaded} style={'default'}>End</Button>
	</ButtonContainer>
</div>
