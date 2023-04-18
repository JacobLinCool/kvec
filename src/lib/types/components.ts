import type { AdaptedItem, CompleteItem, ObjStoreItem, RawItem, VecStoreItem } from "./items";
import type { VecFindOption, ObjFindOption, FindOption } from "./options";

export abstract class Adapter {
	abstract adapt(item: RawItem): Promise<AdaptedItem>;
}

export abstract class Encoder {
	abstract encode(item: AdaptedItem): Promise<number[]>;
}

/**
 * Vector Database.
 */
export abstract class VecStore {
	/**
	 * Save vector.
	 * @param item Item.
	 */
	abstract put(item: VecStoreItem): Promise<void>;

	/**
	 * Check if the database has the vector.
	 * @param id Item ID.
	 * @returns True if the database has the vector, false otherwise.
	 */
	abstract has(id: string): Promise<boolean>;

	/**
	 * Find the most similar vectors.
	 * @param item Query item.
	 * @param option Find option.
	 */
	abstract find(
		item: VecStoreItem,
		option: VecFindOption,
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
export abstract class ObjStore {
	/**
	 * Save item.
	 * @param item Item to save.
	 * @returns Item ID.
	 */
	abstract put(item: ObjStoreItem): Promise<void>;

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
	abstract get(id: string): Promise<ObjStoreItem | null>;

	/**
	 * Find the matched items.
	 * @param item Query item.
	 * @param option Find option.
	 */
	abstract find(item: ObjStoreItem, option: ObjFindOption): Promise<ObjStoreItem[]>;

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

export abstract class Store {
	/**
	 * Save item.
	 * @param item Item to save.
	 * @returns Item ID.
	 */
	abstract put(item: CompleteItem): Promise<void>;

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
	abstract get(id: string): Promise<ObjStoreItem | null>;

	/**
	 * Find the matched items.
	 * @param item Query item.
	 * @param option Find option.
	 */
	abstract find(item: CompleteItem, option: FindOption): Promise<ObjStoreItem[]>;

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

export abstract class Cache {
	abstract put<T = unknown>(key: string, object: T, expires: number): Promise<void>;

	abstract get<T = unknown>(key: string): Promise<T | null>;
}
