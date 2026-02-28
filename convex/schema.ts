import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    location: defineTable({
        id: v.id("location"),
        name: v.string(),
        address: v.string(),
        googleMapURL: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
    event: defineTable({
        id: v.id("event"),
        organizerId: v.string(),
        name: v.string(),
        description: v.string(),
        datetime: v.string(),
        location: v.id("location"),
        createdAt: v.number(),
        updatedAt: v.number(),
    }),
});