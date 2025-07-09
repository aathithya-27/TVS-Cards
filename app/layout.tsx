import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TVS Channel Partner Helpdesk',
  description: 'TVS Channel Partner Helpdesk',
  generator: 'TVS Channel Partner Helpdesk',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
