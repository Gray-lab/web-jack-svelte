<script>
	import init, { Program } from '../../jack-vm/pkg';
	import { squareProgram, snakeProgram1, snakeProgram2 } from '$lib/bytecode.js';
	import { square_jack } from '$lib/jackcode.js';
	import { myTheme } from '$lib/codeMirrorTheme.js';
	import { onMount } from 'svelte';
	import CodeMirror, { basicSetup, minimalSetup, EditorView } from '../lib/CodeMirror.svelte';

	const width = 512;
	const height = 256;
	const pixelRatio = 1;

	const defaultJackcode = square_jack;
	const defaultBytecode = '// compile Jack code to populate this window';
	let programLoaded = false;
	let canvas;
	let ctx;
	let program;
	let bytecodeStore;
	let jackcodeStore;
	let ramSize;
	let ramPointer;
	let wasmInstance;
	let currentKey = 0;
	let interval;
	let running = false;
	$: showMem = false;
	$: memArray = [];
	$: stepCount = 30;

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

	function changeHandler({ detail: { tr } }) {
		// nothing we need to do here
	}

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

	let test;
	let compiler;
	let pyodide;
	let pythonLoaded = false;
	onMount(async () => {
		wasmInstance = await init(); // init initializes memory addresses needed by WASM and that will be used by JS/TS
		console.log(wasmInstance); // wasmInstance.memory gives us direct access to the memory underlying the jack runtime

		ctx = canvas.getContext('2d', {
			willReadFrequently: true,
			alpha: false
		});
		canvas.setAttribute('id', 'display-canvas');

		console.log("Loading...");
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
		console.log("Jack Compiler loaded");
		pythonLoaded = true;
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
</svelte:head>

<!-- need to have this only prevent default if a program is running -->
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<div class="app-container">
	<div class="upper-container">
		<div class="intro-container">
			<h2>{'{web-jack}'}</h2>
			<p>
				While working on the (excellent) nand2tetris course I thought that it would be great if
				there was a way to compile, run, and explore Jack programs on the web, so I build this page.
				<br /><br />
				Here you can compile and run Jack code. There are some minor differences in the standard library
				implementation which you can read about here. Most Jack programs should behave as expected, but
				please let me know if you find any surprises!
				<br /><br />
				This page is built using Sveltekit, with all the heavy lifting (parsing, compiling, and Jack
				code execution) handled by Rust compiled to web assembly. I learned a lot while building this,
				and I hope it helps you learn more about computing and how languages work.
				<br /><br />
				Happy hacking - Martin
			</p>
		</div>
		<div class="canvas-container">
			Display
			<canvas
				bind:this={canvas}
				width={width * pixelRatio}
				height={height * pixelRatio}
				style="width: {width}px; height: {height}px;"
			/>
		</div>
	</div>
	<div class="lower-container">
		<div class="editor-container">
			Jack Code
			<div class="CM-container">
				<CodeMirror
					doc={defaultJackcode}
					bind:docStore={jackcodeStore}
					extensions={[basicSetup, myTheme]}
					on:change={changeHandler}
				/>
			</div>
			<div class="btn-container">
				<button
					class="btn"
					disabled={!pythonLoaded}
					on:click={() => {
						const res = compiler.compile_main($jackcodeStore);
						bytecodeStore.set(res);
					}}>Compile</button
				>
			</div>
		</div>
		<div class="editor-container">
			Compiled Bytecode
			<div class="CM-container">
				<CodeMirror
					doc={defaultBytecode}
					bind:docStore={bytecodeStore}
					extensions={[basicSetup, myTheme]}
					on:change={changeHandler}
				/>
			</div>
			<div class="btn-container">
				<button
					class="btn"
					on:click={() => {
						program = new Program($bytecodeStore, ctx, canvas);
						programLoaded = true;
						ramSize = program.ram_size();
						ramPointer = program.ram();
						memArray = new Int16Array(wasmInstance.memory.buffer, ramPointer, ramSize);
					}}>Load program</button
				>
				<button
					class="btn"
					disabled={!programLoaded}
					on:click={() => {
						runLoop(1);
						memArray = memArray; // assignment triggers reactive update in Svelte
					}}>Step</button
				>
				<button
					class="btn"
					disabled={!programLoaded}
					on:click={() => {
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
					}}>Run</button
				>
				<button
					class="btn"
					on:click={() => {
						// program.end();
						running = false;
						clearInterval(interval);
						memArray = memArray;
					}}>Stop</button
				>
				<button
					class="btn"
					on:click={() => {
						running = false;
						program.end();
						clearInterval(interval);
						memArray = memArray;
					}}>End</button
				>
			</div>
		</div>
		<div class="display-container">
			<div class="stack-container" />
			<div class="memory-container">
				Memory Display
				<div class="ram-container">
					<div class="memory">
						{#if memArray}
							{#each memArray as cell, i}
								<p class="cell">{i}: {cell.toString(10).padStart(16, '0')}</p>
							{/each}
						{:else}
							<p>memArray was empty</p>
						{/if}
					</div>
				</div>
				<div class="active-key-container" />
				<div class="call-stack-container" />
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
		color: rgb(0, 255, 0);
		background-color: rgb(49, 49, 49);
		font-family: 'Courier New', 'Lucida Console', monospace;
		font-size: 14px;
		line-height: 1.2em;
	}

	:global(div) {
		/* border: 1px solid rgb(119, 119, 119); */
	}
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh - 10px;
		width: 100vw - 10px;
	}

	.upper-container {
		display: flex;
		flex-direction: row;
		height: 280px;
		width: 100%;
	}

	.intro-container {
		padding: 5px;
		flex-grow: 1;
		color: #e3e3e3;
		box-sizing: content-box;
		overflow: hidden;
	}

	.canvas-container {
		padding: 5px;
	}

	.lower-container {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		max-height: calc(100vh - 290px);
		width: 100%;
	}

	.editor-container {
		display: flex;
		flex-direction: column;
	}

	.CM-container {
		overflow: auto;
		box-sizing: content-box;
		flex-shrink: 1;
	}

	.btn-container {
		padding: 10px;
	}

	.memory-container {
		width: 600px;
		height: 400px;
		border: 1px solid black;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.memory {
		width: 220px;
		height: 100%;
		overflow: auto;
	}

	.cell {
		margin: 0px;
		padding: 1px;
		border-bottom: 1px solid black;
	}
</style>
