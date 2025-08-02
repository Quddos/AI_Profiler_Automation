import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProfileDash",
  description: "Role-Based Profile Management Dashboard",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  themeColor: "#FCD34D", // yellow-400
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="w-full flex items-center justify-center py-4 bg-white/80 border-b border-yellow-200">
            <img src="/logo.png" alt="App Logo" className="h-12 w-12 mr-2" />
            <span className="text-2xl font-bold text-blue-800">ProfileDash</span>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
