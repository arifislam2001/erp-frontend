import { useState } from "react";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { mediaUrl } from "../lib/format";
import { Alert, Avatar, Button, Field, inputClass } from "../components/ui";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    address: user?.address || "",
    gender: user?.gender || "male",
    dob: user?.dob || "",
  });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("username", form.username.trim());
      body.append("phone", form.phone.trim());
      body.append("address", form.address.trim());
      body.append("gender", form.gender);
      if (form.dob) body.append("dob", form.dob);
      if (picture) body.append("picture", picture);

      const response = await api.patch("/auth/update-profile", body);
      setNotice(response.data.message);
      setPicture(null);
      setPreview("");
      await refreshProfile();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update profile"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#d6a15d]">Account</p>
        <h1 className="mt-2 text-3xl font-semibold">Profile</h1>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <form className="space-y-5 rounded-2xl border border-white/10 bg-[#121a17] p-6" onSubmit={onSubmit}>
        <div className="flex items-center gap-4">
          <Avatar name={form.username} src={preview || mediaUrl(user?.profilePicture)} size="lg" />
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm capitalize text-stone-400">{user?.role}</p>
            <label className="mt-2 inline-block cursor-pointer text-sm text-[#e7c48a]">
              Change photo
              <input
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setPicture(file);
                  setPreview(file ? URL.createObjectURL(file) : "");
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username">
            <input className={inputClass} name="username" maxLength={16} value={form.username} onChange={onChange} required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} name="phone" value={form.phone} onChange={onChange} />
          </Field>
          <Field label="Gender">
            <select className={inputClass} name="gender" value={form.gender} onChange={onChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <input className={inputClass} name="dob" type="date" value={form.dob?.slice?.(0, 10) || ""} onChange={onChange} />
          </Field>
        </div>
        <Field label="Address">
          <input className={inputClass} name="address" value={form.address} onChange={onChange} />
        </Field>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
