<template>
    <div :class="[
        'rounded-lg border p-3 transition-all',
        isAlive ? 'border-alive/30 bg-alive/5' : 'border-dead/30 bg-dead/5'
    ]">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h4 class="font-display text-lg font-semibold tracking-wide text-primary glow-gold">
                    {{ boss.name }}
                </h4>

                <span class="text-[10px] text-muted-foreground">
                    {{ bossSubLabel }}
                </span>
            </div>

            <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', statusClass]">
                {{ statusLabel }}
            </span>
        </div>

        <!-- ALIVE -->
        <div v-if="isAlive" class="space-y-2">
            <TimePicker v-model="killedAtValue" ref="timePickerRef" />
            <button @click="handleKill"
                class="w-full bg-dead/80 hover:bg-dead text-dead-foreground text-xs px-3 py-1 rounded">
                Kill
            </button>
        </div>

        <!-- DEAD -->
        <div v-else class="space-y-2">
            <div class="flex justify-between text-xs">
                <span>Respawn at</span>
                <span v-if="boss.respawnAt">{{ formatTime12(new Date(boss.respawnAt)) }}</span>
                <span v-else>{{ formatTime12(new Date(boss.respawnMinAt)) }} - {{ formatTime12(new
                    Date(boss.respawnMaxAt)) }}</span>
            </div>

            <div class="flex justify-between text-xs items-center">
                <span>Countdown</span>
                <span class="font-mono font-bold">
                    <template v-if="boss.respawnAt">
                        {{ formatCountdown(remaining) }}
                    </template>
                    <template v-else>
                        {{ formatCountdown(remainingMin) }} - {{ formatCountdown(remainingMax) }}
                    </template>
                </span>
            </div>

            <div v-if="showRevertConfirm" class="flex justify-end gap-2">
                <span class="text-xs">Mark alive?</span>
                <button @click="emit('reset'); showRevertConfirm = false" class="text-xs px-2 py-1 bg-alive/80 rounded">
                    Yes
                </button>
                <button @click="showRevertConfirm = false" class="text-xs px-2 py-1 bg-muted rounded">
                    No
                </button>
            </div>

            <button v-else @click="showRevertConfirm = true" class="w-full text-xs py-1 bg-muted/50 rounded">
                Revert
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import TimePicker from './TimePicker.vue'

const props = defineProps({
    boss: {
        type: Object,
        required: true
    },
    section: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(["kill", "reset"])

/* ----------------------------------
   STATE
---------------------------------- */

const timeInput = ref("")
const userEdited = ref(false)
const now = ref(Date.now())
const showRevertConfirm = ref(false)

const killedAtValue = ref(Date.now())
const timePickerRef = ref(null)

let interval = null

/* ----------------------------------
   DERIVED
---------------------------------- */

const isAlive = computed(() => props.boss.killedAt === null)

const remainingMin = computed(() =>
    props.boss.respawnMinAt - now.value
)

const remainingMax = computed(() =>
    props.boss.respawnMaxAt - now.value
)

const remaining = computed(() => {
    if (!props.boss.respawnAt) return 0
    return props.boss.respawnAt - now.value
})

const bossSubLabel = computed(() => {
    if (props.boss.position) return formatPosition(props.boss.position)
    if (props.boss.level) return `Level ${props.boss.level}`
    if (props.boss.depth) return `Depth ${props.boss.depth}`
    return ""
})

const possibleAlive = computed(() => {
    return !isAlive.value && !props.boss.respawnAt && remainingMin.value <= 0 && remainingMax.value > 0;
});

const statusLabel = computed(() => {
    if (isAlive.value) return "ALIVE";
    if (possibleAlive.value) return "POSSIBLE ALIVE";
    return "DEAD";
});

const statusClass = computed(() => {
    if (isAlive.value) return 'bg-alive/20 text-alive-foreground';
    if (possibleAlive.value) return 'bg-alive/40 text-alive-foreground';
    return 'bg-dead/20 text-dead-foreground';
});
/* ----------------------------------
   LIFECYCLE
---------------------------------- */

onMounted(() => {
    interval = setInterval(() => {
        now.value = Date.now()
    }, 1000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})

/* ----------------------------------
   WATCHERS
---------------------------------- */

watch([now, isAlive, userEdited], () => {
    if (isAlive.value && !userEdited.value) {
        timeInput.value = formatTime12(new Date(now.value))
    }
})

watch([remainingMin, remainingMax, isAlive], () => {
    if (!isAlive.value && !props.boss.respawnAt && remainingMin.value <= 0 && remainingMax.value <= 0) {
        emit("reset");
    }
});

watch(remaining, (val) => {
    if (!isAlive.value && props.boss.respawnAt && val <= 0) {
        emit("reset")
    }
})

watch(isAlive, (alive) => {
    if (alive) userEdited.value = false
})

/* ----------------------------------
   METHODS
---------------------------------- */

function handleKill() {
    emit('kill', killedAtValue.value)
    if (timePickerRef.value) timePickerRef.value.reset()
}

function formatCountdown(ms) {
    if (ms <= 0) return "00:00:00"
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function formatTime12(date) {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    })
}

function formatPosition(pos) {
    const map = {
        "upper-left": "↖ Upper Left",
        "upper-right": "↗ Upper Right",
        "lower-right": "↘ Lower Right",
        "lower-left": "↙ Lower Left"
    }
    return map[pos] || pos
}


</script>