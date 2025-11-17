
'use client';
import { useEffect } from 'react';
import App from '@/app/landing/app';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.classList.add('landing-page-body');
    return () => {
      document.body.classList.remove('landing-page-body');
    };
  }, []);

  // Force re-render on theme change to apply correct body styles
  useEffect(() => {
    // This is a bit of a trick to ensure styles re-apply on theme change
  }, [theme]);

  return <App />;
}
