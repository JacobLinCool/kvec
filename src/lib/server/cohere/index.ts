import { env } from "$env/dynamic/private";
import type { AdaptedItem, Encoder } from "$lib/types";
import type cohere from "cohere-ai";
import { error } from "@sveltejs/kit";

const MODEL = env.COHERE_EMBED_MODEL || "large";
const TRUNCATE = env.COHERE_EMBED_TRUNCATE || "LEFT";

export class CohereEncoder implements Encoder {
	async encode(item: AdaptedItem): Promise<number[]> {
		if (typeof item.ft !== "string") {
			throw new Error("Unsupported feature type");
		}

		if (!env.COHERE_API_KEY) {
			throw new Error("Missing COHERE_API_KEY");
		}

		const embeddings = await embed(item.ft);
		return embeddings;
	}
}

export async function embed(content: string): Promise<number[]> {
	const res = await fetch("https://api.cohere.ai/v1/embed", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.COHERE_API_KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			texts: [content],
			truncate: TRUNCATE,
		}),
	});

	if (!res.ok) {
		throw error(
			500,
			await res
				.text()
				.then((t) => t || res.statusText)
				.catch(() => res.statusText),
		);
	}

	const result = await res.json<Awaited<ReturnType<(typeof cohere)["embed"]>>["body"]>();
	return result.embeddings[0];
}
