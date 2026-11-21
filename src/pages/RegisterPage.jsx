import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { Alert, Button, Field, inputClass } from "../components/ui";
import api, { getErrorMessage } from "../api/client";

const empty = {
  username: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  gender: "male",
  dob: "",
  role: "user",
};

export default function RegisterPage() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        gender: form.gender,
        role: form.role,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.address.trim()) payload.address = form.address.trim();
      if (form.dob) payload.dob = form.dob;

      const response = await api.post("/auth/registration", payload);
      setSuccess(response.data.message);
      setForm(empty);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Username is limited to 16 characters. Admin accounts can sign in after email verification. Employee and user accounts stay inactive until an admin approves them."
      footer={
        <>
          Already registered?{" "}
          <Link className="font-medium text-[#e7c48a]" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}
        <Field label="Username">
          <input className={inputClass} name="username" maxLength={16} value={form.username} onChange={onChange} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input className={inputClass} name="email" type="email" value={form.email} onChange={onChange} required />
          </Field>
          <Field label="Password">
            <input className={inputClass} name="password" type="password" value={form.password} onChange={onChange} required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gender">
            <select className={inputClass} name="gender" value={form.gender} onChange={onChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </Field>
          <Field label="Role">
            <select className={inputClass} name="role" value={form.role} onChange={onChange}>
              <option value="user">User</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input className={inputClass} name="phone" value={form.phone} onChange={onChange} />
          </Field>
          <Field label="Date of birth">
            <input className={inputClass} name="dob" type="date" value={form.dob} onChange={onChange} />
          </Field>
        </div>
        <Field label="Address">
          <input className={inputClass} name="address" value={form.address} onChange={onChange} />
        </Field>
        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? "Creating account…" : "Register"}
        </Button>
      </form>
    </AuthFrame>
  );
}
