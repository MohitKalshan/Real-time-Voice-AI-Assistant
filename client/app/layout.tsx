import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Relay',
  description: 'Talk to an AI and hear it answer, in real time.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

/**
 * Sets data-theme before first paint so a dark-mode user never sees a light flash.
 * Mirrors hooks/useTheme.ts, which takes over after hydration.
 */
const themeBootstrap = `try{var s=JSON.parse(localStorage.getItem('sse-chat-ai:settings')||'{}').theme||'system';var d=s==='dark'||(s==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
