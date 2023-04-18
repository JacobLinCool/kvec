import { $t } from "$lib/server/i18n";
import { RawItemSchema } from "$lib/server/schema";
import { put, search } from "$lib/server/store";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	if (!locals.auth?.perm.read) {
		throw error(403, await $t("error.read-permission-required"));
	}

	const q = url.searchParams.get("q");
	if (!q) {
		throw error(400, await $t("error.missing-query-parameter", { values: { name: "q" } }));
	}
	if (q.length < 1 || q.length > 1000) {
		throw error(400, "Query parameter q must be between 1 and 1000 characters");
	}

	const items = await search(
		{
			data: { text: q },
			meta: url.searchParams.has("type") ? { type: url.searchParams.get("type") } : undefined,
		},
		{
			k: parseInt(url.searchParams.get("k") || "") || undefined,
			threshold: parseFloat(url.searchParams.get("threshold") || "") || undefined,
		},
		platform,
	);
	return json({ items });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.auth?.perm.write) {
		throw error(403, await $t("error.write-permission-required"));
	}

	const body = await request.json();
	const item = RawItemSchema.parse(body);

	const id = await put(item);

	return json({ id });
};
