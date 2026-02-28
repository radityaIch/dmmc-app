import { query, QueryCtx } from "./_generated/server"
import { authComponent } from "./betterAuth/auth"

export const getCurrentUser = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        return authComponent.getAuthUser(ctx)
    }
})