import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cheshire AI Trading Dashboard',
  description: 'AI-powered Solana trading dashboard for meme token analysis and automated trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <header className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-white">🐱 Cheshire</div>
                  <div className="text-sm text-gray-400">AI Trading Dashboard</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    Powered by SolanaTracker
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-800">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-gray-400">
                © 2024 Cheshire AI Trading Bot. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
