import { z } from "zod";
import { DEFAULT_TOKEN_EXP } from "./constants";

export const TokenAuthSchema = z.object({
	secret: z.string(),
	exp: z.number().positive().int().optional().default(DEFAULT_TOKEN_EXP),
	perm: z
		.object({
			write: z.boolean().optional().default(true),
			read: z.boolean().optional().default(true),
		})
		.optional()
		.default({ write: true, read: true }),
});

export const TokenSchema = z.object({
	iss: z.string(),
	iat: z.number(),
	exp: z.number(),
	perm: z.object({
		write: z.boolean(),
		read: z.boolean(),
	}),
});
