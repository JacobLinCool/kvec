import { env } from "$env/dynamic/private";
import type { CreateEmbeddingResponse } from "openai";

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
