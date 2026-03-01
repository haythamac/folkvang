import { ref } from 'vue'

const isMuted = ref(JSON.parse(localStorage.getItem('notif_muted') ?? 'false'))
const notifiedBosses = new Set()
const lastPlayedAt = ref(0)
const COOLDOWN_MS = 30 * 60 * 1000       // 30 minutes between sounds
const NOTIFY_THRESHOLD_MS = 10 * 60 * 1000  // 10 minutes before respawn

function playSound() {
    if (isMuted.value) return

    const now = Date.now()
    if (now - lastPlayedAt.value < COOLDOWN_MS) return

    const audio = new Audio('/notif.mp3')
    audio.volume = 0.5
    audio.play()
    lastPlayedAt.value = now
}

function toggleMute() {
    isMuted.value = !isMuted.value
    localStorage.setItem('notif_muted', JSON.stringify(isMuted.value))
}

function checkBosses(sections) {
    const now = Date.now()

    for (const section of sections) {
        for (const floor of section.floors) {
            for (const boss of floor.bosses) {
                if (boss.killedAt === null) continue

                const timeLeft = boss.respawnAt
                    ? boss.respawnAt - now
                    : boss.respawnMinAt - now

                const bossKey = `${boss.id}`

                if (timeLeft > 0 && timeLeft <= NOTIFY_THRESHOLD_MS && !notifiedBosses.has(bossKey)) {
                    notifiedBosses.add(bossKey)
                    playSound()
                }

                // Clear notification flag when boss is revived
                if (boss.killedAt === null) {
                    notifiedBosses.delete(bossKey)
                }
            }
        }
    }
}

function clearBossNotif(bossId) {
    notifiedBosses.delete(`${bossId}`)
}

export function useNotification() {
    return { isMuted, toggleMute, checkBosses, clearBossNotif }
}