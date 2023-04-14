import { env } from "$env/dynamic/private";

export async function upsert(
	vectors: { id: string; values: number[]; metadata?: Record<string, string> }[],
): Promise<void> {
	if (!env.PINECONE_API_KEY) {
		throw new Error("Missing PINECONE_API_KEY");
	}

	if (!env.PINECONE_ENDPOINT) {
		throw new Error("Missing PINECONE_ENDPOINT");
	}

	const res = await fetch(`https://${env.PINECONE_ENDPOINT}/vectors/upsert`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"Api-Key": env.PINECONE_API_KEY,
		},
		body: JSON.stringify({ vectors }),
	});

	if (!res.ok) {
		throw new Error(res.statusText);
	}
}

export async function remove(ids: string[] | string): Promise<void> {
	if (!env.PINECONE_API_KEY) {
		throw new Error("Missing PINECONE_API_KEY");
	}

	if (!env.PINECONE_ENDPOINT) {
		throw new Error("Missing PINECONE_ENDPOINT");
	}

	if (!Array.isArray(ids)) {
		ids = [ids];
	}

	const res = await fetch(`https://${env.PINECONE_ENDPOINT}/vectors/delete`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"Api-Key": env.PINECONE_API_KEY,
		},
		body: JSON.stringify({ ids, deleteAll: false }),
	});

	if (!res.ok) {
		throw new Error(res.statusText);
	}
}

export async function query(vector: number[], k = 10): Promise<{ id: string; score: number }[]> {
	if (!env.PINECONE_API_KEY) {
		throw new Error("Missing PINECONE_API_KEY");
	}

	if (!env.PINECONE_ENDPOINT) {
		throw new Error("Missing PINECONE_ENDPOINT");
	}

	const res = await fetch(`https://${env.PINECONE_ENDPOINT}/query`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"Api-Key": env.PINECONE_API_KEY,
		},
		body: JSON.stringify({
			includeValues: false,
			includeMetadata: false,
			vector,
			topK: k,
		}),
	});

	if (!res.ok) {
		throw new Error(res.statusText);
	}

	const result: {
		matches: { id: string; score: number }[];
	} = await res.json();
	console.log(result.matches);

	return result.matches.filter((match) => match.score >= 0.76);
}
