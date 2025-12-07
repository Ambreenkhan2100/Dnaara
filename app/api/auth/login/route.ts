import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

const ADMIN_EMAIL = 'admin@dnaara.com';
const ADMIN_PASSWORD = 'dnaaraAdmin123';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check for Admin Login
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = generateToken({ role: 'admin', email: ADMIN_EMAIL });
            return NextResponse.json({
                message: 'Login successful',
                token,
                user: { email: ADMIN_EMAIL, role: 'admin' },
                redirect: '/admin',
            });
        }

        // Check database for user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = generateToken({ userId: user.id, role: user.role, email: user.email });

        let redirectPath = '/';
        if (user.role === 'importer') redirectPath = '/importer';
        if (user.role === 'agent') redirectPath = '/agent';
        if (user.role === 'admin') redirectPath = '/admin';

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, role: user.role },
            redirect: redirectPath,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
