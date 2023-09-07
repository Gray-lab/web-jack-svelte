<script>
	export let cell = 0;
	export let i = 0;
</script>

<div class="cell">
	<span class="index">{i}</span>
	<span class="value">{cell.toString(10)}</span>
</div>

<style>
	.index {
		font-family: monospace;
		padding: 1px 5px;
		text-align: right;
		color: #e3e3e3;
		width: 50px;
		border-right: 1px solid black;
	}

	.value {
		font-family: monospace;
		padding: 1px 10px;
		width: 100%;
		border-bottom: 1px solid black;
        color: #00ff00;
	}
	.cell {
		display: flex;
		height: 20px;
	}
</style>
