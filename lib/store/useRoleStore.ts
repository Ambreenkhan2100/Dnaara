'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoleKey } from '@/lib/constants';

interface RoleState {
    currentRole: RoleKey | null;
    currentUserId: string | null;
    setRole: (role: RoleKey, userId: string) => void;
    clearRole: () => void;
}

export const useRoleStore = create<RoleState>()(
    persist(
        (set) => ({
            currentRole: null,
            currentUserId: null,
            setRole: (role, userId) => set({ currentRole: role, currentUserId: userId }),
            clearRole: () => set({ currentRole: null, currentUserId: null }),
        }),
        {
            name: 'dnaara-role-storage',
        }
    )
);

