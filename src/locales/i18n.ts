import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ru from './ru.json';
import lv from './lv.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      lv: { translation: lv },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'lv'],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false, 
  });

export default i18n;
