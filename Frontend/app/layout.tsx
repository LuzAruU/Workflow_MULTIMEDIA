import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/lib/app-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "veriflow",
  description: "Sistema profesional de gestión de proyectos enfocado en aseguramiento de la calidad",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <a href="/" className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-md p-1 hover:scale-105 transition-transform bg-card/60 backdrop-blur-sm">
          <img src="/icon.png" alt="veriflow" className="w-8 h-8 rounded" />
          <span className="hidden md:inline text-sm font-semibold">veriflow</span>
        </a>
        <AppProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
