import { env } from "$env/dynamic/private";
import type { AdaptedItem, Encoder } from "$lib/types";
import type { CreateEmbeddingResponse } from "openai";

const KEY = env.OPENAI_API_KEY;
const MODEL = env.OPENAI_EMBED_MODEL || "text-embedding-ada-002";

export class OpenAIEncoder implements Encoder {
	async encode(item: AdaptedItem): Promise<number[]> {
		if (typeof item.ft !== "string") {
			throw new Error("Unsupported feature type");
		}

		if (!KEY) {
			throw new Error("Missing OPENAI_API_KEY");
		}

		const embeddings = await embed(item.ft);
		return embeddings[0];
	}
}

export async function embed(content: string): Promise<number[][]> {
	const res = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			input: [content],
		}),
	});

	if (!res.ok) {
		throw new Error(res.statusText);
	}

	const result: CreateEmbeddingResponse = await res.json();
	console.log("embed", MODEL, result.usage);
	return result.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
