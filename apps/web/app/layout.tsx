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
      <body className="font-sans bg-sand min-h-full text-charcoal selection:bg-terra-50 flex flex-col items-center">
        <Providers>
          <div className="w-full max-w-[430px] md:max-w-none md:flex md:justify-center min-h-screen">
            <div className="w-full md:max-w-6xl md:px-8 lg:px-12">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
