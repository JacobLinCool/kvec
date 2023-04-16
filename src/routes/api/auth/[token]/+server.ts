import { env } from "$env/dynamic/private";
import { $t } from "$lib/server/i18n";
import { TokenSchema } from "$lib/server/token";
import { error, json } from "@sveltejs/kit";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./types";

export const GET: RequestHandler = async ({ params }) => {
	if (!env.APP_SECRET) {
		throw error(500, await $t("error.missing-app-secret"));
	}

	const { token } = params;

	const ok = await jwt.verify(token, env.APP_SECRET);
	if (!ok) {
		throw error(401, await $t("error.unauthorized"));
	}

	const decoded = jwt.decode(token);
	try {
		const payload = TokenSchema.parse(decoded.payload);
		return json({ payload });
	} catch (err) {
		console.error(decoded, err);
		throw error(403, await $t("error.invalid-token"));
	}
};
