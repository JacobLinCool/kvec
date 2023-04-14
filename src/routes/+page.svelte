<script lang="ts">
	import { t } from "svelte-i18n";
</script>

<svelte:head>
	<title>{$t("welcome")}</title>
	<meta name="description" content={$t("with-tech")} />
</svelte:head>

<div class="flex h-full w-full items-center justify-center p-4">
	<div class="prose">
		<h1>{$t("welcome")}</h1>
		<p>{$t("with-tech")}</p>
		<div class="flex gap-4">
			<a class="btn normal-case" href="/dash">
				{$t("manage-your-kvec")}
			</a>
			<a
				class="btn-outline btn normal-case"
				href="https://github.com/JacobLinCool/kvec"
				target="_blank"
			>
				{$t("goto-github")}
			</a>
		</div>
		<a href="https://github.com/JacobLinCool/kvec" title="GitHub Repository" target="_blank">
			<img src="/icon.webp" alt="KVec Logo" width="600" height="600" class="max-w-full" />
		</a>
	</div>
</div>
