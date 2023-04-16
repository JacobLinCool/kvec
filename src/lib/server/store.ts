import type { RawItem, Item, VectorFindOption } from "$lib/types";
import { AutoItemStore, AutoVecStore, AutoEncoder } from "./auto";

const encoder = new AutoEncoder();
const store = new AutoItemStore();
const vec = new AutoVecStore();

export async function put(raw: RawItem): Promise<string> {
	const encode = await encoder.accept(raw.metadata.$type);
	if (!encode) {
		throw new Error(`cannot encode ${raw.metadata.$type}`);
	}

	const [embedding, id] = await encoder.encode(raw);

	await Promise.all([
		store.put({ id, ...raw, metadata: { ...raw.metadata, $encode: encode } }),
		vec.put(id, embedding, raw.metadata),
	]);

	return id;
}

export async function get(id: string): Promise<Item | undefined> {
	const item = await store.get(id);
	if (!item) {
		return undefined;
	}

	return item;
}

export async function del(id: string): Promise<void> {
	await Promise.all([vec.del(id), store.del(id)]);
}

export async function search(
	q: RawItem,
	option?: VectorFindOption,
	platform?: Readonly<App.Platform>,
): Promise<Item[]> {
	const cache = await platform?.caches.open("kvec:search");
	const cache_key = new Request(`https://kvec.csie.cool/_cache/api/item?q=${q}`);
	const cached = await cache?.match(cache_key);
	if (cached) {
		console.log("search cache hit", q);
		const json = await cached.json<Item[]>();
		return json;
	}
	console.log("search cache miss", q);

	await encoder.accept(q.metadata.$type);
	const [embedding] = await encoder.encode(q);

	const similar = await vec.find(embedding, {
		k: option?.k ?? 10,
		threshold: option?.threshold ?? 0.76,
		type: q.metadata.$type,
	});

	const items = await Promise.all(similar.map((v) => store.get(v.id)));
	const result = items.filter((item) => item) as Item[];

	platform?.context.waitUntil(cache?.put(cache_key, new Response(JSON.stringify(result))), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "max-age=3600",
		},
	});

	return result;
}

export async function list(): Promise<string[]> {
	return store.list();
}
