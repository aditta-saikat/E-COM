import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const THEME_KEY = 'ecom_theme'

const getInitialDark = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored) return stored === 'dark'
  } catch {
    // localStorage unavailable (private browsing, blocked storage) - fall through
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)

    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore write failures, theme just won't persist this session
    }
  }, [dark])

  const toggleDark = () => setDark((previous) => !previous)

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
