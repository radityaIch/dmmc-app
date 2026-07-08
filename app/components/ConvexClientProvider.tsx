"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { convexAuthClient } from "@/app/lib/auth/client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
let initialTokenUsed = false;

export function ConvexClientProvider({
    children,
    initialToken,
}: {
    children: React.ReactNode;
    initialToken?: string | null;
}) {
    const useBetterAuth = useBetterAuthFromClient(initialToken);

    return (
        <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth}>
            {children}
        </ConvexProviderWithAuth>
    );
}

function useBetterAuthFromClient(initialToken?: string | null) {
    const [cachedToken, setCachedToken] = useState<string | null>(
        initialTokenUsed ? null : (initialToken ?? null),
    );
    const cachedTokenRef = useRef(cachedToken);
    const pendingTokenRef = useRef<Promise<string | null> | null>(null);

    useEffect(() => {
        if (!initialTokenUsed) {
            initialTokenUsed = true;
        }
    }, []);

    useEffect(() => {
        cachedTokenRef.current = cachedToken;
    }, [cachedToken]);

    return useMemo(
        () =>
            function useAuthFromBetterAuth() {
                const { data: session, isPending: isSessionPending } =
                    convexAuthClient.useSession();

                useEffect(() => {
                    if (!session && !isSessionPending && cachedTokenRef.current) {
                        cachedTokenRef.current = null;
                        setCachedToken(null);
                    }
                }, [session, isSessionPending]);

                const fetchAccessToken = useCallback(
                    async ({
                        forceRefreshToken = false,
                    }: { forceRefreshToken?: boolean } = {}) => {
                        if (cachedTokenRef.current && !forceRefreshToken) {
                            return cachedTokenRef.current;
                        }
                        if (!forceRefreshToken && pendingTokenRef.current) {
                            return pendingTokenRef.current;
                        }

                        pendingTokenRef.current = convexAuthClient.convex
                            .token({ fetchOptions: { throw: false } })
                            .then(({ data }) => {
                                const token = data?.token ?? null;
                                cachedTokenRef.current = token;
                                setCachedToken(token);
                                pendingTokenRef.current = null;
                                return token;
                            })
                            .catch(() => {
                                pendingTokenRef.current = null;
                                return null;
                            });

                        return pendingTokenRef.current;
                    },
                    [],
                );

                return useMemo(
                    () => ({
                        isLoading: isSessionPending,
                        isAuthenticated: !!session,
                        fetchAccessToken,
                    }),
                    [fetchAccessToken, isSessionPending, session],
                );
            },
        [],
    );
}
