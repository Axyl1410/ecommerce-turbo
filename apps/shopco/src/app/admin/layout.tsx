import React from "react";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import AdminAuthGuard from "@/components/admin/admin-auth-guard";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthGuard>
            <SidebarProvider>
                <AdminSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminAuthGuard>
    );
}
