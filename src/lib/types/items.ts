import type { Simplify } from "type-fest";

export interface CompleteItem<
	Data extends Record<never, unknown> = Record<string, unknown>,
	Meta extends Record<never, unknown> = Record<string, unknown>,
	FT = string,
> {
	/**
	 * The ID of the item.
	 * This should be stored in both the **ObjStore** and the **VecStore** to ensure consistency.
	 */
	id: string;

	/**
	 * The data of the item.
	 * This should be stored in the **ObjStore**.
	 */
	data: Data;

	/**
	 * The data of the item.
	 * This should be stored in both the **ObjStore** and the **VecStore** to allow for search filtering.
	 */
	meta: Meta;

	/**
	 * The feature of the item. The embedding is based on the feature.
	 * This does not need to be stored, but it may be useful for debugging.
	 */
	ft: FT;

	/**
	 * The embedding of the item.
	 * This should be stored in the **VecStore**.
	 */
	v: number[];
}

export type AdaptedItem<
	Data extends Record<never, unknown> = Record<string, unknown>,
	Meta extends Record<never, unknown> = Record<string, unknown>,
	FT = string,
> = Simplify<Omit<CompleteItem<Data, Meta, FT>, "v">>;

export type RawItem<
	Data extends Record<never, unknown> = Record<string, unknown>,
	Meta extends Record<never, unknown> = Record<string, unknown>,
> = {
	data: Data;
	meta?: Meta;
};

export type ObjStoreItem<
	Data extends Record<never, unknown> = Record<string, unknown>,
	Meta extends Record<never, unknown> = Record<string, unknown>,
> = Simplify<Omit<CompleteItem<Data, Meta>, "v" | "ft">>;

export type VecStoreItem<Meta extends Record<never, unknown> = Record<string, unknown>> = Simplify<
	Omit<CompleteItem<Record<string, unknown>, Meta>, "data" | "ft">
>;
