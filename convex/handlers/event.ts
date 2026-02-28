import { mutation, query } from "../_generated/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../betterAuth/auth";

// ─── helpers ──────────────────────────────────────────────

async function requireAuth(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return identity;
}

// ─── queries ──────────────────────────────────────────────

/** List approved events (public) with organizer info. */
export const listApproved = query({
    args: {},
    handler: async (ctx) => {
        const events = await ctx.db
            .query("event")
            .withIndex("by_status", (q) => q.eq("status", "approved"))
            .order("desc")
            .collect();

        const uniqueIds = [...new Set(events.map((e) => e.organizerUserId))];
        const userMap = new Map<
            string,
            { name: string; image: string | null }
        >();

        await Promise.all(
            uniqueIds.map(async (uid) => {
                const user = await authComponent.getAnyUserById(ctx, uid);
                userMap.set(uid, {
                    name: user?.name ?? "Unknown",
                    image: user?.image ?? null,
                });
            }),
        );

        return events.map((e) => ({
            ...e,
            organizer: userMap.get(e.organizerUserId) ?? {
                name: "Unknown",
                image: null,
            },
        }));
    },
});

/** List events created by the authenticated user. */
export const listMine = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        return ctx.db
            .query("event")
            .withIndex("by_organizer", (q) =>
                q.eq("organizerUserId", identity.subject),
            )
            .order("desc")
            .collect();
    },
});

/** List ALL events with resolved organizer info (admin-only query —
 *  role check happens in the admin layout server-side). */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);
        const events = await ctx.db.query("event").order("desc").collect();

        // Resolve organizer profiles in parallel (name + image only, no PII)
        const uniqueIds = [...new Set(events.map((e) => e.organizerUserId))];
        const userMap = new Map<
            string,
            { name: string; image: string | null }
        >();

        await Promise.all(
            uniqueIds.map(async (uid) => {
                const user = await authComponent.getAnyUserById(ctx, uid);
                userMap.set(uid, {
                    name: user?.name ?? "Unknown",
                    image: user?.image ?? null,
                });
            }),
        );

        return events.map((e) => ({
            ...e,
            organizer: userMap.get(e.organizerUserId) ?? {
                name: "Unknown",
                image: null,
            },
        }));
    },
});

/** Get a single event by ID. */
export const getById = query({
    args: { id: v.id("event") },
    handler: async (ctx, { id }) => {
        return ctx.db.get(id);
    },
});

// ─── mutations ────────────────────────────────────────────

/** Create a new event (status starts as "pending"). */
export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        datetime: v.string(),
        location: v.object({
            name: v.string(),
            address: v.string(),
            googleMapURL: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await requireAuth(ctx);
        const now = Date.now();
        return ctx.db.insert("event", {
            organizerUserId: identity.subject,
            name: args.name,
            description: args.description,
            datetime: args.datetime,
            location: args.location,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Update an event (only the organizer can update their own event). */
export const update = mutation({
    args: {
        id: v.id("event"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        datetime: v.optional(v.string()),
        location: v.optional(
            v.object({
                name: v.string(),
                address: v.string(),
                googleMapURL: v.string(),
            }),
        ),
    },
    handler: async (ctx, { id, ...updates }) => {
        const identity = await requireAuth(ctx);
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Event not found");
        if (existing.organizerUserId !== identity.subject) {
            throw new Error("Only the organizer can edit this event");
        }
        const patch: Record<string, unknown> = { updatedAt: Date.now() };
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.description !== undefined)
            patch.description = updates.description;
        if (updates.datetime !== undefined) patch.datetime = updates.datetime;
        if (updates.location !== undefined) patch.location = updates.location;
        await ctx.db.patch(id, patch);
    },
});

/** Delete an event (only the organizer can delete their own event). */
export const remove = mutation({
    args: { id: v.id("event") },
    handler: async (ctx, { id }) => {
        const identity = await requireAuth(ctx);
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Event not found");
        if (existing.organizerUserId !== identity.subject) {
            throw new Error("Only the organizer can delete this event");
        }
        await ctx.db.delete(id);
    },
});

// ─── admin mutations ──────────────────────────────────────

/** Approve an event (admin sets status to "approved"). */
export const approve = mutation({
    args: { id: v.id("event") },
    handler: async (ctx, { id }) => {
        const identity = await requireAuth(ctx);
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Event not found");
        await ctx.db.patch(id, {
            status: "approved",
            approverUserId: identity.subject,
            updatedAt: Date.now(),
        });
    },
});

/** Reject / remove an event (admin sets status to "removed"). */
export const adminRemove = mutation({
    args: { id: v.id("event") },
    handler: async (ctx, { id }) => {
        const identity = await requireAuth(ctx);
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Event not found");
        await ctx.db.patch(id, {
            status: "removed",
            removerUserId: identity.subject,
            updatedAt: Date.now(),
        });
    },
});
