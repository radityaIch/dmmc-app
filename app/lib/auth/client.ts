import { adminClient, genericOAuthClient } from "better-auth/client/plugins"
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const convexAuthClient = createAuthClient({
    plugins: [convexClient()],
});

export const authClient = createAuthClient({
    plugins: [convexClient(), adminClient(), genericOAuthClient()],
});
