import { $t } from "$lib/server/i18n";
import { list } from "$lib/server/store";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./types";

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.auth?.perm.read) {
		throw error(403, await $t("error.read-permission-required"));
	}

	const keys = await list();

	return json({ keys });
};
