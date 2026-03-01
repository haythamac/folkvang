import { ref } from 'vue'
import { io } from 'socket.io-client'

const params = new URLSearchParams(window.location.search)
const isDemo = params.get('demo') === 'true'

const SERVER_URL = isDemo 
    ? import.meta.env.VITE_DEMO_SERVER_URL 
    : import.meta.env.VITE_SERVER_URL

const socket = io(SERVER_URL)
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