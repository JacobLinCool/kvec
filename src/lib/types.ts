export interface RawItem {
	metadata: {
		$type: string;
		[key: string]: unknown;
	};
	data: {
		[key: string]: unknown;
	};
}

export interface Item {
	id: string;
	metadata: {
		$type: string;
		$encode: string;
		[key: string]: unknown;
	};
	data: {
		[key: string]: unknown;
	};
}

export interface TextItem extends Item {
	metadata: {
		$type: "text";
	} & Item["metadata"];
	data: {
		text: string;
	};
}

export interface AliasItem extends Item {
	metadata: {
		$type: "alias";
	} & Item["metadata"];
	data: {
		id: string;
	};
}

export interface WebpageItem extends Item {
	metadata: {
		$type: "webpage";
	} & Item["metadata"];
	data: {
		url: string;
	};
}

export interface ImageItem extends Item {
	metadata: {
		$type: "image";
	} & Item["metadata"];
	data: {
		src: string;
	};
}

/**
 * Embedding encoder.
 */
export abstract class Encoder {
	/**
	 * Check if the encoder can encode the item.
	 * @param type Type of item
	 * @returns Encoding name if the encoder can encode the item, null otherwise.
	 */
	abstract accept(type: string): Promise<string | null>;

	/**
	 * Encode item into embedding.
	 * @param item Item to encode
	 * @returns Embedding
	 */
	abstract encode(item: RawItem): Promise<[embedding: number[], id: string]>;
}

/**
 * Vector Database.
 */
export abstract class VecStore {
	/**
	 * Save vector.
	 * @param id Item ID.
	 * @param vector Vector to save.
	 * @param metadata Metadata of the item.
	 */
	abstract put(id: string, vector: number[], metadata: RawItem["metadata"]): Promise<void>;

	/**
	 * Check if the database has the vector.
	 * @param id Item ID.
	 * @returns True if the database has the vector, false otherwise.
	 */
	abstract has(id: string): Promise<boolean>;

	/**
	 * Find the most similar vectors.
	 * @param vector Target vector.
	 * @param k Number of vectors to find.
	 * @param threshold Threshold of similarity.
	 */
	abstract find(
		vector: number[],
		opt?: VectorFindOption,
	): Promise<{ id: string; score: number }[]>;

	/**
	 * Delete vector from the database.
	 * @param id Item ID.
	 */
	abstract del(id: string): Promise<void>;
}

/**
 * Item Database.
 */
export abstract class ItemStore {
	/**
	 * Save item.
	 * @param item Item to save.
	 * @returns Item ID.
	 */
	abstract put(item: Item): Promise<void>;

	/**
	 * Check if the database has the item.
	 * @param id Item ID.
	 * @returns True if the database has the item, false otherwise.
	 */
	abstract has(id: string): Promise<boolean>;

	/**
	 * Get item.
	 * @param id Item ID.
	 * @returns Item.
	 */
	abstract get(id: string): Promise<Item | null>;

	/**
	 * Delete item from the database.
	 * @param id Item ID.
	 */
	abstract del(id: string): Promise<void>;

	/**
	 * List all IDs.
	 */
	abstract list(): Promise<string[]>;
}

export interface VectorFindOption {
	k?: number;
	threshold?: number;
	type?: string;
}
