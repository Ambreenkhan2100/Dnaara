"use client";

import Link, { LinkProps } from "next/link";
import React from "react";
import { useLoader } from "@/components/providers/loader-provider";

interface LinkWithLoaderProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export function LinkWithLoader({
    children,
    onClick,
    ...props
}: LinkWithLoaderProps) {
    const { showPageLoader } = useLoader();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        showPageLoader();
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <Link {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
