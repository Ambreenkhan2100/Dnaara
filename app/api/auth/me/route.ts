import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = verifyToken(token);

        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Optional: Verify user still exists in DB
        // For admin, we might not have a DB entry if it's hardcoded, so check role first
        if (decoded.role === 'admin') {
            return NextResponse.json({
                user: {
                    email: decoded.email,
                    role: 'admin'
                }
            });
        }

        console.log('decoded: ', decoded);


        const result = await query('SELECT id, email, role, username FROM users WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            }
        });

    } catch (error) {
        console.error('Error verifying token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
