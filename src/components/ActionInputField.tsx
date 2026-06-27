// src/components/ActionInputField.tsx (новый файл)
import React, { memo, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils'; 

type ActionInputFieldProps = {
    label: string;
    keyName: string;
    actionId: string;
    placeholder?: string;
    unit?: string;
    value: string | number | boolean | null;
    isError: boolean;
    handleNumberInput: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
};

const ActionInputField: React.FC<ActionInputFieldProps> = memo(({
    label,
    keyName,
    actionId,
    placeholder = '',
    unit = '',
    value,
    isError,
    handleNumberInput,
}) => {

    const [localValue, setLocalValue] = useState(value === null ? '' : value.toString());
    useEffect(() => {
        setLocalValue(value === null ? '' : value.toString());
    }, [value]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const numericRegex = /^-?\d*\.?\d*$/;
        if (numericRegex.test(value) || value === '' || value === '-' || value === '.') {
          setLocalValue(value);
        }
    };

    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleNumberInput(e, keyName);
    };

    return (
        <div className="flex items-center justify-between">
            <Label htmlFor={`${actionId}-${keyName}`} className="text-sm w-1/2 min-w-[40px] pr-2 shrink-0">{label}</Label>
            <div className="relative w-full"> 
                <Input 
                    id={`${actionId}-${keyName}`}
                    value={localValue} 
                    onChange={onChange}
                    onBlur={onBlur}
                    className={cn(
                        "bg-neutral-100/10 border-neutral-100/35  h-8 text-sm pr-10",
                        isError && 'border-red-500 ring-red-500',
                        unit === 'м/с' && 'pr-12' 
                    )}
                    placeholder={placeholder}
                    type="text"
                />
                {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-300">{unit}</span>}
            </div>
        </div>
    );
});

// Нам нужно экспортировать сам компонент
ActionInputField.displayName = 'ActionInputField';

export { ActionInputField };