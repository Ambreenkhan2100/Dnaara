'use client';

import { UserProfileComponent } from '@/components/shared/user-profile-component';
import { Card, CardContent } from '@/components/ui/card';

export default function ImporterProfilePage() {
    return (
        <div className="container mx-auto py-8">
            <UserProfileComponent />
        </div>
    );
}
