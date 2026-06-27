"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, Mail, Globe } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export function ContactsDialog() {
  const {t} = useTranslation();
  const { dialogOpen, dialogType, closeDialog } = useUIStore();

  const isOpen = dialogOpen && dialogType === "contacts";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="contacts-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-md"
            onClick={closeDialog}
          />
          <motion.div
            key="contacts-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 z-[1600] -translate-x-1/2 -translate-y-1/2
                       w-[350px] xl:w-[400px] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden font-jura"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-white tracking-wider">{t('support')}</h2>
              <Button variant="ghost" size="icon" onClick={closeDialog} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-8 flex flex-col items-center gap-6 text-center">
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                  <Phone className="h-6 w-6 text-blue-400" />
                  <div className="text-left">
                    <p className="text-xs text-neutral-500 uppercase">{t('emergencycall')}</p>
                    <p className="text-lg text-neutral-200">+371 26 447 446</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                  <Mail className="h-6 w-6 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-xs text-neutral-500 uppercase">{t('email')}</p>
                    <p className="text-lg text-neutral-200">info@hi-technologies.lv</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50 transition-colors hover:bg-neutral-800/80">
                  <Globe className="h-6 w-6 text-indigo-400" />
                  <div className="text-left flex flex-col">
                    <p className="text-xs text-neutral-500 uppercase">{t('website')}</p>
                    <a 
                      href="https://hi-technologies.lv" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg text-neutral-200 hover:text-white hover:underline underline-offset-4 transition-all"
                    >
                      hi-technologies.lv
                    </a>
                  </div>
                </div>

              </div>

              <div className="rounded-2xl shadow-inner">
                 <div className="w-32 h-32 xl:w-64 xl:h-64 flex items-center justify-center rounded-lg">
                    <img 
                       src="/whatsappQR.svg" 
                       alt="WhatsApp QR" 
                       className="w-32 h-32 xl:w-64 xl:h-64"
                    />
                 </div>
              </div>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest">{t('wahint')}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}