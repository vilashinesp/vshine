"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  MessageCircle,
  Bell,
  Settings,
  User as UserIcon,
  Users,
  Scissors,
  LogOut,
} from "lucide-react";
import { logout } from "@/services/auth";

const CUSTOMER_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/booking", label: "Book a tailor", icon: Calendar },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

const TAILOR_NAV = [
  { href: "/tailor", label: "Overview", icon: LayoutDashboard },
  { href: "/tailor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/tailor/services", label: "Services", icon: Scissors },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tailors", label: "Tailors", icon: Scissors },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({
  role,
  children,
}: {
  role: "customer" | "tailor" | "admin";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "admin" ? ADMIN_NAV : role === "tailor" ? TAILOR_NAV : CUSTOMER_NAV;

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-chalk">
      <aside className="flex w-60 flex-col border-r border-ink/10 bg-chalk px-4 py-6">
        <Link href="/" className="px-2 font-display text-lg font-semibold">TailorMate</Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-ink text-chalk" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Log out
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
