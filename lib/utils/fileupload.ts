import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a base64 string to Supabase storage.
 * @param base64Data The base64 string (can include data URI scheme prefix).
 * @returns The public URL of the uploaded file.
 */
export async function uploadBase64ToSupabase(base64Data: string): Promise<string> {
    // Remove data URI scheme prefix if present (e.g., "data:image/png;base64,")
    const base64Content = base64Data.replace(/^data:.*;base64,/, '');

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Content, 'base64');

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Defaulting to .png if extension cannot be easily inferred, or just use a generic name.
    // Ideally we should detect mime type, but for now let's assume it's an image or just give it a generic extension or no extension if acceptable.
    // However, to be safe and simple, let's try to extract mime type if possible, or just use a bin extension.
    // Actually, let's try to infer extension from the prefix if it exists.

    let extension = 'bin';
    const match = base64Data.match(/^data:(.*);base64,/);
    if (match && match[1]) {
        const mimeType = match[1];
        const mimeMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'application/pdf': 'pdf',
            'text/plain': 'txt',
        };
        extension = mimeMap[mimeType] || 'bin';
    }

    const fileName = `${timestamp}-${randomString}.${extension}`;

    const { data, error } = await supabase
        .storage
        .from('Docs')
        .upload(fileName, buffer, {
            contentType: match ? match[1] : undefined,
            upsert: false
        });

    if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('Docs')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}
