import { io, Socket } from 'socket.io-client'

// Socket.IO подключается напрямую к домену, nginx проксирует /socket.io на backend
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // В браузере используем текущий домен
    return window.location.origin
  }
  // На сервере используем переменную окружения или дефолт
  return process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
}

const SOCKET_URL = getSocketUrl()

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}



