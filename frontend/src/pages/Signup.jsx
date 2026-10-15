import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendSignupOtp, verifySignupOtp } from "../services/authService";

export default function Signup() {
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { setSession } = useAuth();
  const nav = useNavigate();
  const otpRef = useRef(null);

  /* Countdown for "resend" */
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  /* Auto-focus OTP input */
  useEffect(() => {
    if (step === 2) otpRef.current?.focus();
  }, [step]);

  /* ================= STEP 1 — Send OTP ================= */
  const submitDetails = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || form.password.length < 6) {
      setError(
        "Please fill all fields. Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setLoading(true);
      await sendSignupOtp(form);
      setStep(2);
      setCountdown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2 — Verify OTP ================= */
  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await verifySignupOtp({
        email: form.email,
        otp,
      });
      setSession(data.token, data.user);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= Resend ================= */
  const resendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError("");
    try {
      setResending(true);
      await sendSignupOtp(form);
      setCountdown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div>
          <span className="eyebrow light">BEGIN YOUR JOURNEY</span>
          <h1>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h1>
        </div>
      </div>

      <div className="auth-panel">
        <Link className="brand" to="/" onClick={close}>
          HOTEL<span> OǴ </span>
        </Link>

        <div className="auth-content">
          {step === 1 ? (
            <>
              <span className="eyebrow">CREATE YOUR ACCOUNT</span>
              <h2>Join HOTELOG.</h2>

              <form className="auth-form" onSubmit={submitDetails}>
                {error && <div className="form-error">{error}</div>}

                <label>
                  Full name
                  <div className="input-icon">
                    <User />
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                </label>

                <label>
                  Email address
                  <div className="input-icon">
                    <Mail />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label>
                  Password
                  <div className="input-icon">
                    <Lock />
                    <input
                      required
                      minLength="6"
                      type={show ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShow(!show)}>
                      {show ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>

                <label className="check">
                  <input required type="checkbox" /> I agree to the terms and
                  privacy policy.
                </label>

                <button className="btn btn-full" disabled={loading}>
                  {loading ? "Sending code…" : "Send verification code"}
                </button>

                <p className="auth-switch">
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <span className="eyebrow">VERIFY YOUR EMAIL</span>
              <h2>Enter the code.</h2>

              <p
                style={{
                  color: "var(--muted)",
                  marginBottom: 20,
                  fontSize: 14,
                }}
              >
                We sent a 6-digit code to <strong>{form.email}</strong>.
              </p>

              <form className="auth-form" onSubmit={submitOtp}>
                {error && <div className="form-error">{error}</div>}

                <label>
                  Verification code
                  <input
                    ref={otpRef}
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    style={{
                      fontSize: 22,
                      letterSpacing: 8,
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  />
                </label>

                <button className="btn btn-full" disabled={loading}>
                  {loading ? "Verifying…" : "Verify & create account"}
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    style={{
                      display: "inline-flex",
                      gap: 5,
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    <ArrowLeft size={13} /> Change email
                  </button>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={resendOtp}
                    disabled={countdown > 0 || resending}
                    style={{
                      color: countdown > 0 ? "var(--muted)" : "var(--accent)",
                      display: "inline-flex",
                      gap: 5,
                      alignItems: "center",
                      opacity: countdown > 0 ? 0.6 : 1,
                    }}
                  >
                    <RotateCcw size={13} />
                    {resending
                      ? "Sending…"
                      : countdown > 0
                        ? `Resend in ${countdown}s`
                        : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
