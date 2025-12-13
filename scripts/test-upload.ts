import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env file in root BEFORE importing the file that uses them
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function test() {
    // Dynamic import to ensure env vars are loaded first
    const { uploadBase64ToSupabase } = await import('../lib/utils/fileupload');

    console.log('Testing uploadBase64ToSupabase...');

    // A small 1x1 transparent pixel PNG base64
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    try {
        const url = await uploadBase64ToSupabase(base64);
        console.log('Upload successful!');
        console.log('URL:', url);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

test();
