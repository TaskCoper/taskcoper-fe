import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const STORAGE_KEY = 'auth'

interface UserPayload extends JwtPayload {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: UserPayload | null
  signIn: (accessToken: string, refreshToken: string) => void
  signOut: () => void
  updateTokens: (tokens: { accessToken: string; refreshToken?: string }) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      signIn: (accessToken: string, refreshToken: string) => {
        const user = jwtDecode<UserPayload>(accessToken)

        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user
        })
      },
      signOut: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null
        })
      },
      updateTokens: ({ accessToken, refreshToken }) =>
        set((state) => {
          const user = jwtDecode<UserPayload>(accessToken)

          return {
            accessToken,
            refreshToken: refreshToken ?? state.refreshToken,
            user,
            isAuthenticated: true
          }
        })
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          try {
            const user = jwtDecode<UserPayload>(state.accessToken)
            state.user = user
            state.isAuthenticated = true
          } catch {
            state.accessToken = null
            state.refreshToken = null
            state.user = null
            state.isAuthenticated = false
          }
        }
      }
    }
  )
)
