import { env } from "$env/dynamic/private";
import type { VecStoreItem, VecStore, VecFindOption } from "$lib/types";
import { DEFAULT_K, DEFAULT_THRESHOLD } from "../constants";

const KEY = env.PINECONE_API_KEY;
const ENDPOINT = env.PINECONE_ENDPOINT;

export class PineconeVecStore implements VecStore {
	async put(item: VecStoreItem): Promise<void> {
		const { key, endpoint } = check_env();

		const res = await fetch(`https://${endpoint}/vectors/upsert`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Api-Key": key,
			},
			body: JSON.stringify({
				vectors: [{ id: item.id, values: item.v, metadata: item.meta }],
			}),
		});

		if (!res.ok) {
			throw new Error(res.statusText);
		}
	}

	async has(id: string): Promise<boolean> {
		const { key, endpoint } = check_env();

		const res = await fetch(`https://${endpoint}/vectors/fetch?ids=${id}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Api-Key": key,
			},
		});

		const result = await res.json<{ vectors: Record<string, unknown> }>();
		return result.vectors[id] !== undefined;
	}

	async find(item: VecStoreItem, opt: VecFindOption): Promise<{ id: string; score: number }[]> {
		const { key, endpoint } = check_env();

		const res = await fetch(`https://${endpoint}/query`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Api-Key": key,
			},
			body: JSON.stringify({
				includeValues: false,
				includeMetadata: false,
				vector: item.v,
				topK: opt.k ?? DEFAULT_K,
				filter: item.meta,
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			if (text) {
				throw new Error(res.statusText + ": " + text);
			}
			throw new Error(res.statusText);
		}

		const result: {
			matches: { id: string; score: number }[];
		} = await res.json();
		console.log(result.matches);

		return result.matches.filter(
			(match) => match.score >= (opt?.threshold ?? DEFAULT_THRESHOLD),
		);
	}

	async del(id: string): Promise<void> {
		const { key, endpoint } = check_env();

		const res = await fetch(`https://${endpoint}/vectors/delete`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Api-Key": key,
			},
			body: JSON.stringify({ ids: [id], deleteAll: false }),
		});

		if (!res.ok) {
			throw new Error(res.statusText);
		}
	}
}

function check_env(): { key: string; endpoint: string } {
	if (!KEY) {
		throw new Error("Missing PINECONE_API_KEY");
	}

	if (!ENDPOINT) {
		throw new Error("Missing PINECONE_ENDPOINT");
	}

	return { key: KEY, endpoint: ENDPOINT };
}
