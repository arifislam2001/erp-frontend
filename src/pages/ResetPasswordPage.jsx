import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthFrame from "../components/AuthFrame";
import { Alert, Button, Field, inputClass } from "../components/ui";
import api, { getErrorMessage } from "../api/client";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err, "Password reset failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Choose a new password"
      subtitle="This token comes from the reset email and expires after one hour."
      footer={
        <Link className="font-medium text-[#e7c48a]" to="/login">
          Go to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Alert>{error}</Alert> : null}
        {message ? <Alert tone="success">{message}</Alert> : null}
        <Field label="New password">
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Button className="w-full" type="submit" disabled={busy || !token}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthFrame>
  );
}
