import type React from "react"
import { Mona_Sans as FontSans, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { Toaster } from "@/components/ui/use-toast"
import "./globals.css"
import { Suspense } from "react"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata = {
  title: "Culinary AI - Professional Recipe Generator",
  description: "Generate professional, customized recipes using advanced AI technology",
  icons: {
    icon: "/favicon.ico",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${fontSans.variable} ${fontHeading.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
