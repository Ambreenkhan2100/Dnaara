import { notificationEmitter } from "@/lib/notificationEmitter";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return new Response("userId required", { status: 400 });
    }

    let isClosed = false;

    let heartbeat: NodeJS.Timeout;
    let listener: (event: any) => void;

    const stream = new ReadableStream({
        start(controller) {
            heartbeat = setInterval(() => {
                if (!isClosed) {
                    try {
                        controller.enqueue(": ping\n\n");
                    } catch {
                        cleanup();
                    }
                }
            }, 25000);

            const send = (payload: any) => {
                if (isClosed) return;
                try {
                    controller.enqueue(
                        `data: ${JSON.stringify(payload)}\n\n`
                    );
                } catch {
                    cleanup();
                }
            };

            listener = (event: any) => {
                if (event.userId === userId) {
                    send(event.data);
                }
            };

            notificationEmitter.on("notify", listener);
        },
        cancel() {
            cleanup();
        },
    });

    function cleanup() {
        if (isClosed) return;
        isClosed = true;
        clearInterval(heartbeat);
        notificationEmitter.off("notify", listener);
    }

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
