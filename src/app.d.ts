/// <reference types="@cloudflare/workers-types" />

import type { z } from "zod";
import type { TokenSchema } from "$lib/server/token";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth?: z.infer<typeof TokenSchema>;
		}
		// interface PageData {}
		interface Platform {
			env: {
				PINECONE_API_KEY: string;
				/**
				 * The endpoint of your pinecone index.
				 * @example "index-b3a60cd.svc.us-central1-gcp.pinecone.io"
				 */
				PINECONE_ENDPOINT: string;
				OPENAI_API_KEY: string;
				APP_SECRET: string;
				KV: KVNamespace;
			};
			context: EventContext;
			caches: CacheStorage;
		}
	}
}

export {};
