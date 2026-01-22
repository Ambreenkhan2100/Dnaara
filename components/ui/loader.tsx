"use client";

import React from "react";
import { useLoader } from "@/components/providers/loader-provider";
import { Loader2 } from "lucide-react";

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils";


function Overlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-9999 bg-black/50",
                className
            )}
            {...props}
        />
    )
}

export const Loader = () => {
    const { isLoading, isPageLoading } = useLoader();

    if (!isLoading && !isPageLoading) return null;

    return (
        <DialogPrimitive.Root open={true}>
            <Overlay />
            <DialogPrimitive.Content className="fixed inset-0 z-9999 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <DialogPrimitive.Title className="sr-only opacity-0">Loading</DialogPrimitive.Title>
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                </div>
            </DialogPrimitive.Content>
        </DialogPrimitive.Root>
    );
};
