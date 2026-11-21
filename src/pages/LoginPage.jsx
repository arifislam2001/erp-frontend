import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { Alert, Button, Field, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const needsVerify = /verify your email/i.test(error);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setInfo("");
    try {
      const response = await api.post("/auth/resend-verification", { email: form.email.trim() });
      setInfo(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not resend verification"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Use the email and password from your Node.js account. The account must be verified, and non-admin accounts must be approved."
      footer={
        <>
          New here?{" "}
          <Link className="font-medium text-[#e7c48a]" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        {info ? <Alert tone="success">{info}</Alert> : null}
        <Field label="Email">
          <input className={inputClass} name="email" type="email" value={form.email} onChange={onChange} required />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link className="text-stone-400 hover:text-[#e7c48a]" to="/forgot-password">
            Forgot password
          </Link>
        </div>
        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        {needsVerify ? (
          <Button className="w-full" type="button" variant="ghost" disabled={busy || !form.email} onClick={resend}>
            Resend verification email
          </Button>
        ) : null}
      </form>
    </AuthFrame>
  );
}
