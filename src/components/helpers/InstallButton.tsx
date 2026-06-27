"use client"

import { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Предотвращаем автоматическое появление окна
      e.preventDefault();
      // Сохраняем событие для вызова позже
      setDeferredPrompt(e);
      // Показываем твою кнопку
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = async () => {
    if (!deferredPrompt) return;

    // Показываем системное окно установки
    deferredPrompt.prompt();

    // Ждем ответа пользователя (установил или отменил)
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);

    // Очищаем, так как событие одноразовое
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button 
      onClick={onClick}
      className="fixed bottom-5 right-5 z-50 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-2xl transition-all"
    >
      Install App 🚀
    </button>
  );
}