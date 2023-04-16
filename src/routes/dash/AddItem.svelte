<script lang="ts">
	import { t } from "svelte-i18n";

	export let token: string;

	let item_type = "text";
	let item_text = "";

	let id = "";

	let running = false;
	async function add() {
		if (running) {
			return;
		}
		running = true;

		try {
			id = "";
			const url = new URL("/api/item", window.location.href);
			const res = await fetch(url.toString(), {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					data: {
						text: item_text,
					},
					metadata: { type: item_type },
				}),
			});

			if (res.ok) {
				const result = await res.json<{ id: string }>();
				id = result.id;
			}
		} finally {
			running = false;
		}
	}
</script>

<div class="card w-full max-w-4xl border shadow">
	<div class="card-body">
		<h2 class="card-title">{$t("dash.add-document")}</h2>
		<div class="form-control">
			<label class="label" for="">
				<span class="label-text">{$t("dash.document-content")}</span>
			</label>
			<textarea class="textarea-bordered textarea h-24 resize-y" bind:value={item_text} />
			<label class="label" for="">
				<span class="label-text-alt">{$t("dash.doc-max-characters")}</span>
			</label>
		</div>
		<div class="card-actions justify-end">
			<button
				class="btn"
				class:btn-primary={!!item_text}
				on:click={add}
				disabled={running || !item_text}
			>
				{$t("dash.add")}
			</button>
		</div>
		{#if id}
			<div class="overflow-auto text-sm">
				{@html $t("dash.document-created", {
					values: { id },
				})}
			</div>
		{/if}
	</div>
</div>
