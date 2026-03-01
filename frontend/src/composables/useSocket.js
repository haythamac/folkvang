import { ref } from 'vue'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_SERVER_URL)
const isConnected = ref(false)

socket.on('connect', () => {
    isConnected.value = true
    console.log('Connected to server:', socket.id)
})

socket.on('disconnect', () => {
    isConnected.value = false
})

function emitKill(bossId, killedAt) {
    socket.emit('boss_kill', { bossId, killedAt })
}

function emitReset(bossId) {
    socket.emit('boss_reset', { bossId })
}

export function useSocket() {
    return { socket, isConnected, emitKill, emitReset }
}