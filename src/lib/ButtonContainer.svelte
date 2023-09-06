<script>
	export let flexJustify = "flex-end";
</script>

<div class="container" style="--justify: {flexJustify}">
    <slot></slot>
</div>

<style>
	.container {
		gap: 16px;
		display: flex;
		width: 100%;
		height: auto;
		flex-direction: row;
		justify-content: var(--justify);
		padding-top: 16px;
	}
</style>