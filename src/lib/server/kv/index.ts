import { env } from "$env/dynamic/private";
import type { Item, ItemStore } from "$lib/types";

export class CloudflareKVItemStore implements ItemStore {
	async put(item: Item): Promise<void> {
		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item");
		}

		await this.kv().put("item:" + item.id, JSON.stringify(item), { metadata: item.metadata });
	}

	async has(id: string): Promise<boolean> {
		return (await this.kv().get("item:" + id)) !== undefined;
	}

	async get(id: string): Promise<Item | null> {
		const item = await this.kv().get("item:" + id, "json");
		if (item === undefined) {
			return null;
		}
		return item as Item;
	}

	async del(id: string): Promise<void> {
		await this.kv().delete(id);
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
