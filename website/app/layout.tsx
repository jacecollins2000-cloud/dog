import type { Metadata } from 'next';
import Script from 'next/script';
import { arrivalBootstrap } from './arrival-bootstrap';
import { arrivalDiagnostics } from './arrival-diagnostics';
import { ArrivalDiagnosticPanel } from './arrival-diagnostic-panel';
import { Anton, DM_Mono, Manrope } from 'next/font/google';
import './globals.css';
import './redesign.css';
import './refinement.css';
import './arrival-frame.css';

const bodyFont = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

const posterFont = Anton({
  variable: '--font-poster',
  subsets: ['latin'],
  weight: '400',
});

const monoFont = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});


export const metadata: Metadata = {
  title: 'Guerrilla Camp — Live Different!!',
  description:
    'Guerrilla Camp. Athletic roots, individual expression, and the people who stand with you. A private brand and collection concept.',
  robots: { index: false, follow: false },
  // The full-colour mark carries its own black oval and white keyline, so it reads on light and dark browser tabs.
  icons: {
    icon: [
      { url: '/assets/gc-mark-ink.svg', type: 'image/svg+xml' },
      { url: '/assets/gc-favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/assets/gc-apple-touch-180.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        id="top"
        className={`${bodyFont.variable} ${posterFont.variable} ${monoFont.variable} antialiased`}
      >
        <Script id="gc-arrival-diagnostic" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: arrivalDiagnostics }} />
        <Script id="gc-arrival-boot" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: arrivalBootstrap }} />
        <div className="arrival-veil" aria-hidden="true" />
        <div className="arrival-light-wash" aria-hidden="true" />
        {children}
        <ArrivalDiagnosticPanel />
      </body>
    </html>
  );
}
