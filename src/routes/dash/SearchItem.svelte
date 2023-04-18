<script lang="ts">
	import type { ObjStoreItem } from "$lib/types";
	import { t } from "svelte-i18n";
	import Icon from "@iconify/svelte";

	export let token: string;

	let search_query = "";
	let search_results: ObjStoreItem[] = [];
	let search_done = false;
	$: {
		search_query;
		search_done = false;
	}

	let running = false;
	async function search() {
		if (!search_query || running) {
			return;
		}
		running = true;

		try {
			const url = new URL("/api/item", window.location.href);
			url.searchParams.set("q", search_query);
			const res = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const { items } = await res.json<{ items: ObjStoreItem[] }>();
			search_results = items;
			search_done = true;
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
			const url = new URL(`/api/item/${id}`, window.location.href);
			const res = await fetch(url.toString(), {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				search_results = search_results.filter((item) => item.id !== id);
			}
		} finally {
			running = false;
		}
	}
</script>

<div class="card w-full max-w-4xl border shadow">
	<div class="card-body">
		<h2 class="card-title">{$t("dash.search")}</h2>
		<div class="form-control w-full">
			<div class="input-group">
				<input
					class="input-bordered input w-full outline-none transition-all focus:input-primary focus:!outline-none"
					type="text"
					placeholder={$t("dash.search-for-items")}
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
			{#each search_results as item (item.id)}
				<div class="card card-compact w-full max-w-4xl border shadow">
					<div class="card-body">
						<a
							class="overflow-auto text-secondary"
							href="/api/item/{item.id}"
							target="_blank"
						>
							{item.id}
						</a>
						{#if item.meta.type === "text"}
							<div class="max-h-60 w-full overflow-auto">
								<pre class="text-sm">{item.data.text}</pre>
							</div>
						{:else if item.meta.type === "page" && typeof item.data.page === "string"}
							<a href={item.data.page} target="_blank">{item.data.text}</a>
						{:else if item.meta.type === "img" && typeof item.data.text === "string" && typeof item.data.img === "string"}
							<img src={item.data.img} alt={item.data.text} />
						{/if}
						{#if Object.keys(item.meta).length}
							<div class="max-h-60 w-full overflow-auto">
								<pre class="font-mono text-sm text-info">{JSON.stringify(
										item.meta,
										null,
										4,
									)}</pre>
							</div>
						{/if}
						<div class="card-actions justify-end">
							<button
								class="btn-outline btn-error btn-sm btn"
								on:click={() => remove(item.id)}
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
