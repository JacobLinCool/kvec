import type { RawItem, ObjStoreItem } from "$lib/types";
import { z } from "zod";

export const RawItemSchema: z.Schema<RawItem> = z.object({
	data: z.record(z.string(), z.unknown()),
	meta: z.record(z.string(), z.unknown()).optional(),
});

export const ItemSchema: z.Schema<ObjStoreItem> = z.object({
	id: z.string(),
	data: z.record(z.string(), z.unknown()),
	meta: z.record(z.string(), z.unknown()),
});
