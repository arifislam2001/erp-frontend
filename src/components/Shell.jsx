import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ListChecks, LogOut, Menu, UserRound, Users, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import { mediaUrl } from "../lib/format";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/people", label: "People", icon: Users },
  { to: "/tasks", label: "Tasks", icon: ListChecks, admin: true },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function Shell() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = links.filter((link) => !link.admin || isAdmin);

  return (
    <div className="min-h-screen bg-[#0c1210] text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/10 bg-[#101714] p-5 transition lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6a15d] font-semibold text-[#1b140b]">
                C
              </span>
              <div>
                <p className="font-semibold">Connet</p>
                <p className="text-xs text-stone-500">Port 9000</p>
              </div>
            </div>
            <button className="lg:hidden" type="button" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="mt-10 space-y-1">
            {nav.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-[#d6a15d] text-[#1b140b]"
                        : "text-stone-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <Avatar name={user?.username} src={mediaUrl(user?.profilePicture)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.username}</p>
                <p className="truncate text-xs capitalize text-stone-400">{user?.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-8">
            <button type="button" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <p className="text-sm text-stone-400">
              Signed in as <span className="text-stone-100">{user?.email}</span>
            </p>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#e7c48a]">
              {user?.role}
            </span>
          </header>
          <main className="px-5 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
