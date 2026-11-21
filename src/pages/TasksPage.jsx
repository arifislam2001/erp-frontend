import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import { TASK_STATUSES, formatDate, statusLabel } from "../lib/format";
import { Alert, Button, Field, Modal, inputClass } from "../components/ui";

const blankTask = {
  title: "",
  description: "",
  deadline: "",
  status: "todo",
  assignedPerson: "",
};

const personId = (person) => {
  if (person && typeof person === "object") {
    return person.id || person._id || "";
  }
  return person || "";
};

const personLabel = (person) => {
  if (person && typeof person === "object") {
    return person.username || person.name || person.email || "Unassigned";
  }
  return "";
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [people, setPeople] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(blankTask);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [taskResponse, userResponse] = await Promise.all([
      api.get("/task/alltask"),
      api.get("/dashboard/alluser").catch((err) => {
        if (err.response?.status === 404) return { data: { data: { user: [] } } };
        throw err;
      }),
    ]);
    setTasks(taskResponse.data?.data || []);
    setPeople(userResponse.data?.data?.user || []);
  };

  useEffect(() => {
    load().catch((err) => setError(getErrorMessage(err, "Could not load tasks")));
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const onCreate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/task/create", {
        title: form.title.trim(),
        description: form.description,
        deadline: form.deadline || undefined,
        status: form.status,
        assignedPerson: form.assignedPerson || null,
      });
      setNotice(response.data.message);
      setForm(blankTask);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create task"));
    } finally {
      setBusy(false);
    }
  };

  const openTask = async (task) => {
    setError("");
    try {
      const response = await api.get(`/task/task/${task._id}`);
      const record = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      setEditing({
        ...blankTask,
        ...record,
        id: record._id,
        assignedPerson: personId(record.assignedPerson),
        deadline: record.deadline || "",
        description: record.description || "",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not open task"));
    }
  };

  const saveTask = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await api.patch(`/task/taskUpdate/${editing.id}`, {
        title: editing.title.trim(),
        description: editing.description,
        deadline: editing.deadline || null,
        status: editing.status,
        assignedPerson: editing.assignedPerson || null,
      });
      setNotice(response.data.message);
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update task"));
    } finally {
      setBusy(false);
    }
  };

  const removeTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    try {
      const response = await api.delete(`/task/taskdelete/${id}`);
      setNotice(response.data.message);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete task"));
    }
  };

  const personName = (assignment) => {
    const label = personLabel(assignment);
    if (label !== "") return label;

    const id = String(personId(assignment) || "");
    if (!id) return "Unassigned";

    const person = people.find((item) => String(personId(item)) === id);
    return person?.username || person?.name || person?.email || "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#d6a15d]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Tasks</h1>
        <p className="mt-2 text-sm text-stone-400">Titles stay under 30 characters. Deadlines cannot be before today.</p>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <form className="grid gap-4 rounded-2xl border border-white/10 bg-[#121a17] p-5 lg:grid-cols-6" onSubmit={onCreate}>
        <div className="lg:col-span-2">
          <Field label="Title">
            <input className={inputClass} maxLength={30} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </Field>
        </div>
        <div className="lg:col-span-2">
          <Field label="Assign">
            <select className={inputClass} value={form.assignedPerson} onChange={(event) => setForm({ ...form, assignedPerson: event.target.value })}>
              <option value="">Unassigned</option>
              {people.map((person) => (
                <option key={personId(person)} value={personId(person)}>
                  {person.username}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {TASK_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deadline">
          <input className={inputClass} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
        </Field>
        <div className="lg:col-span-5">
          <Field label="Description">
            <textarea className={`${inputClass} min-h-20`} maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
        </div>
        <div className="flex items-end">
          <Button className="w-full" type="submit" disabled={busy}>
            Add task
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({tasks.length})
        </FilterChip>
        {TASK_STATUSES.map((status) => (
          <FilterChip key={status.value} active={filter === status.value} onClick={() => setFilter(status.value)}>
            {status.label}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-3">
        {visible.map((task) => (
          <article key={task._id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#121a17] p-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{task.title}</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-stone-300">{statusLabel(task.status)}</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">{task.description || "No description"}</p>
              <p className="mt-3 text-xs text-stone-500">
                Due {formatDate(task.deadline)} · Assigned to {personName(task.assignedPerson)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" type="button" onClick={() => openTask(task)}>
                Edit
              </Button>
              <Button variant="danger" type="button" onClick={() => removeTask(task._id)}>
                Delete
              </Button>
            </div>
          </article>
        ))}
        {!visible.length ? <p className="py-8 text-sm text-stone-500">Nothing in this list.</p> : null}
      </div>

      {editing ? (
        <Modal title="Update task" onClose={() => setEditing(null)}>
          <form className="space-y-4" onSubmit={saveTask}>
            <Field label="Title">
              <input className={inputClass} maxLength={30} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-24`} maxLength={500} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select className={inputClass} value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}>
                  {TASK_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Deadline">
                <input className={inputClass} type="date" value={editing.deadline} onChange={(event) => setEditing({ ...editing, deadline: event.target.value })} />
              </Field>
            </div>
            <Field label="Assign">
              <select className={inputClass} value={editing.assignedPerson} onChange={(event) => setEditing({ ...editing, assignedPerson: event.target.value })}>
                <option value="">Unassigned</option>
                {people.map((person) => (
                  <option key={personId(person)} value={personId(person)}>
                    {person.username}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" disabled={busy}>
              Save changes
            </Button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-[#d6a15d] text-[#1b140b]" : "bg-white/10 text-stone-300 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
