<template>
    <div v-if="hasAny" class="bg-card/40 border border-border rounded-xl overflow-hidden">
        <!-- Header — always visible -->
        <button @click="isOpen = !isOpen"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-all">
            <h2 class="text-sm font-semibold tracking-widest uppercase">
                ⚠ Spawning Soon
                <span class="ml-2 text-xs text-muted-foreground">({{ spawningSoon.length }})</span>
            </h2>
            <span class="text-muted-foreground text-xs">{{ isOpen ? '▲' : '▼' }}</span>
        </button>

        <!-- Collapsible content -->
        <div v-if="isOpen" class="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div v-for="entry in spawningSoon" :key="entry.bossId"
                class="flex items-center justify-between bg-background/50 border border-border rounded-lg px-3 py-2">
                <div>
                    <p class="text-sm font-semibold">{{ entry.bossName }}</p>
                    <p class="text-xs text-muted-foreground">{{ entry.floorName }} · {{ entry.sectionName }}</p>
                </div>
                <div class="text-right">
                    <p class="font-mono text-sm font-bold text-alive">
                        {{ formatCountdown(entry.timeLeft) }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                        <span v-if="entry.respawnAt">{{ formatTime(entry.respawnAt) }}</span>
                        <span v-else>{{ formatTime(entry.respawnMinAt) }} - {{ formatTime(entry.respawnMaxAt) }}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    spawningSoon: { type: Array, required: true }
})

const isOpen = ref(false) // default minimized
const hasAny = computed(() => props.spawningSoon.length > 0)

function formatCountdown(ms) {
    if (ms <= 0) return '00:00'
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    })
}
</script>