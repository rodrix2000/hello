import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SparkMeet',
  description: 'Remember who you met and what to do next.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#FF7A1A',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
