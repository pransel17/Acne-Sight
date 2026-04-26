import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"


import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: "ACNE SIGHT | Clinical Acne Detection System",
  description: "Automated detection and severity assessment of acne vulgaris lesions using YOLOv8 algorithm",
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // FIX 2: Added suppressHydrationWarning to stop the giant red terminal error
    <html lang="en" className="dark" suppressHydrationWarning>
      
      {/* FIX 3: Added flex and min-h-screen to support your dashboard layout */}
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased flex min-h-screen`}>
        {children}
      </body>
    </html>
  )
}