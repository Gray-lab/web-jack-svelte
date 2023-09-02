<script>
	export let label = 'Default Button';
	export let onClick;
	export let disabled = false;
	export let style = 'default';

	let backgroundColor = '#202020';
	let minWidth = '128px';

	if (style === 'secondary') {
		backgroundColor = '#666666';
		minWidth = '80px';
	}
</script>

<button
	{disabled}
	on:click={onClick}
	style="--background-color: {backgroundColor}; --min-width:{minWidth};"
>
	{label}
</button>

<style>
	button {
		color: #afafaf;
		font-size: 14px;
		letter-spacing: 0.5px;
		text-transform: uppercase;

		background-color: var(--background-color);
		border: 1px solid var(--background-color);
		padding: 8px 24px;
		transition: border 0.5s;
		min-width: var(--min-width);

		&:hover:enabled {
			border: 1px solid #00ff00;
		}

		&:active:enabled {
			color: #00ff00;
		}

		&:disabled {
			color: #383838;
		}
	}
</style>
