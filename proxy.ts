import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
        );
        return { userId: payload.userId as string };
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function proxy(req: NextRequest) {
    // Skipping proxy for auth-related routes
    if (req.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'No token provided' },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1];
    const verified = await verifyToken(token);

    if (!verified) {
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }

    // Add user ID to request headers for API routes to use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', verified.userId);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: ["/api/:path*"]
};