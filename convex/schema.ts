import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    event: defineTable({
        id: v.id("event"),
        approverUserId: v.optional(v.string()),
        organizerUserId: v.string(),
        name: v.string(),
        description: v.string(),
        datetime: v.string(),
        location: v.object({
            name: v.string(),
            address: v.string(),
            googleMapURL: v.string(),
        }),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
});