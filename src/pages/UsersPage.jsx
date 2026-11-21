import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, mediaUrl } from "../lib/format";
import { Alert, Avatar, Button, Field, Modal, inputClass } from "../components/ui";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [selected, setSelected] = useState(null);
  const [rename, setRename] = useState(null);
  const [mail, setMail] = useState(null);

  const load = async (term = query) => {
    try {
      const response = await api.get("/dashboard/alluser", {
        params: term ? { search: term } : {},
      });
      setUsers(response.data?.data?.user || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setUsers([]);
        setError("");
        return;
      }
      setError(getErrorMessage(err, "Could not load users"));
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const openUser = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const response = await api.get(`/dashboard/single-user/${id}`);
      setSelected(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load user"));
    } finally {
      setBusyId("");
    }
  };

  const runAction = async (id, path, successText) => {
    setBusyId(id);
    setNotice("");
    setError("");
    try {
      const response = await api.patch(path);
      setNotice(response.data.message || successText);
      await load();
      if (selected && (selected._id === id || selected.id === id)) {
        setSelected(response.data.data || selected);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Action failed"));
    } finally {
      setBusyId("");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    setBusyId(id);
    setNotice("");
    setError("");
    try {
      const response = await api.delete(`/dashboard/delete-user/${id}`);
      setNotice(response.data.message);
      setSelected(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete user"));
    } finally {
      setBusyId("");
    }
  };

  const saveName = async (event) => {
    event.preventDefault();
    setBusyId(rename.id);
    setError("");
    try {
      const response = await api.patch(`/dashboard/update/${rename.id}`, {
        username: rename.username.trim(),
      });
      setNotice(response.data.message);
      setRename(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update username"));
    } finally {
      setBusyId("");
    }
  };

  const sendMail = async (event) => {
    event.preventDefault();
    setBusyId(mail.id);
    setError("");
    try {
      const response = await api.post(`/dashboard/mail-user/${mail.id}`, {
        senderEmail: mail.senderEmail.trim(),
        subject: mail.subject.trim(),
        body: mail.body.trim(),
      });
      setNotice(response.data.message);
      setMail(null);
    } catch (err) {
      setError(getErrorMessage(err, "Email failed"));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#d6a15d]">Directory</p>
          <h1 className="mt-2 text-3xl font-semibold">People</h1>
        </div>
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
            load(search.trim());
          }}
        >
          <input
            className={inputClass}
            placeholder="Search name, email, or role"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-stone-400">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((person) => (
              <tr key={person.id} className="bg-[#121a17]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={person.username} src={mediaUrl(person.profilePicture)} size="sm" />
                    <div>
                      <p className="font-medium">{person.username}</p>
                      <p className="text-stone-500">{person.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-stone-300">{person.role}</td>
                <td className="px-4 py-3">
                  <span className={person.status ? "text-emerald-300" : "text-amber-200"}>
                    {person.status ? "Approved" : "Waiting"}
                  </span>
                  <p className="text-xs text-stone-500">
                    {person.isEmailVerified ? "Email verified" : "Email unverified"}
                  </p>
                </td>
                <td className="px-4 py-3 text-stone-400">{formatDate(person.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" type="button" onClick={() => openUser(person.id)} disabled={busyId === person.id}>
                      View
                    </Button>
                    {isAdmin ? (
                      <>
                        {person.status ? (
                          <Button
                            variant="ghost"
                            type="button"
                            disabled={busyId === person.id}
                            onClick={() => runAction(person.id, `/dashboard/deactive-user/${person.id}`)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            type="button"
                            disabled={busyId === person.id}
                            onClick={() => runAction(person.id, `/dashboard/approved-user/${person.id}`)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setRename({ id: person.id, username: person.username })}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() =>
                            setMail({
                              id: person.id,
                              senderEmail: person.email,
                              subject: "",
                              body: "",
                            })
                          }
                        >
                          Mail
                        </Button>
                        <Button variant="danger" type="button" onClick={() => removeUser(person.id)}>
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length ? <p className="bg-[#121a17] px-4 py-10 text-center text-sm text-stone-500">No matching people.</p> : null}
      </div>

      {selected ? (
        <Modal title={selected.username || "User"} onClose={() => setSelected(null)}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Email" value={selected.email} />
            <Detail label="Role" value={selected.role} />
            <Detail label="Phone" value={selected.phone} />
            <Detail label="Gender" value={selected.gender} />
            <Detail label="Date of birth" value={selected.dob} />
            <Detail label="Address" value={selected.address} />
            <Detail label="Approved" value={selected.status ? "Yes" : "No"} />
            <Detail label="Verified" value={selected.isEmailVerified ? "Yes" : "No"} />
          </dl>
        </Modal>
      ) : null}

      {rename ? (
        <Modal title="Update username" onClose={() => setRename(null)}>
          <form className="space-y-4" onSubmit={saveName}>
            <Field label="Username">
              <input
                className={inputClass}
                maxLength={16}
                value={rename.username}
                onChange={(event) => setRename({ ...rename, username: event.target.value })}
                required
              />
            </Field>
            <Button type="submit" disabled={busyId === rename.id}>
              Save
            </Button>
          </form>
        </Modal>
      ) : null}

      {mail ? (
        <Modal title="Send email" onClose={() => setMail(null)}>
          <form className="space-y-4" onSubmit={sendMail}>
            <Field label="Recipient">
              <input
                className={inputClass}
                type="email"
                value={mail.senderEmail}
                onChange={(event) => setMail({ ...mail, senderEmail: event.target.value })}
                required
              />
            </Field>
            <Field label="Subject">
              <input
                className={inputClass}
                value={mail.subject}
                onChange={(event) => setMail({ ...mail, subject: event.target.value })}
                required
              />
            </Field>
            <Field label="Message">
              <textarea
                className={`${inputClass} min-h-28`}
                value={mail.body}
                onChange={(event) => setMail({ ...mail, body: event.target.value })}
                required
              />
            </Field>
            <Button type="submit" disabled={busyId === mail.id}>
              Send
            </Button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">{label}</dt>
      <dd className="mt-1 text-stone-100">{value || "—"}</dd>
    </div>
  );
}
