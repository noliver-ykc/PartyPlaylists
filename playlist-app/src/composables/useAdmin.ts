import { ref } from 'vue'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined
const SESSION_KEY = 'party_admin'

const isAdmin = ref(sessionStorage.getItem(SESSION_KEY) === '1')

export function useAdmin() {
  const login = (password: string): boolean => {
    if (!ADMIN_PASSWORD) {
      console.error('VITE_ADMIN_PASSWORD is not set')
      return false
    }
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      isAdmin.value = true
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    isAdmin.value = false
  }

  return { isAdmin, login, logout }
}
