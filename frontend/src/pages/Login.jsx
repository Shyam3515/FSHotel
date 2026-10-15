import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      nav(loc.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div>
          <span className="eyebrow light">WELCOME TO HOTELÉ</span>
          <h1>
            Stay somewhere
            <br />
            <em>you'll remember.</em>
          </h1>
        </div>
      </div>

      <div className="auth-panel">
        <Link className="brand" to="/" onClick={close}>
          HOTEL<span> OǴ </span>
        </Link>

        <div className="auth-content">
          <span className="eyebrow">Sign in to continue your journey.</span>
          <h2>Welcome back.</h2>

          <form className="auth-form" onSubmit={submit}>
            {error && <div className="form-error">{error}</div>}

            <label>
              Email address
              <div className="input-icon">
                <Mail />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label>
              Password
              <div className="input-icon">
                <Lock />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>

            <div className="form-row">
              <label className="check">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="btn btn-full" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="auth-switch">
              New to HOTELOǴ? <Link to="/signup">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
