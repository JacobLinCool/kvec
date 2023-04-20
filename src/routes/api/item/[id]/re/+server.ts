import { $t } from "$lib/server/i18n";
import { get, put } from "$lib/server/store";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.auth?.perm.write) {
		throw error(403, await $t("error.write-permission-required"));
	}

	const { id } = params;

	const item = await get(id);
	if (!item) {
		throw error(404, await $t("error.not-found"));
	}

	await put(item);
	return json({ item });
};
