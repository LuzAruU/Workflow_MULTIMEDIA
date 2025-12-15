"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "default" | "blue" | "forest" | "violet"
type DarkMode = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  darkMode: DarkMode
  setDarkMode: (mode: DarkMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default")
  const [darkMode, setDarkModeState] = useState<DarkMode>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load saved preferences
    const savedTheme = localStorage.getItem("veriflow-theme") as Theme | null
    const savedDarkMode = localStorage.getItem("veriflow-darkmode") as DarkMode | null

    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }

    if (savedDarkMode) {
      setDarkModeState(savedDarkMode)
    }

    // Apply dark mode
    const applyDarkMode = (mode: DarkMode) => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const shouldBeDark = mode === "dark" || (mode === "system" && prefersDark)

      if (shouldBeDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      setIsDark(shouldBeDark)
    }

    applyDarkMode(savedDarkMode || "system")

    // Listen to system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      applyDarkMode(savedDarkMode || "system")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const handleSetTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("veriflow-theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const handleSetDarkMode = (mode: DarkMode) => {
    setDarkModeState(mode)
    localStorage.setItem("veriflow-darkmode", mode)

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = mode === "dark" || (mode === "system" && prefersDark)

    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    setIsDark(shouldBeDark)
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        darkMode,
        setDarkMode: handleSetDarkMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider")
  }
  return context
}
