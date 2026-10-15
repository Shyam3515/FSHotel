import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-auth">
      <div className="simple-auth-card">
        <Link className="brand" to="/">
          HOTEL<span> OǴ </span>
        </Link>

        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Forgot your password?</h1>
        <p>Enter your email and we'll send instructions to reset it.</p>

        {error && <div className="form-error">{error}</div>}

        {sent ? (
          <div className="success-box">
            Check your inbox for password reset instructions.
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>
              Email address
              <div className="input-icon">
                <Mail />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <button className="btn btn-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link className="back-link center-link" to="/login">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
