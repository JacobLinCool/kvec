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
import { time } from "./time";

const adapter: Adapter = new AutoAdapter();
const encoder: Encoder = new AutoEncoder();
const store: Store = new AutoStore();

export async function put(raw: RawItem): Promise<string> {
	time.start("adapt");
	const adapted = await adapter.adapt(raw);
	time.stop("adapt");

	time.start("encode");
	const embedding = await encoder.encode(adapted);
	time.stop("encode");

	const completed: CompleteItem = {
		...adapted,
		v: embedding,
	};

	time.start("put");
	await store.put(completed);
	time.stop("put");

	return adapted.id;
}

export async function get(id: string): Promise<ObjStoreItem | undefined> {
	time.start("get");
	const item = await store.get(id);
	time.stop("get");

	if (!item) {
		return undefined;
	}

	return item;
}

export async function del(id: string): Promise<void> {
	time.start("del");
	await store.del(id);
	time.stop("del");
}

export async function search(
	q: RawItem,
	option?: FindOption,
	platform?: Readonly<App.Platform>,
): Promise<ObjStoreItem[]> {
	const cache = new AutoCache(platform);
	const cache_key = JSON.stringify(q);
	time.start("cache");
	const cached = await cache.get<ObjStoreItem[]>(cache_key);
	time.stop("cache");

	if (cached) {
		return cached;
	}

	time.start("adapt");
	const adapted = await adapter.adapt(q);
	time.stop("adapt");

	time.start("encode");
	const embedding = await encoder.encode(adapted);
	time.stop("encode");

	const search: CompleteItem = {
		id: adapted.id,
		data: adapted.data,
		meta: q.meta || {},
		ft: adapted.ft,
		v: embedding,
	};

	time.start("find");
	const results = await store.find(search, option ?? {});
	time.stop("find");

	cache.put(cache_key, results, DEFAULT_CACHE_TTL);
	return results;
}

export async function list(): Promise<string[]> {
	return store.list();
}
