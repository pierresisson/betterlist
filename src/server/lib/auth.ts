/// <reference types="../../../worker-configuration.d.ts" />
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Resend } from "resend";
import * as schema from "../db/schema";
import { verificationCodeEmail } from "./email-templates";

export const auth = (db: DrizzleD1Database, env: Env) => {
	console.log("[Auth Config] Initializing better-auth with:");
	console.log("  baseURL:", env.BETTER_AUTH_URL);
	console.log("  trustedOrigins:", env.TRUSTED_ORIGINS?.split(",") ?? []);
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
		}),
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		trustedOrigins: env.TRUSTED_ORIGINS?.split(",") ?? [],
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
			},
		},
		plugins: [
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					if (env.ENVIRONMENT === "development") {
						console.log(`Sending verification code to ${email}: ${otp}`);
						return;
					}
					if (type === "sign-in") {
						const resend = new Resend(env.RESEND_API_KEY);
						await resend.emails.send({
							from: `${env.APP_NAME} <${env.RESEND_FROM_EMAIL}>`,
							to: email,
							subject: "Your Verification Code",
							html: verificationCodeEmail(otp),
						});
					}
				},
			}),
		],
	});
};

export type BetterAuth = ReturnType<typeof auth>;

// NOTE: To generate better-auth schema using pnpx @better-auth/cli generate,
// uncomment the following code and comment out the above code
// const db = drizzle(process.env.BETTER_AUTH_DB!);

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "sqlite",
//   }),
// });
