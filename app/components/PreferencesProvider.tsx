"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Language = "id" | "en"
type Preferences = { language: Language; dark: boolean; toggleLanguage: () => void; toggleDark: () => void }
const PreferencesContext = createContext<Preferences | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("id")
  const [dark, setDark] = useState(false)
  useEffect(() => { if (window.localStorage.getItem("kopikarawang-language") === "en") setLanguage("en"); if (window.localStorage.getItem("kopikarawang-theme") === "dark") setDark(true) }, [])
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; window.localStorage.setItem("kopikarawang-theme", dark ? "dark" : "light") }, [dark])
  useEffect(() => { document.documentElement.lang = language; window.localStorage.setItem("kopikarawang-language", language) }, [language])
  const value = useMemo(() => ({ language, dark, toggleLanguage: () => setLanguage((current) => current === "id" ? "en" : "id"), toggleDark: () => setDark((current) => !current) }), [dark, language])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() { const context = useContext(PreferencesContext); if (!context) throw new Error("usePreferences must be used inside PreferencesProvider"); return context }
