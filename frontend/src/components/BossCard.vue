<template>
    <div :class="['flex items-center gap-3 px-3 py-2 transition-all',
        isAlive ? 'bg-alive/5' : 'bg-dead/5']">

        <!-- Boss Name -->
        <span class="text-sm font-medium w-24 shrink-0">{{ boss.name }}</span>

        <!-- Status Badge -->
        <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0', statusClass]">
            {{ statusLabel }}
        </span>

        <!-- Dead State -->
        <template v-if="!isAlive">
            <span class="font-mono text-xs text-muted-foreground shrink-0">
                {{ boss.respawnAt
                    ? formatTime12(new Date(boss.respawnAt))
                    : `${formatTime12(new Date(boss.respawnMinAt))} - ${formatTime12(new Date(boss.respawnMaxAt))}`
                }}
            </span>
            <span class="font-mono text-xs font-bold shrink-0">
                {{ boss.respawnAt
                    ? formatCountdown(remaining)
                    : `${formatCountdown(remainingMin)} - ${formatCountdown(remainingMax)}`
                }}
            </span>
            <div class="ml-auto flex items-center gap-2">
                <template v-if="showRevertConfirm">
                    <span class="text-xs text-muted-foreground">Mark alive?</span>
                    <button @click="emit('reset'); showRevertConfirm = false"
                        class="text-xs px-2 py-0.5 bg-alive/80 rounded">Yes</button>
                    <button @click="showRevertConfirm = false" class="text-xs px-2 py-0.5 bg-muted rounded">No</button>
                </template>
                <button v-else @click="showRevertConfirm = true"
                    class="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted rounded">
                    Revert
                </button>
            </div>
        </template>

        

        <!-- Alive State -->
        <template v-else>
            <div class="ml-auto flex items-center gap-2">
                <!-- Compact Time Picker -->
                <div class="flex items-center gap-0.5">
                    <div class="flex flex-col items-center">
                        <button @click="adjust('h', 1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▲</button>
                        <span class="font-mono text-xs font-bold w-5 text-center text-primary">{{ displayH }}</span>
                        <button @click="adjust('h', -1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▼</button>
                    </div>
                    <span class="font-mono text-xs text-muted-foreground">:</span>
                    <div class="flex flex-col items-center">
                        <button @click="adjust('m', 1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▲</button>
                        <span class="font-mono text-xs font-bold w-5 text-center text-primary">{{ displayM }}</span>
                        <button @click="adjust('m', -1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▼</button>
                    </div>
                    <span class="font-mono text-xs text-muted-foreground">:</span>
                    <div class="flex flex-col items-center">
                        <button @click="adjust('s', 1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▲</button>
                        <span class="font-mono text-xs font-bold w-5 text-center text-primary">{{ displayS }}</span>
                        <button @click="adjust('s', -1)"
                            class="text-muted-foreground hover:text-primary text-[8px]">▼</button>
                    </div>
                    <div class="flex flex-col items-center ml-1">
                        <button @click="togglePeriod"
                            class="text-muted-foreground hover:text-primary text-[8px]">▲</button>
                        <span class="font-mono text-xs font-bold w-6 text-center text-primary">{{ period }}</span>
                        <button @click="togglePeriod"
                            class="text-muted-foreground hover:text-primary text-[8px]">▼</button>
                    </div>
                </div>

                <!-- Quick adjust -->
                <div class="flex gap-1">
                    <button @click="adjustSeconds(-30)"
                        class="text-[10px] px-1.5 py-0.5 bg-muted/50 hover:bg-muted rounded">-30s</button>
                    <button @click="adjustSeconds(-10)"
                        class="text-[10px] px-1.5 py-0.5 bg-muted/50 hover:bg-muted rounded">-10s</button>
                    <button @click="adjustSeconds(10)"
                        class="text-[10px] px-1.5 py-0.5 bg-muted/50 hover:bg-muted rounded">+10s</button>
                    <button @click="adjustSeconds(30)"
                        class="text-[10px] px-1.5 py-0.5 bg-muted/50 hover:bg-muted rounded">+30s</button>
                </div>

                <button @click="handleKill"
                    class="text-xs px-3 py-1 bg-dead/80 hover:bg-dead text-dead-foreground rounded">
                    Kill
                </button>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    boss: { type: Object, required: true },
    section: { type: Object, required: true }
})

const emit = defineEmits(['kill', 'reset'])

const now = ref(Date.now())
const showRevertConfirm = ref(false)
let interval = null

// Time picker state
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const period = ref('AM')
const userEdited = ref(false)
const killedAtValue = ref(Date.now())

onMounted(() => {
    syncToNow()
    interval = setInterval(() => {
        now.value = Date.now()
        if (!userEdited.value) syncToNow()
    }, 1000)
})

onUnmounted(() => clearInterval(interval))

function syncToNow() {
    const d = new Date()
    let h = d.getHours()
    period.value = h >= 12 ? 'PM' : 'AM'
    if (h > 12) h -= 12
    if (h === 0) h = 12
    hours.value = h
    minutes.value = d.getMinutes()
    seconds.value = d.getSeconds()
    emitValue()
}

const displayH = computed(() => String(hours.value).padStart(2, '0'))
const displayM = computed(() => String(minutes.value).padStart(2, '0'))
const displayS = computed(() => String(seconds.value).padStart(2, '0'))

function adjust(unit, delta) {
    userEdited.value = true
    if (unit === 'h') hours.value = ((hours.value - 1 + delta + 12) % 12) + 1
    else if (unit === 'm') minutes.value = (minutes.value + delta + 60) % 60
    else if (unit === 's') seconds.value = (seconds.value + delta + 60) % 60
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
    killedAtValue.value = d.getTime()
}

// Derived
const isAlive = computed(() => props.boss.killedAt === null)
const remainingMin = computed(() => props.boss.respawnMinAt - now.value)
const remainingMax = computed(() => props.boss.respawnMaxAt - now.value)
const remaining = computed(() => props.boss.respawnAt ? props.boss.respawnAt - now.value : 0)

const possibleAlive = computed(() =>
    !isAlive.value && !props.boss.respawnAt && remainingMin.value <= 0 && remainingMax.value > 0
)

const statusLabel = computed(() => {
    if (isAlive.value) return 'ALIVE'
    if (possibleAlive.value) return 'POSSIBLE ALIVE'
    return 'DEAD'
})

const statusClass = computed(() => {
    if (isAlive.value) return 'bg-alive/20 text-alive-foreground'
    if (possibleAlive.value) return 'bg-alive/40 text-alive-foreground'
    return 'bg-dead/20 text-dead-foreground'
})

// Watchers
watch([remainingMin, remainingMax, isAlive], () => {
    if (!isAlive.value && !props.boss.respawnAt && remainingMin.value <= 0 && remainingMax.value <= 0) {
        emit('reset')
    }
})

watch(remaining, (val) => {
    if (!isAlive.value && props.boss.respawnAt && val <= 0) emit('reset')
})

watch(isAlive, (alive) => {
    if (alive) userEdited.value = false
})

function handleKill() {
    emit('kill', killedAtValue.value)
    userEdited.value = false
    syncToNow()
}

function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00'
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTime12(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}
</script>