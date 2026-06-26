import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
                <TopBar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 p-6 md:p-8 lg:p-10" data-testid="dashboard-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
