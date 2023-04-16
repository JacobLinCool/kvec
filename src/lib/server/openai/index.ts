import { env } from "$env/dynamic/private";
import type { Encoder, RawItem } from "$lib/types";
import type { CreateEmbeddingResponse } from "openai";
import { hash } from "../hash";

const MODEL = "text-embedding-ada-002";

export class OpenAIEncoder implements Encoder {
	async accept(type: string): Promise<string | null> {
		if (type === "text") {
			return MODEL;
		}
		return null;
	}

	async encode(item: RawItem): Promise<[number[], string]> {
		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item type");
		}

		if (!env.OPENAI_API_KEY) {
			throw new Error("Missing OPENAI_API_KEY");
		}

		const embeddings = embed(item.data.text);
		const id = `${item.metadata.type}:${await hash(item.data.text)}`;
		return [(await embeddings)[0], id];
	}
}

export async function embed(content: string): Promise<number[][]> {
	const res = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
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
	console.log(result.usage);
	return result.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
