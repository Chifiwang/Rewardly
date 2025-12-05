import { useEffect, useMemo, useState } from "react"
import { Tab } from "@/components/tab"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const roles = ["cashier", "manager", "superuser"]

export function Admin() {
  const [activeTab, setActiveTab] = useState("roles")
  const [promotionStatus, setPromotionStatus] = useState(null)
  const [users, setUsers] = useState([])
  const [utoridInput, setUtoridInput] = useState("")
  const [currentRole, setCurrentRole] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const { user } = useAuth();
  const [regData, setRegData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [regSelectedRole, setRegSelectedRole] = useState("regular");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;
    fetch(`${BACKEND_URL}/users?limit=200`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.results) setUsers(data.results);
      })
      .catch(() => {});
  }, [user]);

  const suggestions = useMemo(() => {
    const term = utoridInput.trim().toLowerCase();
    if (!term) return [];
    return users
      .filter(u => u.utorid.toLowerCase().includes(term))
      .slice(0, 5);
  }, [utoridInput, users]);

  const handleUtoridChange = (e) => {
    const value = e.target.value;
    setUtoridInput(value);
    setSelectedUser(null);
    setCurrentRole("");

    if (value.trim().length === 0) return;

    const localMatch = users.find(u => u.utorid.toLowerCase() === value.toLowerCase());
    if (localMatch) {
      setSelectedUser(localMatch);
      setCurrentRole(localMatch.role);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !user) return;
    setLoadingUser(true);
    fetch(`${BACKEND_URL}/users/${value}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setSelectedUser(data.user);
          setCurrentRole(data.user.role);
        }
      })
      .finally(() => setLoadingUser(false));
  };

  const handlePromote = (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    const utorid = data.get("userId");
    const role = data.get("role");
    const comments = data.get("comments");

    const token = localStorage.getItem("token");
    if (!token || !utorid || !role) return;

    fetch(`${BACKEND_URL}/users/${utorid}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ role, comments })
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.json().then(d => d.error || "Update failed");
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        setPromotionStatus(`Updated ${data.utorid} to ${data.role}.`);
        setUsers((prev) => {
          const filtered = prev.filter(u => u.utorid !== data.utorid);
          return [...filtered, { ...selectedUser, utorid: data.utorid, role: data.role }];
        });
        setSelectedUser({ ...selectedUser, role: data.role });
        setCurrentRole(data.role);
      })
      .catch((err) => setPromotionStatus(err.message))
      .finally(() => {
        event.target.reset()
        setUtoridInput(selectedUser?.utorid || utorid);
      });
  }

  const handleRegChange = (e) => {
    const { id, value } = e.target;
    setRegData((prev) => ({ ...prev, [id]: value }));
    if (regError) setRegError("");
    if (regSuccess) setRegSuccess("");
  };

  const validateReg = () => {
    if (regData.username.length < 3 || regData.username.length > 20) {
      setRegError("Username must be between 3 and 20 characters");
      return false;
    }
    if (!regData.firstname.trim() || !regData.lastname.trim()) {
      setRegError("First name and last name are required");
      return false;
    }
    if (regData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
      setRegError("Please enter a valid email address");
      return false;
    }
    if (regData.password.length < 6) {
      setRegError("Password must be at least 6 characters long");
      return false;
    }
    if (regData.password !== regData.confirmPassword) {
      setRegError("Passwords do not match");
      return false;
    }
    if (!regSelectedRole) {
      setRegError("Please select a role");
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!validateReg()) return;
    setRegSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const trimmedUsername = regData.username.trim();
      const fullName = `${regData.firstname.trim()} ${regData.lastname.trim()}`.trim();
      const emailValue = regData.email && regData.email.trim().length > 0 ? regData.email.trim() : `${trimmedUsername}@example.com`;
      const requestBody = { utorid: trimmedUsername, name: fullName, email: emailValue, password: regData.password };

      const res = await fetch(`${BACKEND_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(requestBody)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Registration failed");

      const roleRes = await fetch(`${BACKEND_URL}/users/${trimmedUsername}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: regSelectedRole })
      });
      const roleData = await roleRes.json();
      if (!roleRes.ok) throw new Error(roleData.error || "Role assignment failed");

      setRegSuccess(`Account created successfully for ${trimmedUsername}!`);
      setRegData({ username: "", firstname: "", lastname: "", email: "", password: "", confirmPassword: "" });
      setRegSelectedRole("regular");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setRegError(err.message || "Registration failed. Please try again.");
    }
    setRegSubmitting(false);
  };

  const effectiveRole = user?.role || "user";
  const canRegister = effectiveRole === "cashier" || effectiveRole === "manager" || effectiveRole === "superuser";

  return (
    <div className="admin-page">
      <div className="auth-hero hero-roomy">
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div onClick={() => setActiveTab("roles")} style={{ cursor: "pointer" }}>
            <Tab isOn={activeTab === "roles"}>Update role</Tab>
          </div>
          <div onClick={() => setActiveTab("register")} style={{ cursor: "pointer" }}>
            <Tab isOn={activeTab === "register"}>Register</Tab>
          </div>
        </div>
      </div>

      <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "1100px", padding: "1.5rem 0" }}>

          {activeTab === "roles" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ marginBottom: "0.35rem" }}>Promote or demote a user</h3>
                <p className="auth-meta">Update a user's role with proper validation.</p>
              </div>

              <form className="auth-card__form" onSubmit={handlePromote} style={{ display: "grid", gap: "1rem", background: "transparent", padding: 0, boxShadow: "none" }}>
                <label className="stack">
                  <span>User ID <span style={{ color: "var(--destructive)" }}>*</span></span>
                  <input
                    name="userId"
                    required
                    placeholder="utorid / user id"
                    value={utoridInput}
                    onChange={handleUtoridChange}
                    autoComplete="off"
                  />
                  {currentRole && (
                    <span className="auth-meta">Current role: {currentRole}</span>
                  )}
                  {loadingUser && <span className="auth-meta">Checking user…</span>}
                  {suggestions.length > 0 && (
                    <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {suggestions.map((u) => (
                        <button
                          type="button"
                          key={u.utorid}
                          onClick={() => { setUtoridInput(u.utorid); setCurrentRole(u.role); setSelectedUser(u); }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            border: "1px solid var(--border)",
                            borderRadius: "999px",
                            background: "var(--card)",
                            cursor: "pointer"
                          }}
                        >
                          {u.utorid} ({u.role})
                        </button>
                      ))}
                    </div>
                  )}
                </label>

                <label className="stack">
                  <span>Role <span style={{ color: "var(--destructive)" }}>*</span></span>
                  <select
                    name="role"
                    required
                    disabled={!selectedUser}
                    style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "0.5rem", background: !selectedUser ? "var(--muted)" : "var(--background)" }}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>

                <label className="stack">
                  <span>Comments (optional)</span>
                  <textarea
                    name="comments"
                    placeholder="Reason for the change"
                    disabled={!selectedUser}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.5rem",
                      minHeight: "80px",
                      background: !selectedUser ? "var(--muted)" : "var(--background)"
                    }}
                  />
                </label>

                <div className="form-actions" style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-start" }}>
                  <Button className="auth-btn" type="submit" size="sm" disabled={!selectedUser}>Update role</Button>
                </div>

                {promotionStatus && <p className="auth-meta" aria-live="polite">{promotionStatus}</p>}
              </form>
            </>
          )}

          {activeTab === "register" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ marginBottom: "0.35rem" }}>Register a new user</h3>
                <p className="auth-meta">Create an account and assign their role immediately.</p>
              </div>

              {!canRegister ? (
                <p className="auth-meta">You need cashier, manager, or superuser privileges to register users.</p>
              ) : (
                <>
                  {regSuccess && (
                    <div style={{
                      padding: "1rem",
                      marginBottom: "1.5rem",
                      background: "var(--success-bg, #d1fae5)",
                      border: "1px solid var(--success-border, #10b981)",
                      borderRadius: "8px",
                      color: "var(--success-text, #065f46)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <CheckCircle size={20} />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} style={{ display: "grid", gap: "1.25rem" }}>
                    <div className="stack">
                      <label htmlFor="username">
                        Username <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter username (utorid)"
                          value={regData.username}
                          onChange={handleRegChange}
                          required
                          disabled={regSubmitting}
                          minLength={3}
                          maxLength={20}
                          style={{ paddingLeft: "2.5rem" }}
                        />
                        <User 
                          size={18} 
                          style={{ 
                              position: "absolute", 
                              left: "0.75rem", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "var(--muted-foreground)"
                          }} 
                        />
                      </div>
                      <span className="auth-meta">3-20 characters, used for login</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="stack">
                        <label htmlFor="firstname">
                          First Name <span style={{ color: "var(--destructive)" }}>*</span>
                        </label>
                        <Input
                          id="firstname"
                          type="text"
                          placeholder="First name"
                          value={regData.firstname}
                          onChange={handleRegChange}
                          required
                          disabled={regSubmitting}
                        />
                      </div>

                      <div className="stack">
                        <label htmlFor="lastname">
                          Last Name <span style={{ color: "var(--destructive)" }}>*</span>
                        </label>
                        <Input
                          id="lastname"
                          type="text"
                          placeholder="Last name"
                          value={regData.lastname}
                          onChange={handleRegChange}
                          required
                          disabled={regSubmitting}
                        />
                      </div>
                    </div>

                    <div className="stack">
                      <label htmlFor="email">Email</label>
                      <div style={{ position: "relative" }}>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com (optional)"
                          value={regData.email}
                          onChange={handleRegChange}
                          disabled={regSubmitting}
                          style={{ paddingLeft: "2.5rem" }}
                        />
                        <Mail 
                          size={18} 
                          style={{ 
                              position: "absolute", 
                              left: "0.75rem", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "var(--muted-foreground)"
                          }} 
                        />
                      </div>
                    </div>

                    <div className="stack">
                      <label>
                        Role <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {["regular", "cashier", "manager", "superuser"].map((role) => (
                          <Button
                            key={role}
                            type="button"
                            variant={regSelectedRole === role ? "default" : "outline"}
                            onClick={() => setRegSelectedRole(role)}
                            disabled={regSubmitting}
                            style={{ textTransform: "capitalize" }}
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="stack">
                      <label htmlFor="password">
                        Password <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          value={regData.password}
                          onChange={handleRegChange}
                          required
                          disabled={regSubmitting}
                          minLength={6}
                          style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                        />
                        <Lock 
                          size={18} 
                          style={{ 
                              position: "absolute", 
                              left: "0.75rem", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "var(--muted-foreground)"
                          }} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={regSubmitting}
                          style={{
                              position: "absolute",
                              right: "0.75rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--muted-foreground)",
                              padding: "0.25rem"
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <span className="auth-meta">Must be at least 6 characters</span>
                    </div>

                    <div className="stack">
                      <label htmlFor="confirmPassword">
                        Confirm Password <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={regData.confirmPassword}
                          onChange={handleRegChange}
                          required
                          disabled={regSubmitting}
                          minLength={6}
                          style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                        />
                        <Lock 
                          size={18} 
                          style={{ 
                              position: "absolute", 
                              left: "0.75rem", 
                              top: "50%", 
                              transform: "translateY(-50%)",
                              color: "var(--muted-foreground)"
                          }} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={regSubmitting}
                          style={{
                              position: "absolute",
                              right: "0.75rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--muted-foreground)",
                              padding: "0.25rem"
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {regError && (
                      <div style={{ 
                          padding: "0.75rem 1rem", 
                          background: "var(--destructive-bg, #fee2e2)", 
                          border: "1px solid var(--destructive, #ef4444)",
                          borderRadius: "6px",
                          color: "var(--destructive, #dc2626)",
                          fontSize: "0.875rem"
                      }}>
                        {regError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <Button 
                          type="submit" 
                          disabled={regSubmitting}
                          className="send-transfer"
                          style={{ flex: 1 }}
                      >
                          {regSubmitting ? (
                              <>Creating Account...</>
                          ) : (
                              <>
                                  <UserPlus size={18} />
                                  Create Account
                              </>
                          )}
                      </Button>
                      <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                              setRegData({
                                  username: '',
                                  firstname: '',
                                  lastname: '',
                                  email: '',
                                  password: '',
                                  confirmPassword: ''
                              });
                              setRegSelectedRole("regular");
                              setRegError("");
                              setRegSuccess("");
                          }}
                          disabled={regSubmitting}
                      >
                          Clear
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>

  )
}
