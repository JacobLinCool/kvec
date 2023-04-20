const map = new Map<string, number>();

export const time = {
	start: (key: string) => {
		map.set(key, Date.now());
	},

	stop: (key: string) => {
		const start = map.get(key);
		if (!start) {
			return;
		}
		const end = Date.now();
		console.log(`${key} took ${end - start}ms`);
	},
};
