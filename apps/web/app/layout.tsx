import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'InternalizePro - Learn Smarter, Remember Longer',
  description:
    'A science-backed learning app that helps you truly internalize knowledge through spaced repetition, schema building, and transfer practice.',
  keywords: [
    'learning',
    'flashcards',
    'spaced repetition',
    'memory',
    'study',
    'education',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
