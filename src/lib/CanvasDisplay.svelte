<!-- CanvasDisplay.svelte -->
<script>
	import Button from './Button.svelte';	
	import ButtonContainer from './ButtonContainer.svelte';


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

<div>
	<!-- Display canvas and buttons here -->
	<canvas
		bind:this={canvas}
		width={width * scale}
		height={height * scale}
		style="width: {width * scale}px; height: {height * scale}px;"
	/>
	<ButtonContainer>
		<Button label={"Step"} onClick={onStepClick} disabled={!programLoaded} style={"default"}/> 
		<Button label={"Run"} onClick={onRunClick} disabled={!programLoaded} style={"default"}/>
		<Button label={"Stop"} onClick={onStopClick} disabled={!programLoaded} style={"default"}/>
		<Button label={"End"} onClick={onEndClick} disabled={!programLoaded} style={"default"}/>
	</ButtonContainer>
</div>