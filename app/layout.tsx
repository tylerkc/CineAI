import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CineAI',
  description: 'Movie recommendation interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0 h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}