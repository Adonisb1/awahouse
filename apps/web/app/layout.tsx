import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400','700','900'],
  style: ['normal','italic'],
});

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
});

const dmMono = DM_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono', 
  weight: ['400','500'] 
});

export const metadata: Metadata = {
  title: 'Awahouse — Lagos Verified Property Marketplace',
  description: 'Nigeria\'s verified property marketplace. Multi-layer verified listings, escrow protection, and rent monthly.',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C4531C',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full`}
    >
      <body className="font-sans bg-sand min-h-full text-charcoal selection:bg-terra-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
