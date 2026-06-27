// components/ClientLayout.tsx
'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToasterProvider } from "@/components/helpers/ToasterProvider";
import { LogInterceptor } from "@/components/helpers/LogInterceptor";
import '@/locales/i18n';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const supported = ['en', 'ru', 'lv'];
    let lang = localStorage.getItem('lang');
    if (!lang) {
      lang = navigator.language.split('-')[0];
    }
    if (!supported.includes(lang)) lang = 'lv';
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).catch(console.error);
    }
  }, [i18n]);

  return (
    <>
      <main>{children}</main>
      <ToasterProvider /> 
      <LogInterceptor />
    </>
  );
}