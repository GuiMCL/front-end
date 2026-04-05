import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chá de Panela',
  description: 'Lista de presentes para chá de panela',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
