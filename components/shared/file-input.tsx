'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileInputProps {
    label?: string;
    value?: string;
    onChange: (fileName: string) => void;
    accept?: string;
    className?: string;
    disabled?: boolean;
}

export function FileInput({
    label,
    value,
    onChange,
    accept,
    className,
    disabled,
}: FileInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file.name);
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-2">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="flex items-center gap-2"
                >
                    <Upload className="h-4 w-4" />
                    Choose File
                </Button>
                {value && (
                    <span className="text-sm text-muted-foreground truncate max-w-xs">{value}</span>
                )}
            </div>
        </div>
    );
}

