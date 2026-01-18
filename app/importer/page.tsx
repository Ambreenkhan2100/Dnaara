'use client';
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";
import { useEffect } from "react";

export default function ImporterPage() {
    const router = useRouterWithLoader()

    useEffect(() => {
        router.replace('/importer/shipments')
    }, [router])

    return <div>Importer Page</div>;
}
