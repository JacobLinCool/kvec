import type { Item, ItemStore, VecStore, Encoder, VectorFindOption, RawItem } from "$lib/types";
import { hash } from "../hash";

export class MemoryItemStore implements ItemStore {
	private items: Map<string, Item> = new Map();

	async put(item: Item): Promise<void> {
		console.warn("Using MemoryItemStore, you should not see this in production");

		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item");
		}

		this.items.set(item.id, item);
	}

	async has(id: string): Promise<boolean> {
		console.warn("Using MemoryItemStore, you should not see this in production");

		return this.items.has(id);
	}

	async get(id: string): Promise<Item | null> {
		console.warn("Using MemoryItemStore, you should not see this in production");

		const item = this.items.get(id);
		if (item === undefined) {
			return null;
		}
		return item;
	}

	async del(id: string): Promise<void> {
		console.warn("Using MemoryItemStore, you should not see this in production");

		this.items.delete(id);
	}

	async list(): Promise<string[]> {
		console.warn("Using MemoryItemStore, you should not see this in production");

		return [...this.items.keys()];
	}
}

export class MemoryVecStore implements VecStore {
	private vectors: Map<string, { v: number[]; m: RawItem["metadata"] }> = new Map();

	async put(id: string, vector: number[], metadata: RawItem["metadata"]): Promise<void> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		this.vectors.set(id, { v: vector, m: metadata });
	}

	async has(id: string): Promise<boolean> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		return this.vectors.has(id);
	}

	async find(vector: number[], opt?: VectorFindOption): Promise<{ id: string; score: number }[]> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		const results: { id: string; score: number }[] = [];

		for (const [id, vec] of this.vectors.entries()) {
			if (opt?.type !== undefined && opt.type !== vec.m.$type) {
				continue;
			}

			const score = similarity(vector, vec.v);
			if (score >= (opt?.threshold ?? 0.76)) {
				results.push({ id, score });
			}
		}

		results.sort((a, b) => b.score - a.score);

		return results.slice(0, opt?.k ?? 10);
	}

	async del(id: string): Promise<void> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		this.vectors.delete(id);
	}
}

export class JustEncoder implements Encoder {
	async accept(type: string): Promise<string | null> {
		return type === "text" ? "all-1-embedding" : null;
	}

	async encode(item: RawItem): Promise<[number[], string]> {
		console.warn("Using JustEncoder, you should not see this in production");
		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item");
		}

		const v = [1, 1, 1];
		const id = `${item.metadata.$type}:${await hash(item.data.text)}`;

		return [v, id];
	}
}

function similarity(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error("Vectors must have the same length");
	}

	const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
	const norm_a = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
	const norm_b = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));

	return dot / (norm_a * norm_b);
}
