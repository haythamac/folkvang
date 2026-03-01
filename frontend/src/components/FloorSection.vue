<template>
    <div class="space-y-4">
        <!-- Section Title -->
        <h2 class="text-3xl font-bold tracking-wide text-primary glow-gold mb-6">
            {{ section.name }}
        </h2>
        <!-- Floors as 2x2 grid -->
        <div class="grid grid-cols-1 gap-6">
            <div v-for="(floor, floorIndex) in section.floors" :key="floorIndex"
                class="space-y-3 bg-card/40 border border-border rounded-xl p-6 shadow-inner">
                <h3 class="text-gold text-2xl font-bold tracking-wide mb-4">
                    {{ floor.name }}
                </h3>
                <div class="grid grid-cols-4 gap-3">
                    <BossCard v-for="(boss, bossIndex) in floor.bosses" :key="bossIndex" :boss="boss" :section="section"
                        @kill="(killedAt) => handleKill(boss, killedAt)" @reset="() => handleReset(boss)" />
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import BossCard from "./BossCard.vue"
import { computed } from "vue"
import { useSocket } from '../composables/useSocket'


const { emitKill, emitReset } = useSocket()

const props = defineProps({
    section: {
        type: Object,
        required: true
    }
})

/* ----------------------------------
   METHODS
---------------------------------- */


function handleKill(boss, killedAt) {
    emitKill(boss.id, killedAt)
}

function handleReset(boss) {
    emitReset(boss.id)
}

const isFolkvang = computed(() =>
    props.section.title.toLowerCase().includes("folkvang")
)

function dynamicGridClass() {
    return "grid-cols-2";
}
</script>
