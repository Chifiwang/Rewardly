import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, ShieldCheck } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function ForgotPassword() {
  const [utorid, setUtorid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const passwordsMatch = useMemo(() => {
    return confirmPassword.length === 0 ? true : newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("utorid") || "";
    if (prefill) setUtorid(prefill);
  }, []);

  const submitNewPassword = async () => {
    setStatus("");
    setError("");
    if (!utorid.trim() || !newPassword.trim()) {
      setError("Username and password are required.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/auth/resets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utorid, password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setStatus("Password updated. You can now log in with the new password.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message || "Failed to reset password");
    }
  };

  return (
    <div className="login" role="main" aria-label="Forgot password page">
      <section className="login__intro">
        <div className="login__badge">
          <ShieldCheck aria-hidden />
          <span>Account recovery</span>
        </div>
        <h1>Reset your password</h1>
        <p>Request a reset token, then set a new password.</p>
      </section>

      <section className="login__panel">
        <div className="login__reset" style={{ display: 'grid', gap: '1rem' }}>
          <div className="login__badge" style={{ marginBottom: '0.25rem' }}>
            <KeyRound aria-hidden />
            <span>Reset password</span>
          </div>
          <label htmlFor="reset-utorid">Username</label>
          <Input
            id="reset-utorid"
            name="reset-utorid"
            placeholder="utorid"
            value={utorid}
            onChange={(e) => setUtorid(e.target.value)}
          />
          <label htmlFor="reset-password">New password</label>
          <Input
            id="reset-password"
            name="reset-password"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <p className="login__error" role="alert">Passwords do not match.</p>
          )}
          <Button variant="default" className="send-transfer" onClick={submitNewPassword} disabled={!passwordsMatch}>
            Update password
          </Button>

          {status && <p className="auth-meta" style={{ color: "var(--foreground)" }}>{status}</p>}
          {status && (
            <Button variant="default" className="send-transfer" asChild>
              <a href="/login">Back to login</a>
            </Button>
          )}
          {error && <p className="login__error" role="alert">{error}</p>}
        </div>
      </section>
    </div>
  );
}
