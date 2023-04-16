import { env } from "$env/dynamic/private";
import type { RawItem, VecStore, VectorFindOption } from "$lib/types";

export class PineconeVecStore implements VecStore {
	async put(id: string, vector: number[], metadata: RawItem["metadata"]) {
		const { key, endpoint } = check_env();

		const res = await fetch(`https://${endpoint}/vectors/upsert`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Api-Key": key,
			},
			body: JSON.stringify({ vectors: [{ id, values: vector, metadata }] }),
		});

		if (!res.ok) {
			throw new Error(res.statusText);
		}
	}

	async has(id: string) {
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

	async find(vector: number[], opt?: VectorFindOption): Promise<{ id: string; score: number }[]> {
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
				vector,
				topK: opt?.k ?? 10,
				filter: opt?.type ? { type: opt.type } : undefined,
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

		return result.matches.filter((match) => match.score >= (opt?.threshold ?? 0.76));
	}

	async del(id: string) {
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
	if (!env.PINECONE_API_KEY) {
		throw new Error("Missing PINECONE_API_KEY");
	}

	if (!env.PINECONE_ENDPOINT) {
		throw new Error("Missing PINECONE_ENDPOINT");
	}

	return { key: env.PINECONE_API_KEY, endpoint: env.PINECONE_ENDPOINT };
}
