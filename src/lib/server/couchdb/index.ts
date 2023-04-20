import { env } from "$env/dynamic/private";
import type { ObjStoreItem, ObjStore } from "$lib/types";
import { error } from "@sveltejs/kit";

const URL = env.COUCHDB_URL;
const DB = env.COUCHDB_DB;
const USER = env.COUCHDB_USER;
const PASSWORD = env.COUCHDB_PASSWORD;

export class CouchDBObjStore implements ObjStore {
	async put(item: ObjStoreItem): Promise<void> {
		const res = await fetch(`${this.db()}/${item.id}`, {
			method: "PUT",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${btoa(`${USER}:${PASSWORD}`)}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ item }),
		});

		if (!res.ok) {
			throw error(500, `CouchDB: ${res.status} ${res.statusText}`);
		}
	}

	async has(id: string): Promise<boolean> {
		const res = await fetch(`${this.db()}/${id}`, {
			method: "HEAD",
			headers: {
				Authorization: `Basic ${btoa(`${USER}:${PASSWORD}`)}`,
			},
		});

		return res.ok;
	}

	async get(id: string): Promise<ObjStoreItem | null> {
		const res = await fetch(`${this.db()}/${id}`, {
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${btoa(`${USER}:${PASSWORD}`)}`,
			},
		});

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			throw error(500, `CouchDB: ${res.status} ${res.statusText}`);
		}

		const result = await res.json<{ _id: string; item: ObjStoreItem }>();
		return result.item;
	}

	async del(id: string): Promise<void> {
		const res = await fetch(`${this.db()}/${id}`, {
			method: "DELETE",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${btoa(`${USER}:${PASSWORD}`)}`,
			},
		});

		if (!res.ok) {
			throw error(500, `CouchDB: ${res.status} ${res.statusText}`);
		}
	}

	async find(): Promise<ObjStoreItem[]> {
		return [];
	}

	async list(): Promise<string[]> {
		const res = await fetch(`${this.db()}/_all_docs`, {
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${btoa(`${USER}:${PASSWORD}`)}`,
			},
		});

		if (!res.ok) {
			throw error(500, `CouchDB: ${res.status} ${res.statusText}`);
		}

		const result = await res.json<{ rows: { id: string }[] }>();
		return result.rows.map((r) => r.id);
	}

	db(): string {
		if (!URL || !DB || !USER || !PASSWORD) {
			throw error(500, "CouchDB: missing env");
		}

		const url = new globalThis.URL(URL);
		url.pathname = DB;

		return url.toString();
	}
}
