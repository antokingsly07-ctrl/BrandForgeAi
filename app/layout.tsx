// ============================================================
// BrandForge AI — Root Layout
// Loads fonts via next/font, provides global providers
// ============================================================
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ScrollProgress, GlobalAnimations } from '@/components/animations';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BrandForge AI — Turn your idea into a brand people remember',
  description: 'An AI-powered brand intelligence platform that transforms a rough idea into a complete, launch-ready brand system through a structured multi-agent workflow.',
  keywords: ['brand strategy', 'AI branding', 'brand identity', 'naming', 'positioning', 'visual identity'],
  authors: [{ name: 'BrandForge AI' }],
  openGraph: {
    title: 'BrandForge AI — Turn your idea into a brand people remember',
    description: 'Build a complete brand system with AI: discover, position, name, design, critique and launch.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08090B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#08090B] text-[#F5F5F5] font-sans antialiased">
        <ScrollProgress />
        <GlobalAnimations />
        {children}
      </body>
    </html>
  );
}
