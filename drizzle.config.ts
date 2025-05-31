import { defineConfig } from "drizzle-kit";
import { getLocalSQLiteDBPath } from "./src/server/db/utils";

const isProd = process.env.ENVIRONMENT === "production";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema",
  out: "./src/server/db/migrations",
  ...(isProd
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
