
'use client';
import { useEffect } from 'react';
import App from '@/app/landing/app';

export default function Home() {
    useEffect(() => {
    document.body.classList.add('landing-page-body');
    return () => {
      document.body.classList.remove('landing-page-body');
    };
  }, []);
  return <App />;
}
