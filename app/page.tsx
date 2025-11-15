'use client';

import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Building2, UserCheck } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { setRole } = useRoleStore();

  const handleRoleSelect = (role: 'admin' | 'importer' | 'agent', userId: string) => {
    setRole(role, userId);
    router.push(`/${role}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#0bad85' }}>
            Dnaara Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to continue
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 mb-4" style={{ color: '#0bad85' }} />
              <CardTitle>Admin</CardTitle>
              <CardDescription>
                Manage users, transactions, balances, and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleRoleSelect('admin', 'a1')}
                style={{ backgroundColor: '#0bad85' }}
              >
                Enter Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 mb-4" style={{ color: '#0bad85' }} />
              <CardTitle>Importer</CardTitle>
              <CardDescription>
                Create requests, manage agents, and track your imports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleRoleSelect('importer', 'i1')}
                style={{ backgroundColor: '#0bad85' }}
              >
                Enter Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <UserCheck className="h-12 w-12 mb-4" style={{ color: '#0bad85' }} />
              <CardTitle>Agent</CardTitle>
              <CardDescription>
                Accept requests, submit final bayan, and manage importers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleRoleSelect('agent', 'ag1')}
                style={{ backgroundColor: '#0bad85' }}
              >
                Enter Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
