<template>
    <div class="space-y-2">
        <!-- Time segments -->
        <div class="flex items-center justify-center">
            <!-- Hours -->
            <div class="flex flex-col items-center">
                <button @click="adjust('h', 1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▲</button>
                <span class="font-mono text-lg font-bold w-8 text-center select-none">{{ displayH }}</span>
                <button @click="adjust('h', -1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▼</button>
            </div>

            <span class="font-mono text-lg font-bold text-muted-foreground mb-0.5">:</span>

            <!-- Minutes -->
            <div class="flex flex-col items-center">
                <button @click="adjust('m', 1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▲</button>
                <span class="font-mono text-lg font-bold w-8 text-center select-none">{{ displayM }}</span>
                <button @click="adjust('m', -1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▼</button>
            </div>

            <span class="font-mono text-lg font-bold text-muted-foreground mb-0.5">:</span>

            <!-- Seconds -->
            <div class="flex flex-col items-center">
                <button @click="adjust('s', 1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▲</button>
                <span class="font-mono text-lg font-bold w-8 text-center select-none">{{ displayS }}</span>
                <button @click="adjust('s', -1)" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▼</button>
            </div>

            <!-- AM/PM -->
            <div class="flex flex-col items-center ml-1">
                <button @click="togglePeriod" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▲</button>
                <span class="font-mono text-sm font-bold w-8 text-center select-none">{{ period }}</span>
                <button @click="togglePeriod" class="text-muted-foreground hover:text-primary text-[10px] py-0.5">▼</button>
            </div>
        </div>

        <!-- Quick adjust -->
        <div class="flex gap-1 justify-center">
            <button @click="adjustSeconds(-30)" class="text-[10px] px-2 py-0.5 bg-muted/50 hover:bg-muted rounded">-30s</button>
            <button @click="adjustSeconds(-10)" class="text-[10px] px-2 py-0.5 bg-muted/50 hover:bg-muted rounded">-10s</button>
            <button @click="adjustSeconds(10)" class="text-[10px] px-2 py-0.5 bg-muted/50 hover:bg-muted rounded">+10s</button>
            <button @click="adjustSeconds(30)" class="text-[10px] px-2 py-0.5 bg-muted/50 hover:bg-muted rounded">+30s</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['update:modelValue'])

// Internal time state in 24h
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const period = ref('AM')
const userEdited = ref(false)

let interval = null

// Auto update every second if user hasn't edited
onMounted(() => {
    syncToNow()
    interval = setInterval(() => {
        if (!userEdited.value) syncToNow()
    }, 1000)
})

onUnmounted(() => clearInterval(interval))

function syncToNow() {
    const now = new Date()
    let h = now.getHours()
    period.value = h >= 12 ? 'PM' : 'AM'
    if (h > 12) h -= 12
    if (h === 0) h = 12
    hours.value = h
    minutes.value = now.getMinutes()
    seconds.value = now.getSeconds()
    emitValue()
}

// Display helpers
const displayH = computed(() => String(hours.value).padStart(2, '0'))
const displayM = computed(() => String(minutes.value).padStart(2, '0'))
const displayS = computed(() => String(seconds.value).padStart(2, '0'))

function adjust(unit, delta) {
    userEdited.value = true
    if (unit === 'h') {
        hours.value = ((hours.value - 1 + delta + 12) % 12) + 1
    } else if (unit === 'm') {
        minutes.value = (minutes.value + delta + 60) % 60
    } else if (unit === 's') {
        seconds.value = (seconds.value + delta + 60) % 60
    }
    emitValue()
}

function adjustSeconds(delta) {
    userEdited.value = true
    const d = new Date()
    let h = hours.value
    if (period.value === 'PM' && h !== 12) h += 12
    if (period.value === 'AM' && h === 12) h = 0
    d.setHours(h, minutes.value, seconds.value, 0)
    d.setSeconds(d.getSeconds() + delta)
    let newH = d.getHours()
    period.value = newH >= 12 ? 'PM' : 'AM'
    if (newH > 12) newH -= 12
    if (newH === 0) newH = 12
    hours.value = newH
    minutes.value = d.getMinutes()
    seconds.value = d.getSeconds()
    emitValue()
}

function togglePeriod() {
    userEdited.value = true
    period.value = period.value === 'AM' ? 'PM' : 'AM'
    emitValue()
}

function emitValue() {
    let h = hours.value
    if (period.value === 'PM' && h !== 12) h += 12
    if (period.value === 'AM' && h === 12) h = 0
    const d = new Date()
    d.setHours(h, minutes.value, seconds.value, 0)
    emit('update:modelValue', d.getTime())
}

// Expose reset for parent
function reset() {
    userEdited.value = false
    syncToNow()
}

defineExpose({ reset })
</script>