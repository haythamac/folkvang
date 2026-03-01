// Fixed respawn helper
const fixedRespawn = (durationMs) => (killedAt) => killedAt + durationMs;

// Random respawn helper
const rangeRespawn = (minMs, maxMs) => ({
	min: minMs,
	max: maxMs,
});

// Respawn times
export const RESPAWN_STRATEGIES = {
	inter: fixedRespawn(2 * 60 * 60 * 1000), // 2h
	normal: fixedRespawn(8 * 60 * 60 * 1000), // 8h
	myrkrheim: rangeRespawn(30 * 60 * 1000, 60 * 60 * 1000), // 30m - 1h
	trolls: rangeRespawn(30 * 60 * 1000, 60 * 60 * 1000), // 30m - 1h
	futureMap: rangeRespawn(60 * 60 * 1000, 120 * 60 * 1000), // 1h - 2h
};

// Factory function to create floors
// TODO: NOT ALL FLOORS HAVE 4 BOSSES, NEED TO MAKE THIS MORE FLEXIBLE
function makeFloors(prefix, bossTemplate) {
	return [1, 2, 3, 4].map((f) => ({
		label: `${prefix} ${f}F`,
		bosses: bossTemplate.map((b) => ({
			...b,
			killedAt: null,
			respawnAt: null,
		})),
	}));
}

// Factory function to create sections
export function createSections() {
	return [
		{
			title: "Inter Folkvang",
			strategy: RESPAWN_STRATEGIES.inter,
			floors: makeFloors("Inter", [
				{ name: "Berserker", position: "upper-left" },
				{ name: "Warlord", position: "upper-right" },
				{ name: "Volva", position: "lower-right" },
				{ name: "Skald", position: "lower-left" },
			]),
		},

		{
			title: "Normal Folkvang",
			strategy: RESPAWN_STRATEGIES.normal,
			floors: makeFloors("Normal", [
				{ name: "Berserker", position: "upper-left" },
				{ name: "Warlord", position: "upper-right" },
				{ name: "Volva", position: "lower-right" },
				{ name: "Skald", position: "lower-left" },
			]),
		},

		{
			title: "Myrkrheim",
			strategy: RESPAWN_STRATEGIES.myrkrheim,
			floors: makeFloors("Myrkrheim", [
				{ name: "Level 1", level: 1 },
				{ name: "Level 2", level: 2 },
				{ name: "Level 3", level: 3 },
			]),
		},

		{
			title: "Troll's Tomb",
			strategy: RESPAWN_STRATEGIES.trolls,
			floors: makeFloors("Troll", [
				{ name: "Depth 1", level: 1 },
				{ name: "Depth 2", level: 2 },
			]),
		},
	];
}
