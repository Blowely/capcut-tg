import type { Metadata } from 'next'
import './globals.css'
import { TelegramProvider } from '@/providers/TelegramProvider'

export const metadata: Metadata = {
  title: 'CapCut Mini App',
  description: 'Видеоредактор для Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  )
}



