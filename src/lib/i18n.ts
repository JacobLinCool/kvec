import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";

const fallback = "en";

register("en", () => import("$i18n/en.json"));
register("zh-TW", () => import("$i18n/zh-TW.json"));
register("zh-CN", () => import("$i18n/zh-CN.json"));
register("ja", () => import("$i18n/ja.json"));

init({
	fallbackLocale: fallback,
	initialLocale: browser ? window.navigator.language : fallback,
});
