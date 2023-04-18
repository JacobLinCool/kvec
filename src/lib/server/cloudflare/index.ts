import { env } from "$env/dynamic/private";
import type { ObjStoreItem, ObjStore, Cache } from "$lib/types";

export class CloudflareKVObjStore implements ObjStore {
	async put(item: ObjStoreItem): Promise<void> {
		await this.kv().put(
			"item:" + item.id,
			JSON.stringify({
				id: item.id,
				data: item.data,
				meta: item.meta,
			}),
			{ metadata: item.meta },
		);
	}

	async has(id: string): Promise<boolean> {
		return (await this.kv().get("item:" + id)) !== undefined;
	}

	async get(id: string): Promise<ObjStoreItem | null> {
		const item = await this.kv().get<ObjStoreItem>("item:" + id, "json");
		if (item === undefined) {
			return null;
		}
		return item;
	}

	async del(id: string): Promise<void> {
		await this.kv().delete(id);
	}

	async find(): Promise<ObjStoreItem[]> {
		return [];
	}

	async list(): Promise<string[]> {
		const keys: string[] = [];
		let cursor: string | undefined = undefined;
		for (let i = 0; i < 50; i++) {
			const result: KVNamespaceListResult<unknown> = await this.kv().list({
				prefix: "item:",
				cursor,
			});
			keys.push(...result.keys.map((key) => key.name.replace(/^item:/, "")));

			if (result.list_complete) {
				break;
			}
			cursor = result.cursor;
		}

		return keys;
	}

	kv(): KVNamespace {
		if (!env.KV) {
			throw new Error("KV not initialized");
		}
		if (typeof env.KV !== "object") {
			throw new Error("KV is not an object");
		}

		return env.KV as KVNamespace;
	}
}

export class CloudflareCache implements Cache {
	constructor(protected platform?: Readonly<App.Platform>) {}

	async put<T>(key: string, payload: T, ttl: number): Promise<void> {
		const cache = await this.platform?.caches.open("kvec:cache");
		const cache_key = new Request(
			`https://kvec.csie.cool/__cache__/x?key=${encodeURIComponent(key)}`,
		);

		let p: Promise<void> | undefined;
		if (payload instanceof Response) {
			p = cache?.put(
				cache_key,
				new Response(payload.body, {
					headers: {
						...payload.headers,
						"Cache-Control": `max-age=${ttl}`,
					},
				}),
			);
		} else {
			p = cache?.put(
				cache_key,
				new Response(JSON.stringify(payload), {
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": `max-age=${ttl}`,
						"X-JSON": "1",
					},
				}),
			);
		}

		this.platform?.context.waitUntil(p);
	}

	async get<T = Response>(key: string): Promise<T | null> {
		const cache = await this.platform?.caches.open("kvec:cache");
		const cache_key = new Request(
			`https://kvec.csie.cool/__cache__/x?key=${encodeURIComponent(key)}`,
		);
		const cached = await cache?.match(cache_key);
		if (!cached) {
			console.log("cache miss:", key);
			return null;
		}
		console.log("cache hit:", key);

		if (cached.headers.get("X-JSON") === "1") {
			const json = await cached.json<T>();
			return json;
		}

		return cached as unknown as T;
	}
}
