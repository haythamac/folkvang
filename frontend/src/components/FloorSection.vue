<template>
    <div>
        <!-- Section Title -->
        <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {{ section.name }}
        </h2>

        <!-- Floors -->
        <div class="space-y-6 mb-8">
            <div v-for="(floor, floorIndex) in section.floors" :key="floorIndex"
                class="border border-border rounded-lg overflow-hidden">

                <!-- Floor Label -->
                <div class="px-3 py-1.5 bg-muted/30 border-b border-border">
                    <span class="text-xs font-semibold text-muted-foreground">{{ floor.name }}</span>
                </div>

                <!-- Boss Rows -->
                <div class="divide-y divide-border">
                    <BossCard v-for="(boss, bossIndex) in floor.bosses" :key="bossIndex" :boss="boss" :section="section"
                        @kill="(killedAt) => handleKill(boss, killedAt)" @reset="() => handleReset(boss)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import BossCard from "./BossCard.vue"
import { useSocket } from '../composables/useSocket'

const { emitKill, emitReset } = useSocket()

const props = defineProps({
    section: { type: Object, required: true },
    sectionIndex: { type: Number, required: true }
})

function handleKill(boss, killedAt) {
    emitKill(boss.id, killedAt)
}

function handleReset(boss) {
    emitReset(boss.id)
}
</script>