import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    event: defineTable({
        organizerUserId: v.string(),
        approverUserId: v.optional(v.string()),
        removerUserId: v.optional(v.string()),
        name: v.string(),
        description: v.string(),
        datetime: v.string(),
        location: v.object({
            name: v.string(),
            address: v.string(),
            googleMapURL: v.string(),
        }),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("removed"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_organizer", ["organizerUserId"])
        .index("by_status", ["status"])
        .index("by_status_datetime", ["status", "datetime"]),
});