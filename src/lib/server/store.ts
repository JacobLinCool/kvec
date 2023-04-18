import type {
	RawItem,
	FindOption,
	Store,
	Encoder,
	Adapter,
	CompleteItem,
	ObjStoreItem,
} from "$lib/types";
import { AutoStore, AutoEncoder, AutoAdapter, AutoCache } from "./auto";
import { DEFAULT_CACHE_TTL } from "./constants";

const adapter: Adapter = new AutoAdapter();
const encoder: Encoder = new AutoEncoder();
const store: Store = new AutoStore();

export async function put(raw: RawItem): Promise<string> {
	const adapted = await adapter.adapt(raw);

	const embedding = await encoder.encode(adapted);

	const completed: CompleteItem = {
		...adapted,
		v: embedding,
	};

	await store.put(completed);

	return adapted.id;
}

export async function get(id: string): Promise<ObjStoreItem | undefined> {
	const item = await store.get(id);
	if (!item) {
		return undefined;
	}

	return item;
}

export async function del(id: string): Promise<void> {
	await store.del(id);
}

export async function search(
	q: RawItem,
	option?: FindOption,
	platform?: Readonly<App.Platform>,
): Promise<ObjStoreItem[]> {
	const cache = new AutoCache(platform);
	const cache_key = JSON.stringify(q);
	const cached = await cache.get<ObjStoreItem[]>(cache_key);
	if (cached) {
		return cached;
	}

	const adapted = await adapter.adapt(q);
	const embedding = await encoder.encode(adapted);

	const search: CompleteItem = {
		id: adapted.id,
		data: adapted.data,
		meta: q.meta || {},
		ft: adapted.ft,
		v: embedding,
	};

	const results = await store.find(search, option ?? {});

	cache.put(cache_key, results, DEFAULT_CACHE_TTL);
	return results;
}

export async function list(): Promise<string[]> {
	return store.list();
}
