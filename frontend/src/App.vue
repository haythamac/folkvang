<template>
	<div class="max-w-7xl mx-auto px-4 py-10 space-y-16">

		<!-- Header -->
		<header class="text-center mb-10">
			<h1 class="font-display text-4xl md:text-5xl font-bold text-primary glow-gold tracking-wider">
				Folkvang Timer
			</h1>
			<p class="text-muted-foreground mt-2 text-sm">
				Interactive & Real-time Boss Timer
			</p>
            <button @click="toggleMute" class="text-xs px-3 py-1 rounded border border-border mt-2">
                {{ isMuted ? '🔇 Muted' : '🔔 Sound On' }}
            </button>
            <button @click="handleCopyReport" class="text-xs px-3 py-1 rounded border border-border mt-2">
                {{ copied ? '✅ Copied!' : '📋 Copy Report' }}
            </button>
        </header>
		<!-- Sections -->
		<FloorSection v-for="(section, index) in sections" :key="index" :section="section" />

	</div>
</template>

<script setup>
import { ref, watch } from "vue"
import { useSocket } from './composables/useSocket'
import FloorSection from "./components/FloorSection.vue"
import { useNotification } from './composables/useNotification'
import { useReport } from './composables/useReport'

const sections = ref([])
const { isConnected, socket } = useSocket()
const { isMuted, toggleMute, checkBosses, clearBossNotif  } = useNotification()

const { copyReport } = useReport(sections)
const copied = ref(false)
// console.log('Socket connected?', isConnected.value)

// Create dungeon state once
socket.on('full_state', (state) => {
    sections.value = state
})

socket.on('boss_killed', ({ bossId, killedAt, respawnAt, respawnMinAt, respawnMaxAt }) => {
    const boss = findBoss(bossId)
    if (!boss) return
    boss.killedAt = killedAt
    boss.respawnAt = respawnAt ?? null
    boss.respawnMinAt = respawnMinAt ?? null
    boss.respawnMaxAt = respawnMaxAt ?? null
})

socket.on('boss_revived', ({ bossId }) => {
    const boss = findBoss(bossId)
    if (!boss) return
    boss.killedAt = null
    boss.respawnAt = null
    boss.respawnMinAt = null
    boss.respawnMaxAt = null
    clearBossNotif(bossId)
})

function testSound() {
    const audio = new Audio('/notif.mp3')
    audio.volume = 0.5
    audio.play()
}

function findBoss(bossId) {
    for (const section of sections.value) {
        for (const floor of section.floors) {
            const boss = floor.bosses.find(b => b.id === bossId)
            if (boss) return boss
        }
    }
    return null
}

// Run every second
setInterval(() => {
    checkBosses(sections.value)
}, 1000)

async function handleCopyReport() {
    const success = await copyReport()
    if (success) {
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    }
}
</script>

<style scoped></style>