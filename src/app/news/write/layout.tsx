import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Write an article',
  description: 'Share your story with the world.',
};

export default function WriteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
