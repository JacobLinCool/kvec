import { env } from "$env/dynamic/private";
import type { VecStoreItem, VecStore, VecFindOption } from "$lib/types";
import { error } from "@sveltejs/kit";
import { DEFAULT_K, DEFAULT_THRESHOLD } from "../constants";
import { hash } from "../hash";

/**
 * The URL of the Qdrant server.
 * @example "https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-1-0.aws.cloud.qdrant.io:6333"
 * @example "http://localhost:6333"
 */
const URL = env.QDRANT_SERVER;

/**
 * The name of the collection.
 * @example "test"
 */
const COLLECTION = env.QDRANT_COLLECTION;

/**
 * The (optional) API key.
 */
const API_KEY = env.QDRANT_API_KEY;

export class QdrantVecStore implements VecStore {
	async put(item: VecStoreItem): Promise<void> {
		const { url, collection } = this.env();

		const res = await fetch(`${url}/collections/${collection}/points`, {
			method: "PUT",
			headers: this.headers(),
			body: JSON.stringify({
				points: [
					{
						id: await this.id(item.id),
						vector: item.v,
						payload: { ...item.meta, item_id: item.id },
					},
				],
			}),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			console.log("qdrant put error", body);
			throw error(500, `Qdrant: ${res.statusText} ${body}`);
		}
	}

	async has(id: string): Promise<boolean> {
		const { url, collection } = this.env();

		const res = await fetch(`${url}/collections/${collection}/points/${await this.id(id)}`, {
			headers: this.headers(),
		});

		return res.ok;
	}

	async find(
		item: VecStoreItem,
		option: VecFindOption,
	): Promise<{ id: string; score: number }[]> {
		const { url, collection } = this.env();

		const res = await fetch(`${url}/collections/${collection}/points/search`, {
			method: "POST",
			headers: this.headers(),
			body: JSON.stringify({
				vector: item.v,
				limit: option.k ?? DEFAULT_K,
				score_threshold: option.threshold ?? DEFAULT_THRESHOLD,
				filter: {
					must: Object.entries(item.meta).map(([key, value]) => ({
						key,
						match: { value },
					})),
				},
				with_payload: ["item_id"],
			}),
		});

		if (!res.ok) {
			throw error(500, `Qdrant: ${res.statusText} ${await res.text().catch(() => "")}`);
		}

		const result = await res.json<{
			time: number;
			status: string;
			result: [
				{
					id: number;
					version: number;
					score: number;
					payload: { item_id: string };
					vector: string;
				},
			];
		}>();
		console.log("qdrant result", result);

		return result.result.map((r) => ({
			id: r.payload.item_id,
			score: r.score,
		}));
	}

	async del(id: string): Promise<void> {
		const { url, collection } = this.env();

		const res = await fetch(`${url}/collections/${collection}/points/delete`, {
			method: "POST",
			headers: this.headers(),
			body: JSON.stringify({
				points: [await this.id(id)],
			}),
		});

		if (!res.ok) {
			throw error(500, `Qdrant: ${res.statusText} ${await res.text().catch(() => "")}`);
		}
	}

	env(): { url: string; collection: string } {
		if (!URL || !COLLECTION) {
			throw error(500, "Qdrant URL or collection is not set");
		}

		return { url: URL, collection: COLLECTION };
	}

	headers(): Record<string, string> {
		const h: Record<string, string> = {
			accept: "application/json",
			"content-type": "application/json",
		};

		if (API_KEY) {
			h["api-key"] = API_KEY;
		}

		return h;
	}

	async id(raw: string): Promise<string> {
		const h = await hash(raw);
		return h.slice(0, 32);
	}
}
