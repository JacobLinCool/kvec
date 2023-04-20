import { env } from "$env/dynamic/private";
import type { ObjStoreItem, ObjStore } from "$lib/types";
import { Redis } from "@upstash/redis/cloudflare";

/** @example "https://us1-merry-cat-32748.upstash.io" */
const URL = env.UPSTASH_REDIS_REST_URL;
const TOKEN = env.UPSTASH_REDIS_REST_TOKEN;

export class UpstashRedisObjStore implements ObjStore {
	async put(item: ObjStoreItem): Promise<void> {
		await this.redis().set(`item:${item.id}`, JSON.stringify(item));
	}

	async has(id: string): Promise<boolean> {
		return (await this.get(id)) !== null;
	}

	async get(id: string): Promise<ObjStoreItem | null> {
		return await this.redis().get<ObjStoreItem>(`item:${id}`);
	}

	async del(id: string): Promise<void> {
		await this.redis().del(`item:${id}`);
	}

	async find(): Promise<ObjStoreItem[]> {
		return [];
	}

	async list(): Promise<string[]> {
		return (await this.redis().keys("item:*")).map((k) => k.replace(/^item:/, ""));
	}

	protected redis(): Redis {
		if (!URL || !TOKEN) {
			throw new Error("Upstash Redis not initialized");
		}

		return new Redis({ url: URL, token: TOKEN });
	}
}
