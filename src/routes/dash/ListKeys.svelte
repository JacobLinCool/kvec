<script lang="ts">
	import { t } from "svelte-i18n";

	export let token: string;

	let keys: string[] = [];

	let running = false;
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
</script>

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
									href="/api/item/{key}"
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
