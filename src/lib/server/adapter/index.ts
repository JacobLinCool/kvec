import { env } from "$env/dynamic/private";
import type { Adapter, RawItem, AdaptedItem, ObjStoreItem } from "$lib/types";
import { error } from "@sveltejs/kit";
import { hash } from "../hash";
import { time } from "../time";

const HF_API_TOKEN = env.HF_API_TOKEN;
const HF_IMGCAP_MODEL = env.HF_IMGCAP_MODEL;

export class BaseTextAdapter implements Adapter {
	async adapt(
		item: RawItem | ObjStoreItem<{ text: string }>,
	): Promise<AdaptedItem<{ text: string }>> {
		if ("id" in item) {
			console.log("re encode", item.id);

			const new_item = {
				id: item.id,
				data: item.data,
				meta: item.meta,
				ft: item.data.text,
			};

			return new_item;
		}

		if (typeof item.data.text === "string") {
			const new_item = {
				id: `text:${await hash(item.data.text)}`,
				data: item.data as { text: string },
				meta: {
					type: "text",
					...item.meta,
				},
				ft: item.data.text,
			};

			return new_item;
		}

		if (typeof item.data.page === "string") {
			const res = await fetch(item.data.page);
			const text = await res.text();
			const page = parse_webpage(text);

			const new_item = {
				id: `page:${await hash(item.data.page)}`,
				data: {
					text: page.title + " | " + page.description,
					page: item.data.page,
				},
				meta: {
					type: "page",
					...item.meta,
				},
				ft: page.title + " | " + page.description,
			};

			return new_item;
		}

		if (typeof item.data.img === "string") {
			if (!HF_API_TOKEN) {
				throw error(500, "HF_API_TOKEN not set");
			}

			const url = new URL(item.data.img);

			const model = HF_IMGCAP_MODEL || "nlpconnect/vit-gpt2-image-captioning";

			const img = url.protocol === "data:" ? data2blob(url) : await fetch(url);
			const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
				method: "POST",
				headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
				body: img instanceof Response ? img.body : img,
				// @ts-expect-error duplex is only available in node.js
				duplex: img instanceof Response ? "half" : undefined,
			});

			const json = await res.json<{ generated_text: string }[]>();
			const text = json[0].generated_text.trim();

			const new_item = {
				id: `img:${await hash(item.data.img)}`,
				data: {
					text: text,
					img: item.data.img,
				},
				meta: {
					type: "img",
					...item.meta,
				},
				ft: text,
			};

			return new_item;
		}

		throw error(500, "Adapter failed to transform item");
	}
}

function parse_webpage(html: string): { title: string; description: string } {
	const title_regex = /<title>(.*?)<\/title>/;
	const description_regex = /<meta name="description" content="(.*?)">/;

	const title_match = html.match(title_regex);
	const description_match = html.match(description_regex);

	const title = title_match?.[1] || "";
	const description = description_match?.[1] || "";

	return { title, description };
}

function data2blob(url: URL): Blob {
	time.start("data2blob");
	const [m, b] = url.href.split(",");

	const bytes = atob(b);
	const buffer = new ArrayBuffer(bytes.length);
	const slice = new Uint8Array(buffer);

	for (let i = 0; i < bytes.length; i++) {
		slice[i] = bytes.charCodeAt(i);
	}

	const mime = m.split(":")[1].split(";")[0];

	const blob = new Blob([buffer], { type: mime });
	time.stop("data2blob");

	return blob;
}
