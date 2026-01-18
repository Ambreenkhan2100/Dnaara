"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useLoader } from "@/components/providers/loader-provider";
import { useCallback, useMemo } from "react";

export function useRouterWithLoader() {
    const router = useNextRouter();
    const { showPageLoader } = useLoader();

    const push = useCallback(
        (href: string, options?: any) => {
            showPageLoader();
            router.push(href, options);
        },
        [router, showPageLoader]
    );

    const replace = useCallback(
        (href: string, options?: any) => {
            showPageLoader();
            router.replace(href, options);
        },
        [router, showPageLoader]
    );

    return useMemo(() => ({ ...router, push, replace }), [router, push, replace]);
}
