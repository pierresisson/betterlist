import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: "src/client/routes",
			generatedRouteTree: "src/client/routeTree.gen.ts",
			routeToken: "layout",
		}),
		react(),
		cloudflare(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@client": path.resolve(__dirname, "./src/client/"),
			"@server": path.resolve(__dirname, "./src/server/"),
		},
	},
	// Build Optimizations
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate React and core dependencies
					"react-vendor": ["react", "react-dom"],

					// Separate TanStack libraries
					tanstack: [
						"@tanstack/react-query",
						"@tanstack/react-router",
						"@tanstack/react-form",
					],

					// Separate tRPC
					trpc: ["@trpc/client", "@trpc/server", "@trpc/tanstack-react-query"],

					// Separate UI libraries
					"ui-vendor": [
						"@radix-ui/react-avatar",
						"@radix-ui/react-dropdown-menu",
						"@radix-ui/react-label",
						"@radix-ui/react-separator",
						"@radix-ui/react-slider",
						"@radix-ui/react-slot",
						"lucide-react",
					],

					// Separate auth
					auth: ["better-auth"],
				},
			},
		},
		// Increase chunk size warning limit for diagram libraries
		chunkSizeWarningLimit: 600,
	},
});
