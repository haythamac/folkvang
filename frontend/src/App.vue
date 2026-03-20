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
            <button @click="toggleMute(activeTab)" class="text-xs px-3 py-1 rounded border border-border mt-2">
                {{ activeTab === 'folkvang'
                    ? (isMutedFolkvang ? '🔇 Muted' : '🔔 Sound On')
                    : (isMutedNidavellir ? '🔇 Muted' : '🔔 Sound On')
                }}
            </button>
            <button @click="handleCopyReport" class="text-xs px-3 py-1 rounded border border-border mt-2">
                {{ copied ? '✅ Copied!' : '📋 Copy Report' }}
            </button>
        </header>
        <SpawningSoonPanel :spawningSoon="spawningSoon" />
        <div class="flex gap-2 justify-center mb-8">
            <button @click="activeTab = 'folkvang'" :class="['px-6 py-2 rounded-lg text-sm font-semibold transition-all border',
                activeTab === 'folkvang'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50']">
                Folkvang
            </button>
            <button @click="activeTab = 'nidavellir'" :class="['px-6 py-2 rounded-lg text-sm font-semibold transition-all border',
                activeTab === 'nidavellir'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50']">
                Nidavellir
            </button>
        </div>

        <!-- Active Sections -->
        <FloorSection v-for="(section, sectionIndex) in activeSections" :key="section.id" :section="section"
            :sectionIndex="sectionIndex" />

    </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"
import FloorSection from "./components/FloorSection.vue"
import SpawningSoonPanel from './components/SpawningSoonPanel.vue'

import { useSocket } from './composables/useSocket'
import { useSpawningSoon } from './composables/useSpawningSoon'
import { useNotification } from './composables/useNotification'
import { useReport } from './composables/useReport'
const { copyReport } = useReport()

const sections = ref([])
const { isConnected, socket } = useSocket()
const { isMutedFolkvang, isMutedNidavellir, toggleMute, checkBosses, clearBossNotif } = useNotification()

const copied = ref(false)
// console.log('Socket connected?', isConnected.value)

const now = ref(Date.now())
setInterval(() => now.value = Date.now(), 1000)

const { spawningSoon } = useSpawningSoon(sections, now)
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
    const success = await copyReport(activeSections.value)
    if (success) {
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    }
}


const activeTab = ref('folkvang')

const folkvangSections = computed(() =>
    sections.value.filter(s => s.mapType === 'folkvang')
)

const nidavellirSections = computed(() =>
    sections.value.filter(s => s.mapType === 'nidavellir')
)

const activeSections = computed(() =>
    activeTab.value === 'folkvang' ? folkvangSections.value : nidavellirSections.value
)
</script>

<style scoped></style>