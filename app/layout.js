import Header from '@/components/Header';
import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Reflect',
  description: 'A Journal app',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <div className='bg-[url("/bg.jpg")] opacity-50 fixed -z-10 inset-0' />
          {/* header component */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="bg-orange-300 py-12 bg-opacity-10">
            <div className="mx-auto px-4 text-center text-gray-900 italic flex justify-center gap-4 flex-wrap">
              <p>Made with 💖 by Ernest.</p>
              <p>copyright &copy; 2025 Reflect </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
