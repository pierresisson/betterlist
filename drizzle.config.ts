import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function getLocalD1DB() {
	try {
		const basePath = path.resolve(".wrangler");
		const dbFile = fs
			.readdirSync(basePath, { encoding: "utf-8", recursive: true })
			.find((f) => f.endsWith(".sqlite"));

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return url;
	} catch (err) {
		console.log(`Error  ${err}`);
	}
}

function loadProdVars() {
	try {
		const varsPath = path.resolve(".prod.vars");
		const content = fs.readFileSync(varsPath, { encoding: "utf-8" });
		const vars: Record<string, string> = {};

		for (const line of content.split("\n")) {
			const match = line.match(/^([A-Za-z0-9_]+)="([^"]*)"$/);
			if (match) {
				vars[match[1]] = match[2];
			}
		}

		return vars;
	} catch (err) {
		console.log(`Error loading .prod.vars: ${err}`);
		return {};
	}
}

// Determine if we're in production based on NODE_ENV or .prod.vars
const isProd = process.env.NODE_ENV === "production";
const prodVars = isProd ? loadProdVars() : {};
const isEnvProduction = isProd || prodVars.ENVIRONMENT === "production";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/server/db/schema",
	out: "./src/server/db/migrations",
	...(isEnvProduction
		? {
				driver: "d1-http",
				dbCredentials: {
					accountId:
						prodVars.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID,
					databaseId:
						prodVars.CLOUDFLARE_DATABASE_ID ||
						process.env.CLOUDFLARE_DATABASE_ID,
					token: prodVars.CLOUDFLARE_TOKEN || process.env.CLOUDFLARE_TOKEN,
				},
			}
		: {
				dbCredentials: {
					url: getLocalD1DB(),
				},
			}),
});
