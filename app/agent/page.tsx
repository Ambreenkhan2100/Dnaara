'use client';
import { useRouterWithLoader } from "@/hooks/use-router-with-loader";
import { useEffect } from "react";

export default function AgentPage() {
    const router = useRouterWithLoader()

    useEffect(() => {
        router.replace('/agent/shipments')
    }, [router])

    return <div>Agent Page</div>;
}