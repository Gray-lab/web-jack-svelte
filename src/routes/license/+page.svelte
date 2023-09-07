<script>
</script>

<div class="app-container">
	<div class="inner-container">
		<div class="intro-container default-txt">
			<nav class="nav-container">
				<h3 class="title"><a href="/">web_jack</a></h3>
				<div class="nav-item"><a href="/license">License</a></div>
				<div class="nav-item">
					<a href="https://www.github.com/Gray-lab" rel="noopener noreferrer" target="_blank"
						>My Github</a
					>
				</div>
			</nav>
			<p class="intro-text">
				This work uses some elements from <a
					href="https://www.nand2tetris.org/"
					rel="noopener noreferrer"
					target="_blank">Nand to Tetris by Noam Nisan and Shimon Schocken</a
				>, including the Jack language grammar, bytecode grammar, and standard library
				specifications, the Square Game code, and the Average Program code.
				<br /><br />
				All materials and elements in this website are licensed under a
				<a
					href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
					rel="noopener noreferrer"
					target="_blank"
					>Creative Common Attribution-NonCommercial-ShareAlike 3.0 Unported License</a
				>.
				<br /><br />
				© 2023 Martin Grym
			</p>
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

	.default-txt {
		font-family: 'Open Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
			Verdana, sans-serif;
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
		justify-content: flex-start;
		box-sizing: content-box;
	}
</style>
