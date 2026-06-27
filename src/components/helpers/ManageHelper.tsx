// ManageHelper.tsx
"use client";

import React from 'react'; // Добавляем React
import { AnimatePresence, motion } from "framer-motion";
import { Settings2, MinusSquare } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useUIStore } from '@/store/uiStore';

interface ManageHelperProps {
    type: 'drone' | 'station';
}

export function ManageHelper({ type }: ManageHelperProps) {
    
    const isDrone = type === 'drone';
    const openDialog = useUIStore((s) => s.openDialog);

    const title = isDrone 
        ? 'Дроны не найдены' 
        : 'Станции не найдены';
        
    const description = isDrone
        ? 'Для работы необходимо добавить хотя бы один дрон.'
        : 'Для работы необходимо зарегистрировать хотя бы одну станцию.';
        
    const buttonText = isDrone ? 'Управление Дронами' : 'Управление Станциями';
    const Icon = isDrone ? Settings2 : MinusSquare; 

    const handleButtonClick = () => {
        if (isDrone) {
            openDialog("drone", "list");
        } else {
            openDialog("station", "list");
        }
    };


    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
            >
                <div
                    className="w-full lg:w-86 bg-neutral-800/75 backdrop-blur-xs
                               border border-yellow-400/75 rounded-lg shadow-xl
                               p-2 flex flex-col items-center gap-3 text-sm" 
                    role="alert"
                    aria-live="polite"
                    aria-label={`Warning: ${title}`}
                >
                    
                    <div className="text-center w-full">
                        <h4 className="font-semibold text-lg text-yellow-400">
                            {title}
                        </h4>
                    </div>
                    
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-2"
                        onClick={handleButtonClick}
                    >
                        <Settings2 className="h-4 w-4" />
                        {buttonText}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
