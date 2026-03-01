import { computed } from 'vue'

const THRESHOLD_MS = 10 * 60 * 1000 // 15 minutes

export function useSpawningSoon(sections, now) {
    const spawningSoon = computed(() => {
        const results = []

        for (const section of sections.value) {
            for (const floor of section.floors) {
                for (const boss of floor.bosses) {
                    if (boss.killedAt === null) continue

                    const timeLeft = boss.respawnAt
                        ? boss.respawnAt - now.value
                        : boss.respawnMinAt - now.value

                    if (timeLeft > 0 && timeLeft <= THRESHOLD_MS) {
                        results.push({
                            bossId: boss.id,
                            bossName: boss.name,
                            floorName: floor.name,
                            sectionName: section.name,
                            respawnAt: boss.respawnAt,
                            respawnMinAt: boss.respawnMinAt,
                            respawnMaxAt: boss.respawnMaxAt,
                            timeLeft,
                        })
                    }
                }
            }
        }

        return results.sort((a, b) => a.timeLeft - b.timeLeft)
    })

    return { spawningSoon }
}