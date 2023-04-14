import { get, del } from "$lib/server/store";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { $t } from "$lib/server/i18n";

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	if (!dev && !platform?.env.KV) {
		throw error(500, await $t("error.missing-kv"));
	}

	if (!locals.auth?.perm.read) {
		throw error(403, await $t("error.read-permission-required"));
	}

	const { id } = params;

	const doc = await get(id, platform);
	if (!doc) {
		throw error(404, await $t("error.not-found"));
	}

	return json({ doc });
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	if (!dev && !platform?.env.KV) {
		throw error(500, await $t("error.missing-kv"));
	}

	if (!locals.auth?.perm.write) {
		throw error(403, await $t("error.write-permission-required"));
	}

	const { id } = params;

	const doc = await get(id, platform);
	if (!doc) {
		throw error(404, await $t("error.not-found"));
	}

	await del(id, platform);

	return json({ deleted: true, doc });
};
