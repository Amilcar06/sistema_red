import React, { forwardRef } from 'react';
import { Label } from './label';
import { Input } from './input';
import { cn } from './utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    id: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        return (
            <div className={cn("space-y-2", className)}>
                <Label htmlFor={id}>{label}</Label>
                <Input id={id} ref={ref} {...props} className={cn(error && "border-destructive")} />
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
