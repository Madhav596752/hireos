import { Outlet } from "react-router-dom";
import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

export default function MarketingLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <MarketingNav />
            <main className="flex-1">
                <Outlet />
            </main>
            <MarketingFooter />
        </div>
    );
}
