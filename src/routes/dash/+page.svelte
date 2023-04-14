<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";
	import CreateToken from "./CreateToken.svelte";
	import Language from "$lib/component/Language.svelte";
	import { t } from "svelte-i18n";
	import type { DocSchema } from "$lib/server/store";
	import type { z } from "zod";

	let token: string | null = null;

	onMount(async () => {
		token = localStorage.getItem("kvec_token");
		if (!token) {
			await goto("/login");
		}
	});

	let running = false;

	let doc_content = "";
	let doc_metadata = "{}";
	$: good_metadata = (() => {
		try {
			return JSON.parse(doc_metadata) && doc_metadata.length <= 1000;
		} catch {
			return false;
		}
	})();
	let doc_created = "";

	let search_query = "";
	let search_results: z.infer<typeof DocSchema>[] = [];
	let search_done = false;
	$: {
		search_query;
		search_done = false;
	}

	let keys: string[] = [];

	async function add() {
		if (running) {
			return;
		}
		running = true;

		try {
			doc_created = "";
			const url = new URL("/api/doc", window.location.href);
			const res = await fetch(url.toString(), {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content: doc_content, metadata: JSON.parse(doc_metadata) }),
			});

			if (res.ok) {
				const { id } = await res.json<{ id: string }>();
				doc_created = id;
			}
		} finally {
			running = false;
		}
	}

	async function remove(id: string) {
		if (running) {
			return;
		}
		running = true;

		try {
			const url = new URL(`/api/doc/${id}`, window.location.href);
			const res = await fetch(url.toString(), {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				search_results = search_results.filter((doc) => doc.id !== id);
				keys = keys.filter((key) => key !== id);
			}
		} finally {
			running = false;
		}
	}

	async function list() {
		if (running) {
			return;
		}
		running = true;

		try {
			const url = new URL("/api/sys/stats", window.location.href);
			const res = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const { keys: k } = await res.json<{ keys: string[] }>();
			keys = k;
		} finally {
			running = false;
		}
	}

	async function search() {
		if (!search_query || running) {
			return;
		}
		running = true;

		try {
			const url = new URL("/api/doc", window.location.href);
			url.searchParams.set("q", search_query);
			const res = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const { docs } = await res.json<{
				docs: z.infer<typeof DocSchema>[];
			}>();
			search_results = docs;
			search_done = true;
		} finally {
			running = false;
		}
	}
</script>

<svelte:head>
	<title>KVec Dashboard</title>
</svelte:head>

<div class="h-full w-full overflow-auto">
	<div class="flex h-full w-full flex-col items-center justify-start gap-6 p-4">
		<div class="text-4xl font-bold">KVec Dashboard</div>

		<div class="card w-full max-w-4xl border shadow">
			<div class="card-body">
				<h2 class="card-title">{$t("dash.search")}</h2>
				<div class="form-control w-full">
					<div class="input-group">
						<input
							class="input-bordered input w-full outline-none transition-all focus:input-primary focus:!outline-none"
							type="text"
							placeholder={$t("dash.search-for-documents")}
							bind:value={search_query}
						/>
						<button
							class="btn-square btn text-xl"
							class:btn-primary={!!search_query}
							on:click={search}
							disabled={running}
						>
							<Icon icon="ic:round-search" />
						</button>
					</div>
				</div>

				<div>
					{#if search_results.length > 0}
						<p class="text-sm">{search_results.length} results</p>
					{:else if search_done}
						<p class="text-sm">No results</p>
					{/if}
				</div>

				<div class="flex max-h-96 flex-col gap-2 overflow-auto py-2">
					{#each search_results as doc (doc.id)}
						<div class="card card-compact w-full max-w-4xl border shadow">
							<div class="card-body">
								<a
									class="overflow-auto text-secondary"
									href="/api/doc/{doc.id}"
									target="_blank">{doc.id}</a
								>
								<p>
									{$t("dash.created-on", {
										values: { time: new Date(doc.on).toLocaleString() },
									})}
								</p>
								<div class="max-h-60 w-full overflow-auto">
									<pre class="text-sm">{doc.content}</pre>
								</div>
								{#if Object.keys(doc.metadata).length}
									<div class="max-h-60 w-full overflow-auto">
										<pre class="font-mono text-sm text-info">{JSON.stringify(
												doc.metadata,
												null,
												4,
											)}</pre>
									</div>
								{/if}
								<div class="card-actions justify-end">
									<button
										class="btn-outline btn-error btn-sm btn"
										on:click={() => remove(doc.id)}
										disabled={running}
									>
										{$t("dash.remove")}
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="card w-full max-w-4xl border shadow">
			<div class="card-body">
				<h2 class="card-title">{$t("dash.add-document")}</h2>
				<div class="form-control">
					<label class="label" for="">
						<span class="label-text">{$t("dash.document-content")}</span>
					</label>
					<textarea
						class="textarea-bordered textarea h-24 resize-y"
						bind:value={doc_content}
					/>
					<label class="label" for="">
						<span class="label-text-alt">{$t("dash.doc-max-characters")}</span>
					</label>

					<label class="label" for="">
						<span class="label-text">{$t("dash.document-metadata")}</span>
					</label>
					<textarea
						class="textarea-bordered textarea h-12 resize-y font-mono"
						class:textarea-error={!good_metadata}
						bind:value={doc_metadata}
						placeholder={"{}"}
					/>
				</div>
				<div class="card-actions justify-end">
					<button
						class="btn"
						class:btn-primary={!!doc_content}
						on:click={add}
						disabled={running || !doc_content || !good_metadata}
					>
						{$t("dash.add")}
					</button>
				</div>
				{#if doc_created}
					<div class="overflow-auto text-sm">
						{@html $t("dash.document-created", {
							values: { id: doc_created },
						})}
					</div>
				{/if}
			</div>
		</div>

		<div class="card w-full max-w-4xl border shadow">
			<div class="card-body">
				<h2 class="card-title">{$t("dash.list-all-document-keys")}</h2>
				<div class="card-actions justify-end">
					<button class="btn-outline btn-primary btn" on:click={list} disabled={running}>
						{$t("dash.list")}
					</button>
				</div>
			</div>

			{#if keys.length}
				<div class="m-2 overflow-auto">
					<table class="table-compact table w-full">
						<thead>
							<tr>
								<th />
								<th>ID</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{#each keys as key, i (key)}
								<tr class="hover">
									<th>{i + 1}</th>
									<td>
										<a
											class="overflow-auto text-secondary"
											href="/api/doc/{key}"
											target="_blank">{key}</a
										>
									</td>
									<td>
										<button
											class="btn-outline btn-error btn-sm btn"
											on:click={() => remove(key)}
											disabled={running}
										>
											{$t("dash.remove")}
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		<CreateToken />

		<Language />

		<div class="p-2" />
	</div>
</div>
