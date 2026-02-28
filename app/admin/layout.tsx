import { redirect } from "next/navigation";
import { isAuthenticated, fetchAuthQuery } from "@/app/lib/auth/server";
import { api } from "@/convex/_generated/api";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authed = await isAuthenticated();
    if (!authed) redirect("/auth");

    // Fetch the current user to check their role
    const user = await fetchAuthQuery(api.handlers.auth.getCurrentUser);
    if (!user || user.role !== "admin") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
