import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { Alert, Button, Field, inputClass } from "../components/ui";
import api, { getErrorMessage } from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post("/auth/forgot-password", { email: email.trim() });
      setMessage(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset email"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Reset access"
      subtitle="If the email is registered, the API sends a link to /reset-password. Point CLIENT_URL at this frontend so the link opens here."
      footer={
        <Link className="font-medium text-[#e7c48a]" to="/login">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        <Field label="Email">
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthFrame>
  );
}
