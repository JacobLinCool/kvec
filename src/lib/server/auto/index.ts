import { env } from "$env/dynamic/private";
import { CloudflareKVItemStore } from "../kv";
import { MemoryItemStore, MemoryVecStore, JustEncoder } from "../local";
import { OpenAIEncoder } from "../openai";
import { PineconeVecStore } from "../pinecone";

export const AutoItemStore = typeof env.KV === "object" ? CloudflareKVItemStore : MemoryItemStore;

export const AutoVecStore =
	env.PINECONE_API_KEY && env.PINECONE_ENDPOINT ? PineconeVecStore : MemoryVecStore;

export const AutoEncoder = env.OPENAI_API_KEY ? OpenAIEncoder : JustEncoder;

console.log("Auto Selected Backends:");
console.log("ItemStore:", AutoItemStore.name);
console.log("VecStore:", AutoVecStore.name);
console.log("Encoder:", AutoEncoder.name);
