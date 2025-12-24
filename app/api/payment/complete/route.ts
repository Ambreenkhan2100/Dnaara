import { NextResponse } from 'next/server';
import { uploadBase64ToSupabase } from '@/lib/utils/fileupload';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: Request) {
    try {

        const { id, file } = await request.json();

        if (!id || !file) {
            return NextResponse.json(
                { error: 'Payment ID and file are required' },
                { status: 400 }
            );
        }

        // 2. Upload File
        let fileUrl: string;
        try {
            fileUrl = await uploadBase64ToSupabase(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json(
                { error: 'Failed to upload document' },
                { status: 500 }
            );
        }

        const client = await pool.connect();
        try {
            const query = `
                UPDATE payments 
                SET 
                    payment_status = 'COMPLETED',
                    payment_document_url = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *;
            `;

            const result = await client.query(query, [fileUrl, id]);
            
            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Payment not found' },
                    { status: 404 }
                );
            }

            await client.query('COMMIT');
            return NextResponse.json(result.rows[0]);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error completing payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}