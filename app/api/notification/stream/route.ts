import { notificationEmitter } from "@/lib/notificationEmitter";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return new Response("userId required", { status: 400 });
    }

    let isClosed = false;

    const stream = new ReadableStream({
        start(controller) {
            const heartbeat = setInterval(() => {
                if (!isClosed) {
                    controller.enqueue(": ping\n\n");
                }
            }, 25000);
            const send = (payload: any) => {
                if (isClosed) return;
                try {
                    controller.enqueue(
                        `data: ${JSON.stringify(payload)}\n\n`
                    );
                } catch {
                    isClosed = true;
                }
            };

            const listener = (event: any) => {
                if (event.userId === userId) {
                    send(event.data);
                }
            };

            notificationEmitter.on("notify", listener);

            return () => {
                isClosed = true;
                clearInterval(heartbeat);
                notificationEmitter.off("notify", listener);
            };
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
