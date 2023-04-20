import adapter from "@sveltejs/adapter-auto";
import adapter_node from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: process.env.BUILD_NODE ? adapter_node() : adapter(),
		alias: {
			"$i18n/*": "./locales/*",
		},
	},
};

export default config;
