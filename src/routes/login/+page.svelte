<script lang="ts">
	import Icon from "@iconify/svelte";
	import { goto } from "$app/navigation";
	import { t } from "svelte-i18n";

	let secret = "";
	let running = false;
	let error = "";

	async function login() {
		if (!secret || running) {
			return;
		}
		running = true;

		try {
			const res = await fetch("/api/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ secret }),
			});

			if (res.ok) {
				const { token } = await res.json<{ token: string }>();
				localStorage.setItem("kvec_token", token);
				await goto("/dash");
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
</script>

<svelte:head>
	<title>Login into KVec</title>
</svelte:head>

<div class="w-hull flex h-full flex-col items-center justify-center">
	<div class="w-full max-w-md">
		<h1 class="mb-2 text-2xl font-bold text-base-content">{$t("login.login-into-kvec")}</h1>
		<div class="form-control w-full">
			<div class="input-group">
				<input
					class="input-bordered input w-full"
					type="password"
					placeholder={$t("login.enter-app-secret")}
					bind:value={secret}
					disabled={running}
				/>
				<button
					class="btn-square btn text-xl"
					title={$t("login.login")}
					on:click={login}
					disabled={running}
				>
					<Icon icon="ic:round-log-in" />
				</button>
			</div>
		</div>
		{#if error}
			<div class="alert alert-error mt-2">
				{error}
			</div>
		{/if}
	</div>
</div>
