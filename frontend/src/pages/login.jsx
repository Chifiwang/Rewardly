import { ArrowRight, Check, Lock, Eye, EyeOff, User, ShieldCheck } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

import "./login.css"

export function Login() {
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({
        utorid: '',
        password: ''
    });

    useEffect(() => {
        // Check for success message from registration
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the state to prevent showing message on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handle_change = (e) => {
        const { id, value } = e.target;
        console.log(`${id} ${value}`);
        setData({ ...data, [id]: value });
    };

    const handle_submit = (e) => {
        e.preventDefault();
        setError("");
        login(data.utorid, data.password)
        .then(message => {
          if (message) {
            setError(message);
            setIsSubmitting(false);
          } else {
            setIsSubmitting(true);
            setTimeout(() => {
              setIsSubmitting(false);
              navigate("/dashboard");
            }, 1500);
          }
        })
        .catch(() => setIsSubmitting(false));
    };

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // removes the #
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="login" role="main" aria-label="Login page">
      <section className="login__intro">
        <div className="login__badge">
          <ShieldCheck aria-hidden />
          <span>Secure portal</span>
        </div>
        <h1>Sign in to your loyalty workspace</h1>
        <p id="login-form">
          Access your personalized dashboard, shortcuts, and approvals. All activity is audited, so only verified
          teammates should log in.
        </p>
        <ul>
          <li>Single sign-on ready</li>
          <li>Session timeouts with device trust</li>
          <li>Role-based access baked in</li>
        </ul>
      </section>

      <section className="login__panel">
        <form className="login__form" onSubmit={handle_submit}>
          <div>
            <label htmlFor="utorid">Username</label>
            <div className="input-icon">
              <User aria-hidden />
              <Input id="utorid" name="utorid"
                    type="text" placeholder="utorid" autoComplete="username"
                    value={data.utorid}
                    onChange={handle_change}
                    required
                    aria-label="Username" />
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div className="input-icon" style={{ position: 'relative' }}>
              <Lock aria-hidden />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={data.password}
                onChange={handle_change}
                required
                aria-label="Password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--foreground)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </button>
            </div>
          </div>

          <div className="login__meta">
            <label className="remember">
              <input type="checkbox" name="remember" defaultChecked />
              <span className="checkmark" aria-hidden>
                <Check />
              </span>
              <span>Remember device</span>
            </label>
            <Link
              className="linkish"
              to={`/forgot-password${data.utorid ? `?utorid=${encodeURIComponent(data.utorid)}` : ""}`}
            >
              Forgot password?
            </Link>
          </div>

          <Button className="login__submit" type="submit">
            Continue to dashboard
            <ArrowRight aria-hidden />
          </Button>
          {successMessage && <p className="login__success" role="alert" style={{ color: "var(--primary)", marginTop: "0.5rem" }}>{successMessage}</p>}
          {error && <p className="login__error" role="alert">{error}</p>}
        </form>

        <p className="login__hint">
          Don't have access yet? <Link to="/request-demo">Request an invite</Link>
        </p>

      </section>

      {isSubmitting && (
        <div className="login__transition" role="status" aria-live="polite">
          <div className="login__dots" aria-hidden>
            <span className="login__dot" />
            <span className="login__dot" />
            <span className="login__dot" />
            <span className="login__dot" />
          </div>
          <p>Signing you in...</p>
        </div>
      )}
    </div>
  )
}
