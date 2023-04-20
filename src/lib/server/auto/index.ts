import { env } from "$env/dynamic/private";
import type { CompleteItem, FindOption, ObjStoreItem, Store } from "$lib/types";
import { BaseTextAdapter } from "../adapter";
import { CloudflareCache, CloudflareKVObjStore } from "../cloudflare";
import { CohereEncoder } from "../cohere";
import { DEFAULT_K } from "../constants";
import { MemoryObjStore, MemoryVecStore, MemoryCache, JustEncoder } from "../local";
import { OpenAIEncoder } from "../openai";
import { PineconeVecStore } from "../pinecone";
import { UpstashRedisObjStore } from "../upstash";

export const AutoAdapter = BaseTextAdapter;

export const AutoObjStore =
	typeof env.KV === "object"
		? CloudflareKVObjStore
		: env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
		? UpstashRedisObjStore
		: MemoryObjStore;

export const AutoVecStore =
	env.PINECONE_API_KEY && env.PINECONE_ENDPOINT ? PineconeVecStore : MemoryVecStore;

export const AutoEncoder = env.OPENAI_API_KEY
	? OpenAIEncoder
	: env.COHERE_API_KEY
	? CohereEncoder
	: JustEncoder;

// @ts-expect-error caches.default only exists on Cloudflare serverless environment
export const AutoCache = globalThis?.caches?.default ? CloudflareCache : MemoryCache;

export class AutoStore implements Store {
	protected obj: InstanceType<typeof AutoObjStore>;
	protected vec: InstanceType<typeof AutoVecStore>;

	constructor() {
		this.obj = new AutoObjStore();
		this.vec = new AutoVecStore();
	}

	async put(item: CompleteItem): Promise<void> {
		await Promise.all([
			this.obj.put({
				id: item.id,
				data: item.data,
				meta: item.meta,
			}),
			this.vec.put({
				id: item.id,
				v: item.v,
				meta: item.meta,
			}),
		]);
	}

	async has(id: string): Promise<boolean> {
		return this.obj.has(id);
	}

	async get(id: string): Promise<ObjStoreItem | null> {
		return this.obj.get(id);
	}

	async del(id: string): Promise<void> {
		await Promise.all([this.obj.del(id), this.vec.del(id)]);
	}

	async find(item: CompleteItem, option: FindOption): Promise<ObjStoreItem[]> {
		const vecp = this.vec.find(item, option);
		const objp = this.obj.find(item, option);

		const objs = await objp;
		const vecs = await vecp;

		const vobjs = (
			await Promise.all(
				vecs
					.sort((a, b) => b.score - a.score)
					.slice(0, (option.k ?? DEFAULT_K) - objs.length)
					.map((v) => this.obj.get(v.id)),
			)
		).filter((v) => v !== null) as ObjStoreItem[];

		return [...objs, ...vobjs];
	}

	async list(): Promise<string[]> {
		return this.obj.list();
	}
}

console.log("Auto Selected Backends:");
console.log("Adapter:", AutoAdapter.name);
console.log("ObjStore:", AutoObjStore.name);
console.log("VecStore:", AutoVecStore.name);
console.log("Encoder:", AutoEncoder.name);
console.log("Cache:", AutoCache.name);
