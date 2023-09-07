<script>
	import init, { Program } from '../../jack-vm/pkg';
	import { jackCode } from '$lib/jackcode.js';
	import { myTheme } from '$lib/codeMirrorTheme.js';
	import { onMount } from 'svelte';
	import Button from '../lib/Button.svelte';
	import ButtonContainer from '../lib/ButtonContainer.svelte';
	import CodeMirror, { basicSetup } from '../lib/CodeMirror.svelte';
	import CanvasDisplay from '../lib/CanvasDisplay.svelte';
	import MemoryCell from '../lib/MemoryCell.svelte';
	import Modal from '../lib/Modal.svelte';

	// Canvas scale (1.0 -> 512px x 256px)
	const scale = 1.5;
	const width = 512;
	const height = 256;

	let start;
	let end;
	let canvas;
	let ctx;
	let program;
	let bytecodeStore;
	let jackcodeStore;
	let ramSize;
	let ramPointer;
	let wasmInstance;
	let interval;
	let compiler;
	let pyodide;
	let currentKey = 0;
	let running = false;
	let programLoaded = false;
	let pythonLoaded = false;
	let compiled = false;
	let showWindowWarning = false;
	let showInstructions = false;

	$: showMem = false;
	let memArray = new Array(500).fill(0);
	$: stepCount = 20;

	export let upper_container_height = scale * height + 100;

	// set active preset from the jackCode array
	$: preset = 0;
	$: defaultJackcode = jackCode.at(preset).code;
	const defaultBytecode = `/* Compile Jack code to
populate this window */`;

	// button and keyboard handlers
	function onKeyDown(e) {
		if (running) e.preventDefault();
		console.log(e.key);
		if (e.key.length === 1) {
			currentKey = e.key.charCodeAt(0);
		} else if (e.key in input_map) {
			currentKey = input_map[e.key];
		}
	}

	function onKeyUp(e) {
		if (running) e.preventDefault();
		currentKey = 0;
	}

	function onStepClick() {
		runLoop(1);
		// assignment triggers reactive update in Svelte
		memArray = memArray;
	}

	function onRunClick() {
		running = true;
		interval = setInterval(() => {
			requestAnimationFrame(runLoopCallback);
			const finished = program.finished;
			if (finished) {
				running = false;
				clearInterval(interval);
				memArray = memArray;
			}
		}, 0);
	}

	function onStopClick() {
		running = false;
		clearInterval(interval);
		memArray = memArray;
	}

	function onEndClick() {
		running = false;
		programLoaded = false;
		program.end();
		clearInterval(interval);
		memArray = memArray;
	}

	function onCompileClick() {
		compiled = true;
		console.log('compiling...');
		console.log($jackcodeStore);
		const res = compiler.compile_main($jackcodeStore);
		bytecodeStore.set(res);
	}

	function onLoadClick() {
		program = new Program($bytecodeStore, ctx, canvas);
		programLoaded = true;
		ramSize = program.ram_size();
		ramPointer = program.ram();
		memArray = new Int16Array(wasmInstance.memory.buffer, ramPointer, ramSize);
	}

	function changeHandler({ detail: { tr } }) {
		// nothing we need to do here
	}

	// Keyboard input map for non-standard mappings
	const input_map = {
		Enter: 128,
		Backspace: 129,
		ArrowLeft: 130,
		ArrowUp: 131,
		ArrowRight: 132,
		ArrowDown: 133,
		Home: 134,
		End: 135,
		PageUp: 136,
		PageDown: 137,
		Insert: 138,
		Delete: 139,
		Escape: 140,
		F1: 141,
		F2: 142,
		F3: 143,
		F4: 144,
		F5: 145,
		F6: 146,
		F7: 147,
		F8: 148,
		F9: 149,
		F10: 150,
		F11: 151,
		F12: 152
	};

	// main run loop
	function runLoop(stepCount) {
		// runs stepCount instructions for every animation frame
		for (let i = 0; i < stepCount; i++) {
			program.step(currentKey);
		}
		// if (showMem) memArray = memArray; // assignment triggers reactive update in Svelte
	}

	function runLoopCallback() {
		runLoop(stepCount);
	}

	onMount(async () => {
		// at less than 1080px width, canvas starts to be covered by edge of window
		showWindowWarning = document.documentElement.clientWidth < 1080;

		// init initializes memory addresses needed by WASM and that will be used by JS/TS
		wasmInstance = await init();

		// wasmInstance.memory gives us direct access to the memory underlying the jack runtime
		// console.log(wasmInstance);

		ctx = canvas.getContext('2d', {
			willReadFrequently: true,
			alpha: false
		});
		canvas.setAttribute('id', 'display-canvas');

		console.log('Loading...');
		pyodide = await loadPyodide();
		// this fetches the .py files from the static folder and writes them
		// to the virtual file system that pyodide can access
		await pyodide.runPythonAsync(`
			from pyodide.http import pyfetch
			response = await pyfetch("/pyodide/compilation_engine.py")
			with open("compilation_engine.py", "wb") as f:
				f.write(await response.bytes())
			response = await pyfetch("/pyodide/jack_analyzer.py")
			with open("jack_analyzer.py", "wb") as f:
				f.write(await response.bytes())
			response = await pyfetch("/pyodide/jack_token.py")
			with open("jack_token.py", "wb") as f:
				f.write(await response.bytes())
			response = await pyfetch("/pyodide/jack_tokenizer.py")
			with open("jack_tokenizer.py", "wb") as f:
				f.write(await response.bytes())
			response = await pyfetch("/pyodide/symbol_table.py")
			with open("symbol_table.py", "wb") as f:
				f.write(await response.bytes())
			response = await pyfetch("/pyodide/vm_writer.py")
			with open("vm_writer.py", "wb") as f:
				f.write(await response.bytes())
			`);

		compiler = pyodide.pyimport('jack_analyzer');
		pythonLoaded = true;
		console.log('Jack Compiler loaded');
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
</svelte:head>

<!-- need to have this only prevent default if a program is running -->
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<Modal bind:showModal={showWindowWarning} closeText="OK">
	<div slot="body" class="modal-body default-txt">
		<p>
			This website works best on a desktop with a wider window. <br />Please increase your browser
			width for an optimal experience.
		</p>
	</div>
</Modal>

<Modal bind:showModal={showInstructions}>
	<div slot="header" class="modal-header default-txt">Instructions</div>
	<div slot="body" class="modal-body default-txt">
		<ol>
			<li>Select a sample program or write your own using the Custom preset</li>
			<br />
			<li>Once the Jack code is ready, click Compile to compile to bytecode</li>
			<br />
			<li>
				The bytecode can be edited freely. When you are ready to run the program, click load program
				to initialize the runtime. This will initialize the memory and prepare to execute the
				bytecode instructions.
			</li>
			<br />
			<li>
				When the program is loaded it can either be stepped through instruction by instruction using
				the Step button, or Run. Stepping will update the memory display at each step, while running
				will only update the memory when the program is paused.
			</li>
		</ol>
		<p>
			Note: Loading a new preset will clear any edits. Copy and paste the code to save it locally if
			you want to retain any changes.
		</p>
	</div>
</Modal>

<div class="app-container">
	<div class="inner-container">
		<div class="upper-container" style="--upper-container-height: {upper_container_height}px;">
			<div class="intro-container default-txt">
				<div class="nav-container">
					<h3 class="title"><a href="/">web_jack</a></h3>
					<div class="nav-item"><a href="/license">License</a></div>
					<div class="nav-item">
						<a href="https://www.github.com/Gray-lab" rel="noopener noreferrer" target="_blank"
							>My Github</a
						>
					</div>
				</div>
				<p class="intro-text">
					During my journey to become a software engineer, <a
						href="https://www.nand2tetris.org/"
						rel="noopener noreferrer"
						target="_blank">Nand to Tetris</a
					>
					was instrumental in showing me the joy of computing. Inspired by the work I did in that course,
					this website lets anyone write, compile, and execute code written in the Jack language.
					<br />
					<br />
					Happy hacking!
					<br />
					<br />
					<br />
					<br />
				</p>
				<div class="instruction-button">
					<Button
						onClick={() => {
							showInstructions = true;
						}}>Instructions</Button
					>
				</div>

				<div class="presets">
					<p class="preset-header intro-text">
						<strong>Current preset: {jackCode.at(preset).name} </strong>
					</p>
					<p class="preset-body intro-text">
						{jackCode.at(preset).description}
					</p>

					<ButtonContainer flexJustify="flex-start">
						{#each jackCode as sample, i}
							<Button
								onClick={() => {
									preset = i;
									jackcodeStore.set(sample.code);
									bytecodeStore.set(defaultBytecode);
									programLoaded = false;
									compiled = false;
								}}>{sample.name}</Button
							>
						{/each}
					</ButtonContainer>
				</div>
			</div>
			<div class="canvas-container">
				<div class="label">DISPLAY</div>
				<CanvasDisplay
					bind:canvas
					{programLoaded}
					{running}
					{width}
					{height}
					{scale}
					{onStepClick}
					{onStopClick}
					{onRunClick}
					{onEndClick}
				/>
			</div>
		</div>
		<div class="lower-container" style="--upper-container-height: {upper_container_height}px;">
			<div class="jackcode-container">
				<div class="label">JACK EDITOR</div>
				<div class="CM-container code-height">
					<CodeMirror
						doc={defaultJackcode}
						bind:docStore={jackcodeStore}
						extensions={[basicSetup, myTheme]}
						on:change={changeHandler}
					/>
				</div>
				<ButtonContainer>
					<Button onClick={onCompileClick} disabled={!pythonLoaded}>Compile</Button>
				</ButtonContainer>
			</div>
			<!-- pull out as editor component -->
			<div class="bytecode-container">
				<div class="label">BYTECODE EDITOR</div>
				<div class="CM-container code-height">
					<CodeMirror
						doc={defaultBytecode}
						bind:docStore={bytecodeStore}
						extensions={[basicSetup, myTheme]}
						on:change={changeHandler}
					/>
				</div>
				<ButtonContainer>
					<Button onClick={onLoadClick} disabled={!compiled}>Load Program</Button>
				</ButtonContainer>
			</div>
			<div class="display-container">
				<div class="memory-container">
					<div class="label">MEMORY VALUES</div>
					<div class="memory">
						{#each memArray as cell, i}
							<MemoryCell {i} {cell} />
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow:hidden;
		font-size: 14px;
		line-height: 1.2em;
		color-scheme: dark;
		--height-offset: 140px;
		background-color: rgb(49, 49, 49);
		margin: 0px;
		/* Hide scrollbar for IE, Edge and Firefox */
		/* -ms-overflow-style: none; /* IE and Edge */
		/* scrollbar-width: none; /* Firefox */
	}

	.modal-header {
		font-size: 16px;
		line-height: 1.2em;
		background-color: rgb(49, 49, 49);
		border-bottom: 1px solid #202020;
		padding-bottom: 8px;
	}

	.modal-body {
		font-size: 14px;
		line-height: 1.2em;
		background-color: rgb(49, 49, 49);
		border-bottom: 1px solid #202020;
		margin-bottom: 16px;
	}

	a:link,
	a:visited {
		color: rgb(0, 156, 0);
		text-decoration: none;
	}

	a:hover,
	a:active {
		color: #00ff00;
		text-decoration: none;
	}

	.app-container {
		overflow:auto;
		align-content: center;
		background-color: rgb(49, 49, 49);
		height: 100vh;
		width: 100vw;
	}

	.inner-container {
		display: flex;
		flex-direction: column;
		max-width: 1400px;
		margin: auto;
		padding: 10px 40px;
		background-color: rgb(49, 49, 49);
		/* border: 1px dashed black; */
	}

	.upper-container {
		display: flex;
		flex-direction: row;
		height: var(--upper-container-height);
		width: 100%;
		padding-bottom: 20px;
		border-bottom: 1px solid #202020;
	}

	.lower-container {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		max-height: calc(95vh - var(--upper-container-height));
		min-height: 400px;
		width: 100%;
		padding-top: 20px;
	}

	.default-txt {
		font-family: 'Open Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
			Verdana, sans-serif;
		color: #afafaf;
	}

	.label {
		font-family: 'Open Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
			Verdana, sans-serif;
		margin-bottom: 12px;
		color: #afafaf;
	}

	.nav-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
		width: 100%;
	}

	.nav-item {
		padding-left: 36px;
	}

	.intro-container {
		padding: 0px 32px 0px 0px;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		box-sizing: content-box;
	}

	.instruction-button {
		display: flex;
		justify-content: start;
		width: 100%;
		padding-bottom: 16px;
	}

	.presets {
		display: flex;
		flex-direction: column;
		border-top: 1px solid #202020;
		width: 100%;
		flex-grow: 1;
		justify-content: space-between;
	}

	.preset-header {
		font-size: 16px;
	}

	.preset-body {
		flex-grow: 1;
	}

	.bytecode-container {
		display: flex;
		flex-direction: column;
		padding: 0px 16px;
		max-width: 400px;
		min-width: 320px;
	}

	.jackcode-container {
		display: flex;
		flex-direction: column;
		padding: 0px 16px 0px 0px;
		min-width: 300px;
		overflow-x: auto;
		flex-grow: 1;
		/* height: calc(100vh - var(--upper-container-height) - 70px); */
	}

	.CM-container {
		height: calc(100% - var(--height-offset));
	}

	.memory-container {
		display: flex;
		height: 100%;
		padding: 0px 0px 0px 16px;
		max-width: 400px;
		min-width: 320px;
		flex-direction: column;
	}

	.memory {
		max-width: 400px;
		min-width: 320px;
		height: calc(100% - var(--height-offset));
		/* height: calc(100vh - var(--upper-container-height) - 72px); */
		background-color: #202020;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
