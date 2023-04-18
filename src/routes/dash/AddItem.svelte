<script lang="ts">
	import { t } from "svelte-i18n";

	export let token: string;

	const supported_types = ["text", "page", "img"];
	let item_type = "text";

	let item_text = "";

	let item_url = "";

	let files: FileList;
	let image_base64 = "";
	let item_img = "";
	$: {
		if (image_base64) {
			item_img = image_base64;
		}
	}

	let id = "";
	let error = "";

	let running = false;
	async function add() {
		if (running) {
			return;
		}
		running = true;

		try {
			id = "";
			error = "";

			const body = {
				data: {
					[item_type]:
						item_type === "text"
							? item_text
							: item_type === "page"
							? item_url
							: item_img,
				},
			};

			const url = new URL("/api/item", window.location.href);
			const res = await fetch(url.toString(), {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});

			if (res.ok) {
				const result = await res.json<{ id: string }>();
				id = result.id;
				error = "";
			} else {
				throw new Error(`${res.status} ${res.statusText}`);
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = "Unknown error";
			}
		} finally {
			running = false;
		}
	}

	async function upload() {
		if (files.length === 0) {
			return;
		}

		await new Promise<void>((resolve, reject) => {
			const file = files[0];

			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target) {
					image_base64 = e.target.result as string;
					resolve();
				} else {
					image_base64 = "";
					reject();
				}
			};
			reader.readAsDataURL(file);
		});
	}
</script>

<div class="card w-full max-w-4xl border shadow">
	<div class="card-body">
		<h2 class="card-title">{$t("dash.add-item")}</h2>
		<select class="select-bordered select w-full max-w-xs" bind:value={item_type}>
			{#each supported_types as type}
				<option value={type} selected={item_type === type}
					>{$t(`dash.item-type.${type}`)}</option
				>
			{/each}
		</select>
		{#if item_type === "text"}
			<div class="form-control">
				<label class="label" for="">
					<span class="label-text">{$t("dash.item-content")}</span>
				</label>
				<textarea class="textarea-bordered textarea h-24 resize-y" bind:value={item_text} />
				<label class="label" for="">
					<span class="label-text-alt">{$t("dash.doc-max-characters")}</span>
				</label>
			</div>
		{:else if item_type === "page"}
			<div class="form-control">
				<label class="label" for="">
					<span class="label-text">{$t("dash.webpage-url")}</span>
				</label>
				<input
					class="input-bordered input"
					type="url"
					placeholder="https://"
					bind:value={item_url}
				/>
			</div>
		{:else if item_type === "img"}
			<div class="form-control">
				<label class="label" for="">
					<span class="label-text">{$t("dash.image-url")}</span>
				</label>
				<input
					class="input-bordered input"
					type="url"
					placeholder="https://"
					bind:value={item_img}
				/>

				<div class="divider">OR</div>

				<input
					class="file-input-bordered file-input w-full"
					type="file"
					accept="image/*"
					bind:files
					on:change={upload}
				/>
			</div>
		{/if}
		<div class="card-actions justify-end">
			<button
				class="btn"
				class:btn-primary={!!item_text}
				on:click={add}
				disabled={running ||
					(item_type === "text" && !item_text) ||
					(item_type === "page" && !item_url) ||
					(item_type === "img" && !item_img)}
			>
				{$t("dash.add")}
			</button>
		</div>
		{#if id}
			<div class="overflow-auto text-sm">
				{@html $t("dash.item-created", {
					values: { id },
				})}
			</div>
		{/if}
		{#if error}
			<div class="alert alert-error overflow-auto">
				{error}
			</div>
		{/if}
	</div>
</div>
