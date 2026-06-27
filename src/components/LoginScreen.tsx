// LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/locales/i18n'
import { login } from '@/config/clientApi'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { User, Lock, Eye, EyeOff, Globe } from "lucide-react"

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'en');
  
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastAttemptRef = useRef<string | null>(null);

  const changeLanguage = async (lng: string) => {
    if (i18n.language === lng) return;
    try {
      localStorage.setItem('lang', lng);
      await i18n.changeLanguage(lng);
  
      setCurrentLang(lng);
    } catch (err) {
      console.error("i18n changeLanguage error:", err);
      
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoggingIn) return;

    const { email, password } = credentials;
    if (!email || !password) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const user = await login(email, password);
      console.log(`User logged in: ${user.name} (${user.role})`);
      onLoginSuccess();
    } catch (error: any) {
      if (!error.status) {
        setLoginError(t('serverError'));
        return;
      }

      if (error.status === 401) {
        setLoginError(t('invalidCredentials'));
        return;
      }

      if (error.status === 404) {
        setLoginError(t('userNotFound'));
        return;
      }

      setLoginError(t('loginFailed'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (!credentials.email || !credentials.password) return;
    if (isLoggingIn) return;

    const fingerprint = credentials.email + "|" + credentials.password;
    if (lastAttemptRef.current === fingerprint) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      lastAttemptRef.current = fingerprint;
      handleLogin();
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [credentials, isLoggingIn]);

  return (
    <div className="absolute inset-0 z-[3000] flex items-center justify-center backdrop-blur-xs">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg shadow-lg p-8 w-[380px] flex flex-col gap-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div></div>
          <h2 className="font-abel text-2xl">
            <span className="text-xl font-bold tracking-tighter text-emerald-500">Lsl</span>{" "}
            <span className="text-xl font-bold tracking-tighter text-white">mission</span>
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-0 bg-neutral-800 border-none text-white z-[3100]">
              <DropdownMenuItem 
                onClick={() => {
                  changeLanguage("lv");
                  document.documentElement.lang = "lv";
                }}>
                  LV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  changeLanguage("ru");
                  document.documentElement.lang = "ru";
                }}>RU</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  changeLanguage("en");
                  document.documentElement.lang = "en";
                }}>
                  EN
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder={t("username")}
            autoComplete="username"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            className="pl-10 bg-neutral-100/10 border-neutral-100/30 focus-visible:ring-primary focus-visible:ring-2"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            autoComplete="current-password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="pl-10 pr-10 bg-neutral-100/10 border-neutral-100/30 focus-visible:ring-primary focus-visible:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
          >
            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {loginError && !isLoggingIn && (
          <p className="text-red-500 text-md text-center">
            {loginError}
          </p>
        )}

        <button type="submit" className="hidden" />
      </form>
    </div>
  )
}