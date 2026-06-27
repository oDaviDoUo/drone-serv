"use client";

import { Toaster } from "@/components/ui/sonner";
import '@/app/globals.css'

export function ToasterProvider() {
  return <Toaster
    position="top-center" richColors expand={true} offset='4rem'
  />;
}
