<script>
	import init, { greet } from '../../jack-vm/pkg';
	// we need onMount to run init
	import { onMount } from 'svelte';
	import CodeMirror, { minimalSetup } from '../lib/CodeMirror.svelte';

	onMount(async () => {
		await init(); // init initializes memory addresses needed by WASM and that will be used by JS/TS
	});

	let jackcode = 'hello jack';

	function changeHandler({ detail: { tr } }) {
		console.log('change', tr.changes.toJSON());
		console.log(tr);
	}
</script>

<div>
	<button
		on:click={() => {
			greet('Gray');
		}}>Click Me</button
	>
</div>
<CodeMirror
	doc={'Edit me!\nAnd here is the second line!!'}
	bind:docStore={jackcode}
	extensions={minimalSetup}
	on:change={changeHandler}
/>
