import type {
	ObjStoreItem,
	ObjStore,
	VecStore,
	Encoder,
	VecFindOption,
	VecStoreItem,
	AdaptedItem,
	ObjFindOption,
	Cache,
} from "$lib/types";
import { DEFAULT_K, DEFAULT_THRESHOLD } from "../constants";

export class MemoryObjStore implements ObjStore {
	private items: Map<string, ObjStoreItem> = new Map();

	async put(item: ObjStoreItem): Promise<void> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		this.items.set(item.id, {
			id: item.id,
			data: item.data,
			meta: item.meta,
		});
	}

	async has(id: string): Promise<boolean> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		return this.items.has(id);
	}

	async get(id: string): Promise<ObjStoreItem | null> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		const item = this.items.get(id);
		if (item === undefined) {
			return null;
		}
		return item;
	}

	async find(item: ObjStoreItem, option: ObjFindOption): Promise<ObjStoreItem[]> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		const results: ObjStoreItem[] = [];
		return results.slice(0, option.k ?? DEFAULT_K);
	}

	async del(id: string): Promise<void> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		this.items.delete(id);
	}

	async list(): Promise<string[]> {
		console.warn("Using MemoryObjStore, you should not see this in production");

		return [...this.items.keys()];
	}
}

export class MemoryVecStore implements VecStore {
	private vectors: Map<string, VecStoreItem> = new Map();

	async put(item: VecStoreItem): Promise<void> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		this.vectors.set(item.id, {
			id: item.id,
			v: item.v,
			meta: item.meta,
		});
	}

	async has(id: string): Promise<boolean> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		return this.vectors.has(id);
	}

	async find(item: VecStoreItem, opt: VecFindOption): Promise<{ id: string; score: number }[]> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		const results: { id: string; score: number }[] = [];

		for (const [id, vec] of this.vectors.entries()) {
			if (typeof item.meta.type === "string" && item.meta.type !== vec.meta.type) {
				continue;
			}

			const score = similarity(item.v, vec.v);
			if (score >= (opt.threshold ?? DEFAULT_THRESHOLD)) {
				results.push({ id, score });
			}
		}

		results.sort((a, b) => b.score - a.score);

		return results.slice(0, opt.k ?? DEFAULT_K);
	}

	async del(id: string): Promise<void> {
		console.warn("Using MemoryVecStore, you should not see this in production");

		this.vectors.delete(id);
	}
}

export class JustEncoder implements Encoder {
	async encode(item: AdaptedItem): Promise<number[]> {
		console.warn("Using JustEncoder, you should not see this in production");

		if (typeof item.data.text !== "string") {
			throw new Error("Invalid item");
		}
		return [1, 1, 1];
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

export class MemoryCache implements Cache {
	async put<T = unknown>(key: string, object: T, expires: number): Promise<void> {
		return;
	}

	async get<T = unknown>(key: string): Promise<T | null> {
		return null;
	}
}
