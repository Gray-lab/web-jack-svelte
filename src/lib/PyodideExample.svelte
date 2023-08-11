<script>
	let outputText = 'Initializing...\n';
	let inputValue = 'sum([1, 2, 3, 4, 5])';

	function addToOutput(s) {
		outputText += '>>>' + inputValue + '\n' + s + '\n';
	}

	import { onMount } from 'svelte';

    let pyodide;
	onMount(async () => {
		pyodide = await loadPyodide();
        outputText += "Ready!\n"
	});

	async function evaluatePython() {
		try {
			const output = await pyodide.runPythonAsync(inputValue);
			addToOutput(output);
		} catch (err) {
			addToOutput(err);
		}
	}
</script>


<svelte:head>
	<script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
</svelte:head>


<div>
	<p>
		You can execute any Python code. Just enter something in the box below and click the button.
	</p>
	<input bind:value={inputValue} />
	<button on:click={evaluatePython}>Run</button>
	<br />
	<br />
	<div>Output:</div>
	<textarea bind:value={outputText} style="width: 100%;" rows="6" disabled />
</div>
