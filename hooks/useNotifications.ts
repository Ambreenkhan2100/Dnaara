import { useEffect, useState } from "react";

interface Notification {
    id: string;
    type: string;
    data: any;
    createdAt: string;
}

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const es = new EventSource(
            `/api/notification/stream?userId=${userId}`
        );

        es.onopen = () => {
            console.log("SSE connected");
            setIsConnected(true);
        };

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data)
            setNotifications((prev) => [
                {
                    id: data.id,
                    type: data.type,
                    data,
                    createdAt: new Date().toISOString(),
                },
                ...prev,
            ]);
        };

        es.onerror = () => {
            console.error("SSE error");
            setIsConnected(false);
            es.close();
        };

        return () => {
            es.close();
        };
    }, [userId]);

    return { notifications, isConnected };
}
