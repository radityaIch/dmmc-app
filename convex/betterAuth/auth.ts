import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { admin, genericOAuth } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

const whatsappDiscoveryUrl =
    "https://wahost-api.zeabur.app/.well-known/openid-configuration";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
    components.betterAuth,
    {
        local: { schema },
        verbose: false,
    },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
    return {
        appName: "DMMC",
        baseURL: process.env.SITE_URL,
        secret: process.env.BETTER_AUTH_SECRET,
        database: authComponent.adapter(ctx),
        emailAndPassword: {
            enabled: false,
        },
        user: {
            additionalFields: {
                whatsappSub: {
                    type: "string",
                    required: false,
                    input: false,
                },
                waGroupId: {
                    type: "string",
                    required: false,
                    input: false,
                },
                waGroupName: {
                    type: "string",
                    required: false,
                    input: false,
                },
                waGroupVerified: {
                    type: "boolean",
                    required: false,
                    input: false,
                },
            },
        },
        plugins: [
            convex({ authConfig }),
            admin(),
            genericOAuth({
                config: [
                    {
                        providerId: "whatsapp",
                        discoveryUrl: whatsappDiscoveryUrl,
                        issuer: "https://wahost-api.zeabur.app",
                        clientId: process.env.WHATSAPP_OAUTH_CLIENT as string,
                        clientSecret: process.env.WHATSAPP_OAUTH_SECRET as string,
                        scopes: ["offline_access", "openid", "profile", "wa:group"],
                        pkce: true,
                        overrideUserInfo: true,
                        mapProfileToUser: (profile) => {
                            const sub = String(profile.sub ?? profile.id ?? "");
                            return {
                                id: sub,
                                name: String(profile.name ?? sub),
                                email: sub,
                                emailVerified: true,
                                whatsappSub: sub,
                                waGroupId:
                                    typeof profile.wa_group_id === "string"
                                        ? profile.wa_group_id
                                        : undefined,
                                waGroupName:
                                    typeof profile.wa_group_name === "string"
                                        ? profile.wa_group_name
                                        : undefined,
                                waGroupVerified:
                                    typeof profile.wa_group_verified === "boolean"
                                        ? profile.wa_group_verified
                                        : undefined,
                            };
                        },
                    },
                ],
            }),
        ],
    } satisfies BetterAuthOptions;
};

// For `@better-auth/cli`
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth(createAuthOptions(ctx));
};
