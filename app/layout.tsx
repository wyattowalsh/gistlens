import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GistLens - Beautiful GitHub Gist Viewer',
  description: 'View and share GitHub gists with syntax highlighting and markdown preview',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
