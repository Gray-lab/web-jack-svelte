<script>
	import init, { Program } from '../../jack-vm/pkg';
	import { squareProgram, snakeProgram1, snakeProgram2 } from '$lib/bytecode.js';
	import { square_jack } from '$lib/jackcode.js';
	import { myTheme } from '$lib/codeMirrorTheme.js';
	import { onMount } from 'svelte';
	import Button from '../lib/Button.svelte';
	import ButtonContainer from '../lib/ButtonContainer.svelte';
	import CodeMirror, { basicSetup, minimalSetup, EditorView } from '../lib/CodeMirror.svelte';
	import CanvasDisplay from '../lib/CanvasDisplay.svelte';
	import MemoryCell from '../lib/MemoryCell.svelte';
	import Modal from '../lib/Modal.svelte';

	// Canvas scale (1.0 -> 512px x 256px)
	const scale = 1.5;
	const width = 512;
	const height = 256;
	const defaultJackcode = square_jack;
	const defaultBytecode = `compile Jack code to
populate this window`;
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
	let showWindowWarning = true;
	let showInstructions = true;
	$: showMem = false;
	$: memArray = new Array(256).fill(0);
	$: stepCount = 30;

	export let upper_container_height = scale * height + 100;

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
			memArray = memArray; // assignment triggers reactive update in Svelte
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
		if (showMem) memArray = memArray; // assignment triggers reactive update in Svelte
	}

	function runLoopCallback() {
		runLoop(stepCount);
	}

	onMount(async () => {
		showWindowWarning = document.documentElement.clientWidth < 1000;
		console.log(document.documentElement.clientWidth, showWindowWarning);
		showInstructions = !showWindowWarning;

		wasmInstance = await init(); // init initializes memory addresses needed by WASM and that will be used by JS/TS
		console.log(wasmInstance); // wasmInstance.memory gives us direct access to the memory underlying the jack runtime

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
		console.log('Jack Compiler loaded');
		pythonLoaded = true;
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
</svelte:head>

<!-- need to have this only prevent default if a program is running -->
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<Modal bind:showModal={showWindowWarning}>
	<p>This website has not been designed for mobile or narrow screens - everything might break</p>
</Modal>

<Modal bind:showModal={showInstructions}>
	<div>
		<ol>
			<li>Thing 1</li>
			<li>Thing 2</li>
			<li>Thing 3</li>
		</ol>
	</div>
</Modal>

<div class="app-container">
	<div class="inner-container">
		<div class="upper-container" style="--upper-container-height: {upper_container_height}px;">
			<div class="intro-container default-txt">
				<div class="nav-container">
					<h3 class="title">{'web_jack'}</h3>
					<div class="nav-item"><a href="/about">About</a></div>
					<div class="nav-item">
						<a href="https://www.github.com/Gray-lab" rel="noopener noreferrer" target="_blank"
							>My Github</a
						>
					</div>
				</div>
				<p class="intro-text">
					While working on the (excellent) nand2tetris course I thought that it would be great if
					there was a way to compile, run, and explore Jack programs on the web.
					<br /><br />
					Here you can compile and run Jack code. Most Jack programs should behave as expected, but please
					let me know if you find any surprises!
					<br /><br />
					This page is built using Sveltekit, with compilation handled by Python and code-execution and
					display handled by Rust compiled to web assembly.
					<br /><br />
					Happy hacking -
					<a href="https://github.com/Gray-lab" rel="noopener noreferrer" target="_blank">Martin</a>
				</p>
				<Button label={'What do I do?'} onClick={() => {showInstructions = true}}/>
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
					<Button label={'Compile'} onClick={onCompileClick} disabled={!pythonLoaded} />
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
					<Button label={'Load Program'} onClick={onLoadClick} disabled={!compiled} />
				</ButtonContainer>
			</div>
			<div class="display-container">
				<div class="memory-container">
					<div class="label">MEMORY VALUES</div>
					<div class="memory">
						{#if memArray}
							{#each memArray as cell, i}
								<MemoryCell {i} {cell} />
								<!-- <div class="cell">
								<span class="index">{i}</span>
								<span class="value">{cell.toString(10)}</span>
							</div> -->
							{/each}
						{:else}
							<p>memArray was empty</p>
						{/if}
					</div>
					<!-- <div class="stack-container">
					<div class="memory">
						{#if memArray}
							{#each memArray as cell, i}
								<p class="cell">{i}: {cell.toString(10).padStart(16, '0')}</p>
							{/each}
						{:else}
							<p>memArray was empty</p>
						{/if}
					</div>
				</div> -->
					<div class="active-key-container" />
					<div class="call-stack-container" />
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
		font-size: 14px;
		line-height: 1.2em;
		color-scheme: dark;
		--height-offset: 140px;
		background-color: rgb(49, 49, 49);
		/* Hide scrollbar for IE, Edge and Firefox */
		/* -ms-overflow-style: none; /* IE and Edge */
		/* scrollbar-width: none; /* Firefox */
	}

	:global(div) {
		/* border: 1px solid rgb(119, 119, 119); */
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
		align-content: center;
		background-color: rgb(49, 49, 49);
		height: 100vh;
		width: 100vw;
	}

	.inner-container {
		display: flex;
		flex-direction: column;
		max-width: 1400px;
		height: 99%;
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
		max-height: calc(100vh - var(--upper-container-height));
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
	}

	.nav-item {
		padding-left: 36px;
	}

	.intro-container {
		padding: 0px 16px 8px 0px;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: content-box;
		/* overflow: hidden; */
		/* text-align: center; */
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
