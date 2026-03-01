export function useReport(sections) {
    function generateReport() {
        const lines = []

        for (const section of sections.value) {
            for (const floor of section.floors) {
                // Get only dead bosses with a killedAt, sorted by kill time
                const deadBosses = floor.bosses
                    .filter(b => b.killedAt !== null)
                    .sort((a, b) => a.killedAt - b.killedAt)

                if (deadBosses.length === 0) continue

                lines.push(`${floor.name}`)
                for (const boss of deadBosses) {
                    const time = new Date(boss.killedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    lines.push(`${time} - ${boss.name}`)
                }
                lines.push('') // empty line between floors
                lines.push('') // empty line between floors
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