import { env } from "$env/dynamic/private";
import { $t } from "$lib/server/i18n";
import { TokenAuthSchema, TokenSchema } from "$lib/server/token";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./types";

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!env.APP_SECRET) {
		throw error(500, await $t("error.missing-app-secret"));
	}

	const body = await request.json();

	const { secret, exp, perm } = TokenAuthSchema.parse(body);
	if (secret !== env.APP_SECRET) {
		throw error(401, await $t("error.unauthorized"));
	}

	const token = await jwt.sign(
		TokenSchema.parse({
			iss: "kvec",
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + exp,
			perm,
		}),
		env.APP_SECRET,
	);

	cookies.set("kvec_token", token, {
		path: "/",
		maxAge: exp,
		sameSite: "lax",
		secure: true,
	});

	return json({ token });
};
