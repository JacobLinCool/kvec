import { env } from "$env/dynamic/private";
import { locale, waitLocale } from "svelte-i18n";
import type { Handle, RequestEvent } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { TokenSchema } from "$lib/server/token";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale();

	const token = get_auth(event);
	if (token && env.APP_SECRET) {
		const ok = await jwt.verify(token, env.APP_SECRET);
		if (ok) {
			try {
				event.locals.auth = TokenSchema.parse(jwt.decode(token).payload);
			} catch (err) {
				console.error(err);
			}
		} else {
			console.error("invalid token", token);
		}
	}

	const result = await resolve(event);
	return result;
};

function get_auth(event: RequestEvent): string | undefined {
	const header_auth = event.request.headers.get("authorization");
	if (header_auth) {
		const [scheme, token] = header_auth.split(" ");
		if (scheme === "Bearer" && token) {
			return token;
		}
	}

	const cookie_auth = event.cookies.get("kvec_token");
	if (cookie_auth) {
		return cookie_auth;
	}

	return undefined;
}
