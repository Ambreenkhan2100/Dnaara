"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useLoader } from "./loader-provider";

function PageLoaderListenerContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { hidePageLoader } = useLoader();

    useEffect(() => {
        hidePageLoader();
    }, [pathname, searchParams, hidePageLoader]);

    return null;
}

export function PageLoaderListener() {
    return (
        <Suspense fallback={null}>
            <PageLoaderListenerContent />
        </Suspense>
    );
}
