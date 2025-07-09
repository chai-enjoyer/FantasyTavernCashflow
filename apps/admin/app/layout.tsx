import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import MainContent from '@/components/MainContent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Администрирование Fantasy Tavern',
  description: 'Панель администратора для игры Fantasy Tavern Cashflow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <SidebarProvider>
            <Sidebar />
            <MainContent>
              {children}
            </MainContent>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}