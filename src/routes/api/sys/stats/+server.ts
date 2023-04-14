import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { list } from "$lib/server/store";
import { $t } from "$lib/server/i18n";

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!dev && !platform?.env.KV) {
		throw error(500, await $t("error.missing-kv"));
	}

	if (!locals.auth?.perm.read) {
		throw error(403, await $t("error.read-permission-required"));
	}

	const keys = await list(platform);

	return json({ keys });
};
