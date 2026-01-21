import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentReminders } from '@/lib/paymentReminderService';

// This endpoint should be called by a cron job every 15 minutes
// Example: */15 * * * * curl -X POST https://your-domain.com/api/cron/payment-reminders

export async function POST(request: NextRequest) {
    try {
        // Verify the request is from a trusted source (optional but recommended)
        // const authHeader = request.headers.get('authorization');
        // const cronSecret = process.env.CRON_SECRET;

        // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        //     return NextResponse.json(
        //         { error: 'Unauthorized' },
        //         { status: 401 }
        //     );
        // }

        console.log('Starting payment reminder check...');
        const startTime = Date.now();

        await checkPaymentReminders();

        const duration = Date.now() - startTime;
        console.log(`Payment reminder check completed in ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: 'Payment reminders checked successfully',
            duration: `${duration}ms`
        });

    } catch (error) {
        console.error('Error in payment reminder cron job:', error);

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
