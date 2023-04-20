import { AutoAdapter, AutoObjStore, AutoVecStore, AutoEncoder, AutoCache } from "$lib/server/auto";
import { $t } from "$lib/server/i18n";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.auth?.perm.read) {
		throw error(403, await $t("error.read-permission-required"));
	}

	return json({
		adapter: AutoAdapter.name,
		encoder: AutoEncoder.name,
		obj: AutoObjStore.name,
		vec: AutoVecStore.name,
		cache: AutoCache.name,
	});
};
