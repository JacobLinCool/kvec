import { env } from "$env/dynamic/private";
import type { Encoder, RawItem } from "$lib/types";
import type { CreateEmbeddingResponse } from "openai";
import { hash } from "../hash";

export class OpenAIEncoder implements Encoder {
	async accept(type: string): Promise<string | null> {
		if (type === "text") {
			return "text-embedding-ada-002";
		}
		return null;
	}

	async encode(item: RawItem): Promise<[number[], string]> {
		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item type");
		}

		const embeddings = await embed(item.data.text);
		const id = `${item.metadata.$type}:${await hash(item.data.text)}`;
		return [embeddings[0], id];
	}
}

export async function embed(content: string[] | string): Promise<number[][]> {
	if (!env.OPENAI_API_KEY) {
		throw new Error("Missing OPENAI_API_KEY");
	}

	if (!Array.isArray(content)) {
		content = [content];
	}

	const res = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "text-embedding-ada-002",
			input: content,
		}),
	});

	if (!res.ok) {
		throw new Error(res.statusText);
	}

	const result: CreateEmbeddingResponse = await res.json();
	console.log(result.usage);
	return result.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
