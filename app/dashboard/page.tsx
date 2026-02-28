import { api } from "@/convex/_generated/api";
import { preloadAuthQuery } from "@/app/lib/auth/server";
import { DashboardClient } from "./DashboardClient";


export default async function DashboardPage() {
    const preloadedUser = await preloadAuthQuery(api.auth.getCurrentUser);
    return <DashboardClient preloadedUser={preloadedUser} />;
}
