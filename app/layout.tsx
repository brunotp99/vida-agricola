import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Vida Agrícola | Mercado Natural - Agricultural & Poultry Supplies',
  description: 'Your trusted source for agricultural supplies, animal feed, poultry equipment, veterinary products, and farm essentials. Quality products for farmers and livestock owners.',
  keywords: 'agricultural supplies, animal feed, poultry equipment, farm tools, veterinary products, livestock feed, farming equipment',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
