import { Link } from "react-router-dom";

export default function AuthFrame({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-[#0c1210] lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/10 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#3d4f3a_0%,transparent_42%),linear-gradient(160deg,#17211c,#0c1210_70%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/login" className="flex items-center gap-3 text-stone-100">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6a15d] font-semibold text-[#1b140b]">
              C
            </span>
            <span className="text-lg font-semibold tracking-tight">Connet</span>
          </Link>
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d6a15d]">Workspace</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-50">
              People, approvals, and tasks in one desk.
            </h1>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              Sign in against the API on port 9000. Admins approve accounts, assign work, and mail the team from here.
            </p>
          </div>
          <p className="text-xs text-stone-500">API · localhost:9000/api/v1</p>
        </div>
      </aside>
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold text-stone-100">Connet</p>
          </div>
          <h2 className="text-3xl font-semibold text-stone-50">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-stone-400">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
