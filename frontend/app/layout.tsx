import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { DottedSurface } from '../components/ui/dotted-surface';
import { CustomCursor } from '../components/ui/CustomCursor';
import { ToastContainer } from '../components/ui/Toast';

// Body / UI — invisible, screen-optimized workhorse (matches Rabby, revoke.cash body)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Display / headings — Audex, a distinctive display face (local, self-hosted).
// Only Regular + Italic ship, so we map the Regular file across the weight range
// and let the browser synthesize heavier weights used by font-bold/font-black.
const audex = localFont({
  src: [
    { path: './fonts/Audex-Regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/Audex-Italic.ttf', weight: '400', style: 'italic' },
  ],
  variable: '--font-audex',
  display: 'swap',
});

// On-chain data — addresses, hashes, risk scores (security-platform standard)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sentinel | Web3 AI Security & Anti-Scam Shield',
  description: 'AI-powered blockchain security assistant. Analyzes transactions before signing, explaining risks in plain English.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${audex.variable} ${jetbrainsMono.variable} font-sans`}>
      <body className="bg-[#050505] text-white min-h-screen flex flex-col justify-between selection:bg-primary selection:text-white antialiased">
        <DottedSurface />
        <CustomCursor />
        
        <main className="relative z-10 flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="relative z-10 border-t border-[#1E1E1E] bg-[#050505]/90 py-8 text-xs text-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">SENTINEL AI</span>
              <span>— Next-Gen Web3 AI Security Shield</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            </div>
          </div>
        </footer>

        <ToastContainer />
      </body>
    </html>
  );
}
