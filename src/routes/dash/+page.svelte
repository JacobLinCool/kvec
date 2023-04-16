<script lang="ts">
	import { goto } from "$app/navigation";
	import Language from "$lib/component/Language.svelte";
	import { onMount } from "svelte";
	import AddItem from "./AddItem.svelte";
	import CreateToken from "./CreateToken.svelte";
	import ListKeys from "./ListKeys.svelte";
	import SearchItem from "./SearchItem.svelte";

	let token: string | null = null;

	onMount(async () => {
		token = localStorage.getItem("kvec_token");
		if (!token) {
			await goto("/login");
		}

		check_token();
	});

	async function check_token() {
		const res = await fetch(`/api/auth/${token}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			localStorage.removeItem("kvec_token");
			await goto("/login");
		}
	}
</script>

<svelte:head>
	<title>KVec Dashboard</title>
</svelte:head>

<div class="h-full w-full overflow-auto">
	<div class="flex h-full w-full flex-col items-center justify-start gap-6 p-4">
		<div class="text-4xl font-bold">KVec Dashboard</div>

		{#if token}
			<SearchItem {token} />
		{/if}

		{#if token}
			<AddItem {token} />
		{/if}

		{#if token}
			<ListKeys {token} />
		{/if}

		<CreateToken />

		<Language />

		<div class="p-2" />
	</div>
</div>
