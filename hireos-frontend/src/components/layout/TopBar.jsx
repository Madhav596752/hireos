import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Search, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATIONS } from "@/data/dummy";
import { useAuth } from "@/context/AuthContext";

export default function TopBar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header
            className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 glass"
            data-testid="dashboard-topbar"
        >
            <div className="h-full px-4 md:px-8 flex items-center gap-3">
                <Button
                    variant="ghost" size="icon"
                    className="lg:hidden" onClick={onMenuClick}
                    data-testid="topbar-menu-btn"
                >
                    <Menu className="h-4 w-4" />
                </Button>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search candidates, jobs, messages…"
                        className="pl-9 h-9 bg-secondary/60 border-transparent focus-visible:bg-card"
                        data-testid="topbar-search-input"
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <Link to="/app/jobs" className="hidden sm:inline-flex">
                        <Button size="sm" data-testid="topbar-create-job-btn">
                            <Plus className="h-4 w-4 mr-1" /> New job
                        </Button>
                    </Link>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative" data-testid="topbar-notifications-btn">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {NOTIFICATIONS.map((n) => (
                                <DropdownMenuItem key={n.id} className="flex-col items-start gap-1 py-3">
                                    <span className="text-sm">{n.text}</span>
                                    <span className="text-xs text-muted-foreground">{n.time} ago</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ThemeToggle />

                    {/* User menu — real data from useAuth() */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 px-2 gap-2" data-testid="topbar-user-menu">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                                    <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
                                </Avatar>
                                <span className="hidden md:block text-sm font-medium">
                                    {user?.name ?? "..."}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user?.name}</span>
                                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                                    <span className="text-xs text-muted-foreground capitalize mt-0.5">
                                        {user?.role?.toLowerCase()}
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/app/settings">
                                    <User className="h-4 w-4 mr-2" /> Profile settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Badge variant="secondary" className="mr-2">FREE</Badge>
                                Growth plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="h-4 w-4 mr-2" /> Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

