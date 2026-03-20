import { ref } from 'vue'

const isMutedFolkvang = ref(JSON.parse(localStorage.getItem('notif_muted_folkvang') ?? 'false'))
const isMutedNidavellir = ref(JSON.parse(localStorage.getItem('notif_muted_nidavellir') ?? 'false'))

const notifiedBosses = new Set()
const lastPlayedAt = ref(0)
const COOLDOWN_MS = 30 * 60 * 1000
const NOTIFY_THRESHOLD_MS = 10 * 60 * 1000

function playSound(mapType) {
    const isMuted = mapType === 'folkvang' ? isMutedFolkvang.value : isMutedNidavellir.value
    if (isMuted) return

    const now = Date.now()
    if (now - lastPlayedAt.value < COOLDOWN_MS) return

    const audio = new Audio('/notif.mp3')
    audio.volume = 0.5
    audio.play()
    lastPlayedAt.value = now
}

function toggleMute(mapType) {
    if (mapType === 'folkvang') {
        isMutedFolkvang.value = !isMutedFolkvang.value
        localStorage.setItem('notif_muted_folkvang', JSON.stringify(isMutedFolkvang.value))
    } else {
        isMutedNidavellir.value = !isMutedNidavellir.value
        localStorage.setItem('notif_muted_nidavellir', JSON.stringify(isMutedNidavellir.value))
    }
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
                    playSound(section.mapType)
                }

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
    return { isMutedFolkvang, isMutedNidavellir, toggleMute, checkBosses, clearBossNotif }
}