"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface LoaderContextType {
    isLoading: boolean;
    isPageLoading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
    showPageLoader: () => void;
    hidePageLoader: () => void;
    fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const showLoader = useCallback(() => setIsLoading(true), []);
    const hideLoader = useCallback(() => setIsLoading(false), []);

    const showPageLoader = useCallback(() => setIsPageLoading(true), []);
    const hidePageLoader = useCallback(() => setIsPageLoading(false), []);

    const fetchFn = useCallback(
        async (input: RequestInfo | URL, init?: RequestInit) => {
            showLoader();
            try {
                init = init || {};

                const token = localStorage.getItem('token');
                const response = await fetch(input, {
                    ...init,
                    headers: {
                        'Content-Type': 'application/json',
                        ...init?.headers,
                        'Authorization': `Bearer ${token}`,
                    },
                });
                return response;
            } finally {
                hideLoader();
            }
        },
        [showLoader, hideLoader]
    );

    return (
        <LoaderContext.Provider value={{ isLoading, isPageLoading, showLoader, hideLoader, showPageLoader, hidePageLoader, fetchFn }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (context === undefined) {
        throw new Error("useLoader must be used within a LoaderProvider");
    }
    return context;
};
