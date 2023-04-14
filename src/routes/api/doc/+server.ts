import { put, search } from "$lib/server/store";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { $t } from "$lib/server/i18n";

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	if (!dev && !platform?.env.KV) {
		throw error(500, await $t("error.missing-kv"));
	}

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

	const docs = await search(q, platform);
	return json({ docs });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!dev && !platform?.env.KV) {
		throw error(500, await $t("error.missing-kv"));
	}

	if (!locals.auth?.perm.write) {
		throw error(403, await $t("error.write-permission-required"));
	}

	const body = await request.json();
	const doc = z
		.object({
			content: z.string().min(1),
			metadata: z
				.record(z.string(), z.any())
				.optional()
				.default({})
				.refine((v) => JSON.stringify(v).length <= 1000),
			wait: z.boolean().optional(),
		})
		.parse(body);

	const id = await hash(doc.content);
	if (doc.wait !== false) {
		await put(id, doc, platform);
	} else if (platform) {
		platform.context.waitUntil(put(id, doc, platform));
	}

	return json({ id });
};

async function hash(content: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(content);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
