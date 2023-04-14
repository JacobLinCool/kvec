<script lang="ts">
	import { t } from "svelte-i18n";

	let secret = "";
	let exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
		.toISOString()
		.slice(0, 16)
		.toString();
	let perm = { read: true, write: true };

	$: {
		console.log(secret, exp, perm);
	}

	let running = false;
	let token: string | null = null;
	let error = "";
	async function create() {
		if (running) {
			return;
		}
		running = true;

		try {
			token = null;
			error = "";
			const url = new URL("/api/auth", window.location.href);
			const res = await fetch(url.toString(), {
				method: "POST",
				body: JSON.stringify({
					secret,
					exp: Math.floor((new Date(exp).getTime() - Date.now()) / 1000),
					perm,
				}),
			});

			if (res.ok) {
				const { token: t } = await res.json<{ token: string }>();
				token = t;
			} else {
				try {
					const { message } = await res.json<{ message: string }>();
					error = `${res.status}: ${message}`;
				} catch {
					error = `${res.status}: ${res.statusText}`;
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Unknown Error";
		} finally {
			running = false;
		}
	}

	let copied = false;
	function copy() {
		if (token) {
			navigator.clipboard.writeText(token);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

<div class="card w-full max-w-4xl border shadow">
	<div class="card-body">
		<h2 class="card-title">{$t("dash.create-token")}</h2>

		<div class="form-control mb-2">
			<label class="label" for="">
				<span class="label-text">{$t("dash.app-secret")}</span>
			</label>
			<input type="password" class="input-bordered input" bind:value={secret} />

			<label class="label" for="">
				<span class="label-text">{$t("dash.expiration")}</span>
			</label>
			<input type="datetime-local" class="input-bordered input" bind:value={exp} />

			<div class="my-4 flex gap-8 p-2">
				<div class="flex items-center justify-center gap-4">
					<span class="label-text">{$t("dash.read")}</span>
					<input
						type="checkbox"
						bind:checked={perm.read}
						class="checkbox-primary checkbox"
					/>
				</div>
				<div class="flex items-center justify-center gap-4">
					<span class="label-text">{$t("dash.write")}</span>
					<input
						type="checkbox"
						bind:checked={perm.write}
						class="checkbox-primary checkbox"
					/>
				</div>
			</div>
		</div>

		<div class="flex justify-end">
			<button class="btn-outline btn-primary btn" on:click={create} disabled={running}>
				{$t("dash.create")}
			</button>
		</div>

		{#if token}
			<div class="form-control mt-2">
				<input
					type="text"
					class="input-bordered input-secondary input cursor-pointer"
					value={token}
					readonly
					on:click={copy}
				/>
				<label class="label" for="">
					<button class="label-text-alt cursor-pointer" on:click={copy}>
						{#if copied}
							{$t("dash.copied")}
						{:else}
							{$t("dash.click-to-copy")}
						{/if}
					</button>
				</label>
			</div>
		{/if}

		{#if error}
			<div class="alert alert-error mt-2">
				{error}
			</div>
		{/if}
	</div>
</div>
