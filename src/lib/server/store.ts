import { z } from "zod";
import { embed } from "./openai";
import { upsert, remove, query } from "./pinecone";
import { dev } from "$app/environment";

const DocSchema = z.object({
	id: z.string(),
	content: z.string(),
	on: z.number(),
});

const DEV_STORE = new Map<string, { id: string; content: string; on: number }>();

export async function put(
	id: string,
	content: string,
	platform?: Readonly<App.Platform>,
): Promise<void> {
	if (dev || !platform) {
		DEV_STORE.set(id, { id, content, on: Date.now() });
		return;
	}

	const [embedding] = await embed([content]);

	await upsert([{ id, values: embedding }]);

	const key = `doc:${id}`;
	await platform.env.KV.put(
		key,
		JSON.stringify({
			id,
			content: content,
			on: Date.now(),
		}),
	);
}

export async function get(
	id: string,
	platform?: Readonly<App.Platform>,
): Promise<
	| {
			id: string;
			content: string;
			on: number;
	  }
	| undefined
> {
	if (dev || !platform) {
		return DEV_STORE.get(id);
	}

	const key = `doc:${id}`;
	const value = await platform.env.KV.get(key, "json");
	if (!value) {
		return undefined;
	}

	return DocSchema.parse(value);
}

export async function del(id: string, platform?: Readonly<App.Platform>): Promise<void> {
	if (dev || !platform) {
		DEV_STORE.delete(id);
		return;
	}

	const key = `doc:${id}`;
	await platform.env.KV.delete(key);
	await remove(id);
}

export async function search(
	q: string,
	platform?: Readonly<App.Platform>,
): Promise<
	{
		id: string;
		content: string;
		on: number;
	}[]
> {
	if (dev || !platform) {
		return Array.from(DEV_STORE.values());
	}

	const cache = await platform.caches.open("kvec:search");
	const cache_key = new Request(`https://kvec.csie.cool/_cache/api/doc?q=${q}`);
	const cached = await cache.match(cache_key);
	if (cached) {
		console.log("search cache hit", q);
		const json = await cached.json<{ id: string; content: string; on: number }[]>();
		return json;
	}
	console.log("search cache miss", q);

	const [embedding] = await embed(q);
	const results = await query(embedding, 10);
	const docs = await Promise.all(
		results.map(async (result) => {
			return await get(result.id, platform);
		}),
	);

	const result = docs.filter((doc) => doc !== undefined) as {
		id: string;
		content: string;
		on: number;
	}[];

	platform.context.waitUntil(cache.put(cache_key, new Response(JSON.stringify(result))), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "max-age=3600",
		},
	});

	return result;
}

export async function list(platform?: Readonly<App.Platform>): Promise<string[]> {
	if (dev || !platform) {
		return Array.from(DEV_STORE.keys());
	}

	const keys: string[] = [];
	let cursor: string | undefined = undefined;
	for (let i = 0; i < 50; i++) {
		const result: KVNamespaceListResult<unknown> = await platform.env.KV.list({
			prefix: "doc:",
			cursor,
		});
		keys.push(...result.keys.map((key) => key.name.replace(/^doc:/, "")));

		if (result.list_complete) {
			break;
		}
		cursor = result.cursor;
	}

	return keys;
}
