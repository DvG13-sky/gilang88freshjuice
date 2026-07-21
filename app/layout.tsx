import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/common/QueryProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Gilang Fresh Juice',
  description: 'Sistem Tata Kelola Gerai Jus',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gilang Fresh Juice',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10B981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <QueryProvider>
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                fontSize: '14px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
