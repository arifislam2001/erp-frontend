import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, statusLabel } from "../lib/format";
import { Alert } from "../components/ui";

function Stat({ label, value, hint }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-stone-50">{value}</p>
      <p className="mt-2 text-sm text-stone-400">{hint}</p>
    </article>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const userResponse = await api.get("/dashboard/alluser");
        if (!ignore) setUsers(userResponse.data?.data?.user || []);
      } catch (err) {
        if (err.response?.status !== 404 && !ignore) {
          setError(getErrorMessage(err, "Could not load people"));
        }
      }

      if (!isAdmin) return;
      try {
        const taskResponse = await api.get("/task/alltask");
        if (!ignore) setTasks(taskResponse.data?.data || []);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err, "Could not load tasks"));
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  const pending = users.filter((person) => !person.status).length;
  const verified = users.filter((person) => person.isEmailVerified).length;
  const openTasks = tasks.filter((task) => task.status !== "done" && task.status !== "archieve").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#d6a15d]">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold">Hello, {user?.username}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
          {isAdmin
            ? "You can approve people, send mail, and manage every task."
            : "Your account is active. Task management and account approval stay with an admin."}
        </p>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Directory" value={users.length} hint="Other accounts you can see" />
        <Stat label="Waiting approval" value={pending} hint="Status is still inactive" />
        <Stat label="Verified emails" value={verified} hint="Among the directory" />
        <Stat label="Open tasks" value={isAdmin ? openTasks : "—"} hint={isAdmin ? "To do and pending" : "Admin only"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#121a17] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent people</h2>
            <Link className="text-sm text-[#e7c48a]" to="/people">
              Open directory
            </Link>
          </div>
          <ul className="divide-y divide-white/10">
            {users.slice(0, 5).map((person) => (
              <li key={person.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{person.username}</p>
                  <p className="text-stone-500">{person.email}</p>
                </div>
                <span className="capitalize text-stone-400">{person.role}</span>
              </li>
            ))}
            {!users.length ? <li className="py-6 text-sm text-stone-500">No other accounts yet.</li> : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121a17] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Tasks</h2>
            {isAdmin ? (
              <Link className="text-sm text-[#e7c48a]" to="/tasks">
                Manage tasks
              </Link>
            ) : null}
          </div>
          {isAdmin ? (
            <ul className="divide-y divide-white/10">
              {tasks.slice(0, 5).map((task) => (
                <li key={task._id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-stone-500">{formatDate(task.deadline || task.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-stone-300">
                    {statusLabel(task.status)}
                  </span>
                </li>
              ))}
              {!tasks.length ? <li className="py-6 text-sm text-stone-500">No tasks yet.</li> : null}
            </ul>
          ) : (
            <p className="py-6 text-sm leading-6 text-stone-400">
              The task routes require an admin token. Your role is {user?.role}.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
