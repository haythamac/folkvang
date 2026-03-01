export function useReport(sections) {
    function generateReport() {
        const lines = []

        for (const section of sections.value) {
            for (const floor of section.floors) {
                const deadBosses = floor.bosses
                    .filter(b => b.killedAt !== null)
                    .sort((a, b) => a.killedAt - b.killedAt)

                if (deadBosses.length === 0) continue

                lines.push(`${floor.name}`)

                for (const boss of deadBosses) {
                    const ts = boss.respawnAt ?? boss.respawnMinAt
                    if (!ts) continue

                    const date = new Date(ts)
                    let hours = date.getHours()
                    if (hours > 12) hours -= 12
                    if (hours === 0) hours = 12
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    const time = `${hours}:${minutes}`

                    lines.push(`${time} - ${boss.name}`)
                }

                lines.push('') // Empty line between floors
            }
        }

        return lines.join('\n')
    }

    async function copyReport() {
        const report = generateReport()
        if (!report) return false
        await navigator.clipboard.writeText(report)
        return true
    }

    return { copyReport }
}