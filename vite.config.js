import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
	plugins: [sveltekit(), wasmPack('./jack-vm')],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		fs: {
			// absolute path to wasm package, as it is outside the sveltekit src dir
			allow: ["/home/sapphire/web-jack-svelte/jack-vm/pkg"] 
		}
	}
});
