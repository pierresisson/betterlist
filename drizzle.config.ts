import { defineConfig } from "drizzle-kit";
import { getLocalSQLiteDBPath, loadProdVars } from "./src/server/db/utils";

// Load vars from .prod.vars into process.env
loadProdVars();
// Check environment using ENVIRONMENT from .prod.vars
const isEnvProduction = process.env.ENVIRONMENT === "production";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/server/db/schema",
	out: "./src/server/db/migrations",
	...(isEnvProduction
		? {
				driver: "d1-http",
				dbCredentials: {
					accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
					databaseId: process.env.CLOUDFLARE_DATABASE_ID,
					token: process.env.CLOUDFLARE_TOKEN,
				},
			}
		: {
				dbCredentials: {
					url: getLocalSQLiteDBPath(),
				},
			}),
});
