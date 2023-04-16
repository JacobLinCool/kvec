import type { RawItem, Item } from "$lib/types";
import { z } from "zod";

export const RawItemSchema: z.Schema<RawItem> = z.object({
	data: z.record(z.string(), z.unknown()),
	metadata: z
		.object({
			$type: z.string(),
		})
		.passthrough()
		.catchall(z.unknown()),
});

export const ItemSchema: z.Schema<Item> = z.object({
	id: z.string(),
	data: z.record(z.string(), z.unknown()),
	metadata: z
		.object({
			$type: z.string(),
			$encode: z.string(),
		})
		.passthrough()
		.catchall(z.unknown()),
});
