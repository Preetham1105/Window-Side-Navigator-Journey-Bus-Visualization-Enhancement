import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Window-Side Navigator | Catch the shade. Skip the glare.',
  description: 'Sit on the shady side of your bus or car by matching your route to the sun\'s path using astronomical calculations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased flex flex-col justify-between">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
