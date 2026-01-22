import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UseProfile } from '@/types';

interface UserState {
    userProfile: UseProfile | null;
    setUserProfile: (profile: UseProfile) => void;
    clearUserProfile: () => void;
    updateEmails: (emails: string[]) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            userProfile: null,
            setUserProfile: (profile) => set({ userProfile: profile }),
            clearUserProfile: () => set({ userProfile: null }),
            updateEmails: (emails) =>
                set((state) => ({
                    userProfile: state.userProfile
                        ? { ...state.userProfile, emails }
                        : null,
                })),
        }),
        {
            name: 'dnaara-user-storage',
        }
    )
);
